import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { SignJWT } from "jose";
import { authenticateTokenForRefresh, signToken } from "$lib/server/auth";
import prisma from "$lib/server/prisma";

export const GET: RequestHandler = async ({ request }) => {
  const tokenHeader = request.headers.get("Authorization");
  if (!tokenHeader) throw error(401);

  const [authType, token] = tokenHeader.split(" ");
  if (authType != "JWT") throw error(400);
  console.log(token);

  const user = await authenticateTokenForRefresh(token);
  if (!user) throw error(401);

  /* Authentication Barrier */

  const issued = Math.floor(Date.now() / 1000);
  const newToken = new SignJWT({
    iat: issued,
    sub: user,
  }).setProtectedHeader({
    alg: "HS256",
  });

  const updateSuccess = await prisma.user
    .update({
      where: { id: user },
      data: { console: { tokenIssued: new Date(issued * 1000) } },
    })
    .then(() => true)
    .catch(() => false);

  if (updateSuccess) return json(await signToken(newToken));
  else throw error(500);
};
