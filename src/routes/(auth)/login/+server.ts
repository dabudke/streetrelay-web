import { authenticateToken, consoleTokenURI, tokenKey } from "$lib/server/auth";
import prisma from "$lib/server/prisma";
import { error, json } from "@sveltejs/kit";
import { SignJWT } from "jose";
import { DateTime } from "luxon";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ request }) => {
  const token = request.headers.get("Authorization");
  const { userID, deviceID, error: authError } = await authenticateToken(token);
  if (authError) error(401, authError);

  /* Authentication Barrier */

  const issuedAt = DateTime.now().startOf("second");

  await prisma.console.update({
    where: { id: deviceID },
    data: {
      tokenIssuedAt: issuedAt.toJSDate(),
    },
  });

  const newToken = await new SignJWT({
    aud: consoleTokenURI,
    sub: userID,
    jti: deviceID,
    iat: issuedAt.toSeconds(),
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .sign(tokenKey);

  return json(newToken);
};
