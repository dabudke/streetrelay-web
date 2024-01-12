import QRCode from "qrcode";
import type { Actions, PageServerLoad } from "./$types";
import prisma from "$lib/server/prisma";
import { authenticateSession, issueToken } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { createId } from "@paralleldrive/cuid2";

export const load: PageServerLoad = async ({ cookies }) => {
  const { success: loggedIn, userID } = await authenticateSession(
    cookies.get("session")
  );

  if (!loggedIn) {
    throw redirect(303, `/login?r=${encodeURIComponent("/onboard-device")}`);
  }

  if (
    await prisma.console
      .findFirst({
        where: {
          userID: userID,
        },
      })
      .catch((e) => {
        console.error(e);
        return false;
      })
  ) {
    throw redirect(303, "/me/devices");
  }
};

export const actions: Actions = {
  create: async ({ cookies }) => {
    const { success: loggedIn, userID } = await authenticateSession(
      cookies.get("session")
    );

    if (!loggedIn) {
      return fail(401, { unauthorized: true });
    }

    const deviceID = createId();
    const token = await issueToken(userID, deviceID);

    const qrcode = await QRCode.toDataURL(token);

    return {
      code: qrcode,
    };
  },
};
