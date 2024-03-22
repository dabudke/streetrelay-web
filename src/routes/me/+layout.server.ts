import { authenticateSession } from "$lib/server/auth";
import { error, redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";
import prisma from "$lib/server/prisma";

export const load: LayoutServerLoad = async ({cookies, url}) => {
  const auth = await authenticateSession(cookies.get("session"));
  if (!auth.success) throw redirect(307, `/login?r=${encodeURIComponent(url.pathname)}`);

  const user = await prisma.user.findUnique({
    where: {
      id: auth.userID,
    }
  });
  if (!user) throw error(500, { message: "User data failed to load. Try again later." });

  return {
    sessionToken: auth.sessionToken,
    user: user
  }
};