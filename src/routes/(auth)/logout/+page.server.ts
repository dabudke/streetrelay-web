import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import prisma from "$lib/server/prisma";
import {
  SessionAuthenticationError,
  authenticateSessionToken,
} from "$lib/server/auth";

export const load: PageServerLoad = async ({ cookies }) => {
  const { error } = await authenticateSessionToken(cookies.get("session"));
  if (error === SessionAuthenticationError.NoToken) throw redirect(303, "/");
};

export const actions: Actions = {
  default: async ({ cookies }) => {
    const { sessionID, error } = await authenticateSessionToken(
      cookies.get("session")
    );
    if (error === SessionAuthenticationError.NoToken) throw redirect(303, "/");

    await prisma.session.delete({ where: { id: sessionID } });
    cookies.delete("session", { path: "/" });
    throw redirect(303, "/");
  },
};
