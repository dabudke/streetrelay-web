import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { authenticateTokenForRefresh, issueToken } from "$lib/server/auth";

export const GET: RequestHandler = async ({ request }) => {
  const token = request.headers.get("Authorization");
  if (!token) {
    console.log("Token not provided");
    throw error(401, { message: "Token not provided" });
  }

  const tokenData = await authenticateTokenForRefresh(token);
  if (!tokenData.success) {
    if (tokenData.expired) throw error(401, { message: "Token expired" });
    if (tokenData.invalid) throw error(401, { message: "Token invalid" });
    if (tokenData.notFound)
      throw error(401, { message: "Device or user not found" });
    throw error(401, { message: "Unknown error" });
  }

  /* Authentication Barrier */

  const newToken = await issueToken(tokenData.userID, tokenData.deviceID).catch(
    (e) => {
      console.error(e);
      throw error(500, { message: "Could not issue new token" });
    }
  );

  return json(newToken);
};
