import { authenticateSessionToken } from "$lib/server/auth";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies }) => {
  const auth = await authenticateSessionToken(cookies.get("session"));
  return {auth};
};
