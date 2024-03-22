import { authenticateSession } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import prisma from "$lib/server/prisma";
import type { Session } from "@prisma/client";

export const load: PageServerLoad = async ({ parent }) => {
  const auth = await parent();

  const sessions = prisma.session.findMany({
    where: {
      userID: auth.user.id,
      NOT: {
        token: auth.sessionToken,
      }
    },
  });
  const current = prisma.session.findUniqueOrThrow({
    where: {
      token: auth.sessionToken,
    }
  });

  return {
    sessions,
    current,
  };
};

export const actions: Actions = {
  revokeSession: async ({ request, cookies }) => {
    const data = await request.formData();
    const targetToken = data.get("session") as string | null;

    const auth = await authenticateSession(cookies.get("session"));
    if (!auth.success) {
      return fail(401);
    }

    const target = await prisma.session.findUnique({
      where: { token: targetToken ?? "" },
    });
    if (!target) return fail(404);

    if (target.userID !== auth.userID) return fail(403);
    if (targetToken === auth.sessionToken) return fail(400, { error: "same" });

    await prisma.session.delete({ where: { token: target.token } });
  },
};
