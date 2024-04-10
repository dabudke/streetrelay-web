import {
  SessionAuthenticationError,
  authenticateSessionToken,
  sessionTokenURI,
  tokenKey,
} from "$lib/server/auth";
import prisma from "$lib/server/prisma";
import { fail, redirect } from "@sveltejs/kit";
import * as bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { DateTime } from "luxon";
import { UAParser } from "ua-parser-js";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, cookies }) => {
  const redirectTo = url.searchParams.get("r");
  const { userID, freshLogin, error } = await authenticateSessionToken(
    cookies.get("session")
  );

  switch (error) {
    case SessionAuthenticationError.InvalidSession:
      return {
        userID,
        error:
          "You have been logged out from another device. Please log in again.",
      };
    case SessionAuthenticationError.ExpiredSession:
      return {
        userID,
        error: "Your session has expired. Please log in again.",
      };
    case SessionAuthenticationError.BadToken:
      cookies.delete("session", { path: "/" });
      break;
  }

  if (freshLogin === false)
    return {
      userID,
      error: "To access sensitive account information, please log in again.",
    };

  if (!error) redirect(301, redirectTo ?? "/");

  return { userID };
};

export const actions: Actions = {
  default: async ({ request, url, cookies, getClientAddress }) => {
    const redirectTo = url.searchParams.get("r") ?? "/",
      { sessionID: oldSessionID } = await authenticateSessionToken(
        cookies.get("session")
      );

    const data = await request.formData();

    const usernameOrEmail = data.get("usernameOrEmail") as string | undefined,
      password = data.get("password") as string | undefined;

    const uaHeader = request.headers.get("user-agent"),
      ua = uaHeader == null ? uaHeader : new UAParser(uaHeader);

    if (!usernameOrEmail || !password) {
      return fail(400, {
        username: usernameOrEmail,
        error: {
          usernameOrEmail: !usernameOrEmail
            ? "Please input a username or email"
            : null,
          password: !password ? "Please input a password" : null,
        },
      });
    }
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            id: usernameOrEmail,
          },
          {
            email: usernameOrEmail,
            emailVerified: true,
          },
        ],
      },
    });

    if (!user) {
      return fail(400, {
        username: usernameOrEmail,
        error: {
          usernameOrEmail: "Invalid username or email.",
          password: null,
        },
      });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return fail(400, {
        username: usernameOrEmail,
        error: { usernameOrEmail: null, password: "Incorrect password" },
      });
    }

    const loginTime = DateTime.now().startOf("second");

    if (oldSessionID) {
      const session = await prisma.session.findUnique({
        where: { id: oldSessionID, userID: user.id },
      });
      if (session) {
        await prisma.session.update({
          where: { id: oldSessionID },
          data: {
            lastLogin: loginTime.toJSDate(),
          },
        });

        const sessionToken = await new SignJWT({
          aud: sessionTokenURI,
          iat: loginTime.toSeconds(),
          sub: user.id,
          jti: session.id,
        })
          .setProtectedHeader({ alg: "HS256" })
          .sign(tokenKey);
        cookies.set("session", sessionToken, { path: "/" });

        throw redirect(303, redirectTo);
      }
    }

    const session = await prisma.session.create({
      data: {
        userID: user.id,
        name: ua
          ? `${ua.getBrowser().name} on ${ua.getOS().name}`
          : "Unknown Device",
        ip: getClientAddress(),
        device: ua?.getDevice().type ?? "desktop",
        lastLogin: loginTime.toJSDate(),
      },
    });
    const sessionToken = await new SignJWT({
      aud: sessionTokenURI,
      iat: loginTime.toSeconds(),
      sub: user.id,
      jti: session.id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(tokenKey);

    cookies.set("session", sessionToken, { path: "/" });
    throw redirect(303, redirectTo);
  },
};
