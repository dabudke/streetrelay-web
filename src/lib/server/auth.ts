import prisma from "./prisma";
import type { Session } from "@prisma/client";

export async function isValidSession(session: Session | null): Promise<boolean>;
export async function isValidSession(sessionToken: string): Promise<boolean>;
export async function isValidSession(
  sessionOrToken: Session | string | null
): Promise<boolean> {
  let session;

  if (typeof sessionOrToken == "string") {
    session = await prisma.session.findUnique({
      where: { token: sessionOrToken },
    });
  } else {
    session = sessionOrToken;
  }

  if (!session) return false;
  if (session.expires <= new Date()) return false;

  return true;
}
