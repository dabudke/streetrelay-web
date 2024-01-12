import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import prisma from "$lib/server/prisma";
import { authenticateSession } from "$lib/server/auth";

export const load: PageServerLoad = async ({ cookies }) => {
  const { success: loggedIn } = await authenticateSession(
    cookies.get("session")
  );
  if (!loggedIn) throw redirect(303, "/");
};

export const actions: Actions = {
  default: async ({ cookies }) => {
    const sessionData = await authenticateSession(cookies.get("session"));
    if (!sessionData.success) throw redirect(303, "/");

    await prisma.session.delete({ where: { token: sessionData.sessionToken } });
    cookies.set("session", "");

    throw redirect(303, "/");
  },
};
