import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { isValidSession } from "$lib/server/auth";
import prisma from "$lib/server/prisma";
import * as bcrypt from "bcrypt";
import { UAParser } from "ua-parser-js";

export const load: PageServerLoad = async ({ url, cookies }) => {
  const redirectTo = url.searchParams.get("r");

  const sessionToken = cookies.get("session") ?? "";
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
  });

  if (await isValidSession(session)) {
    return redirect(303, redirectTo ?? "/");
  }

  if (session) {
    return { username: session.userID, error: "expired", redirectTo };
  }

  if (sessionToken) {
    cookies.set("session", "");
    return { username: "", error: "invalid", redirectTo };
  }

  return { username: "", redirectTo };
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
    const user = await prisma.user.findUnique({
      where: { id: usernameOrEmail },
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
        if (oldSession.userID == user.id) {
          await prisma.session.update({
            where: { token: oldSessionToken },
            data: {
              lastSeen: new Date(),
              expires: new Date(Date.now() + 2_592_000_000),
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
        expires: new Date(Date.now() + 2_592_000_000),
        lastSeen: new Date(),
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
