import { SignJWT, jwtVerify } from "jose";
import prisma from "./prisma";
import { KEY_SECRET } from "$env/static/private";
import type { Session } from "@prisma/client";

const signingKey = new TextEncoder().encode(KEY_SECRET);

export async function isValidSession(session: Session | null): Promise<boolean>;
export async function isValidSession(
  sessionToken: string | undefined
): Promise<boolean>;
export async function isValidSession(
  sessionOrToken: Session | string | null | undefined
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

// Session Token
// sub - user
// exp - 30 days
// jti - token id
// aud - "web"

export async function authenticateToken(token: string): Promise<string | null> {
  let payload;
  try {
    payload = (
      await jwtVerify(token, signingKey, {
        maxTokenAge: "5 minutes",
        requiredClaims: ["sub"],
      })
    ).payload;
  } catch {
    return null;
  }
}

export async function authenticateTokenForRefresh(
  token: string
): Promise<string | null> {
  let payload;
  try {
    payload = (
      await jwtVerify(token, signingKey, {
        maxTokenAge: "30 days",
        requiredClaims: ["sub"],
      })
    ).payload;
  } catch (e) {
    console.log(e);
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) return null;

  if (user.console.tokenIssued.getTime() / 1000 !== payload.iat) return null;

  return user.id;
}

export function signToken(token: SignJWT): Promise<string> {
  return token.sign(signingKey);
}

// Device Token
// sub - user
// iat - (invalid for use after 5 mins, invalid for login after 30d)
