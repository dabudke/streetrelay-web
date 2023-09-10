import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import prisma from "$lib/server/prisma";
import { isValidSession } from "$lib/server/auth";

export const load: PageServerLoad = async ({ cookies }) => {
  const sessionToken = cookies.get("session");
  if (!sessionToken) return { error: "missing" };
  if (!isValidSession(sessionToken)) return { error: "invalid" };
  return { error: undefined };
};

export const actions: Actions = {
  default: async ({ cookies }) => {
    const sessionToken = cookies.get("session");
    if (!sessionToken) return fail(401);

    if (!isValidSession(sessionToken)) return fail(401);

    await prisma.session.delete({ where: { token: sessionToken } });
    cookies.set("session", "");

    throw redirect(303, "/");
  },
};
