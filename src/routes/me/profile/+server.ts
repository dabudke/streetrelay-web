import { authenticateToken } from "$lib/server/auth";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import prisma from "$lib/server/prisma";

export const GET: RequestHandler = () => {
  return new Response();
};

export const PUT: RequestHandler = async ({ request }) => {
  const {
    userID,
    stale,
    error: authError,
  } = await authenticateToken(request.headers.get("Authorization"));

  if (authError || stale)
    error(401, "An error occured authorizing the token provided.");

  const data = await request.formData();
  const // mii = data.get("mii") as File,
    nickname = data.get("nickname") as string,
    console = data.get("console") as string;

  // TODO generate mii picture

  await prisma.user.update({
    where: {
      id: userID,
    },
    data: {
      nickname,
      console: {
        update: {
          deviceName: console,
        },
      },
    },
  });

  return new Response();
};
