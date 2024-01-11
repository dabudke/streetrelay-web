import QRCode from "qrcode";
import type { Actions, PageServerLoad } from "./$types";
import prisma from "$lib/server/prisma";
import { isValidSession, issueToken } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { createId } from "@paralleldrive/cuid2";

export const load: PageServerLoad = async ({ cookies }) => {
  const sessionToken = cookies.get("session") ?? "";
  const session = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
  });

  if (!session) {
    throw redirect(303, `/login?r=${encodeURIComponent("/onboard-device")}`);
  }

  if (await prisma.console.findFirst({
    where: {
      userID: session.userID,
    }
  }).catch((e) => { console.error(e); return false; })) {
    throw redirect(303, "/me/devices");
  }
  
};

export const actions: Actions = {
  create: async ({ cookies }) => {
    const sessionToken = cookies.get("session") ?? "";
    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
    });

    if (!session || !(await isValidSession(session))) {
      return fail(401, { unauthorized: true });
    }

    const deviceID = createId();
    const token = await issueToken(session.userID, deviceID);

    const qrcode = await QRCode.toDataURL(token);

    return {
      code: qrcode,
    };
  },
};
