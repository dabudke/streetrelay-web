import { authenticateSession } from "$lib/server/auth";
import prisma from "$lib/server/prisma";
import { fail, redirect } from "@sveltejs/kit";
import * as bcrypt from "bcrypt";
import { DateTime } from "luxon";
import { UAParser } from "ua-parser-js";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, cookies }) => {
  const redirectTo = url.searchParams.get("r");

  const sessionToken = cookies.get("session") ?? "";
  const sessionVerification = await authenticateSession(sessionToken);

  if (sessionVerification.success) throw redirect(303, redirectTo ?? "/");

  const { expired, loggedOut, userID } = sessionVerification;

  if (expired)
    return {
      username: userID ?? "",
      error: "Your session has expired, please try again.",
    };
  if (loggedOut)
    return {
      username: "",
      error:
        "You have been logged out from another device, please log in again.",
    };

  return { username: "" };
};

export const actions: Actions = {
  default: async ({ request, url, cookies, getClientAddress }) => {
    const data = await request.formData();

    const usernameOrEmail = data.get("usernameOrEmail") as string | undefined,
      password = data.get("password") as string | undefined;

    const redirectTo = url.searchParams.get("r") ?? "/",
      oldSessionToken = cookies.get("session");

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

    if (oldSessionToken) {
      const oldSession = await prisma.session.findUnique({
        where: { token: oldSessionToken },
      });
      if (oldSession) {
        if (oldSession.userID === user.id) {
          await prisma.session.update({
            where: { token: oldSessionToken },
            data: {
              lastSeen: DateTime.now().toJSDate(),
              expires: DateTime.now().plus({ days: 30 }).toJSDate(),
            },
          });
          throw redirect(303, redirectTo);
        } else {
          prisma.session.delete({ where: { token: oldSessionToken } });
        }
      }
    }

    const session = await prisma.session.create({
      data: {
        userID: user.id,
        expires: DateTime.now().plus({ days: 30 }).toJSDate(),
        lastSeen: DateTime.now().toJSDate(),
        name: ua
          ? `${ua.getBrowser().name} on ${ua.getOS().name}`
          : "Unknown Device",
        ip: getClientAddress(),
        device: ua?.getDevice().type ?? "desktop",
      },
    });

    cookies.set("session", session.token, { path: "/" });
    throw redirect(303, redirectTo);
  },
};
