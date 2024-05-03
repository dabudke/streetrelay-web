import { KEY_SECRET } from "$env/static/private";
import { isCuid } from "@paralleldrive/cuid2";
import { errors, jwtVerify } from "jose";
import { DateTime } from "luxon";
import prisma from "./prisma";

export const tokenKey = new TextEncoder().encode(KEY_SECRET);
export const consoleTokenURI = "strl:console";
export const sessionTokenURI = "strl:session";
export const resetPasswordURI = "strl:reset-password";
export const verifyEmailURI = "strl:verify-email";
export const recoverEmailURI = "strl:recover-email";

export enum SessionAuthenticationError {
  NoToken = "NO_TOKEN_PROVIDED",
  ExpiredSession = "SESSION_EXPIRED",
  BadToken = "BAD_TOKEN",
  InvalidSession = "INVALID_SESSION",
}

type SessionAuthenticationResult =
  | {
      sessionID: string;
      userID: string;
      freshLogin: boolean;
      error: undefined;
    }
  | {
      sessionID: string | undefined;
      userID: string | undefined;
      freshLogin: undefined;
      error: SessionAuthenticationError;
    };

export async function authenticateSessionToken(
  token: string | undefined
): Promise<SessionAuthenticationResult> {
  if (!token)
    return {
      sessionID: undefined,
      userID: undefined,
      freshLogin: undefined,
      error: SessionAuthenticationError.NoToken,
    };

  const tokenData = await jwtVerify<{
    jti: string;
    sub: string;
    aud: string;
    iat: number;
  }>(token, tokenKey, {
    audience: sessionTokenURI,
    requiredClaims: ["iat", "jti", "sub"],
  }).catch(() => undefined);
  if (!tokenData)
    return {
      userID: undefined,
      sessionID: undefined,
      freshLogin: undefined,
      error: SessionAuthenticationError.BadToken,
    };

  const { sub: userID, jti: sessionID, iat: timeIssued } = tokenData.payload;

  const session = await prisma.session.findUnique({
    where: { id: sessionID, userID },
  });
  if (!session)
    return {
      sessionID,
      userID,
      freshLogin: undefined,
      error: SessionAuthenticationError.InvalidSession,
    };

  // Security - sanity check for token spoofing
  if (DateTime.fromJSDate(session.lastLogin).toSeconds() !== timeIssued)
    return {
      sessionID: undefined,
      userID: undefined,
      freshLogin: undefined,
      error: SessionAuthenticationError.BadToken,
    };

  const currentTime = DateTime.now();
  if (timeIssued < currentTime.minus({ days: 30 }).toSeconds())
    return {
      sessionID,
      userID,
      freshLogin: undefined,
      error: SessionAuthenticationError.ExpiredSession,
    };

  return {
    sessionID,
    userID,
    freshLogin: timeIssued > currentTime.minus({ hours: 24 }).toSeconds(),
    error: undefined,
  };
}

enum TokenAuthenticationError {
  NoToken = "NO_TOKEN_PROVIDED",
  ExpiredToken = "TOKEN_EXPIRED",
  InvalidToken = "INVALID_TOKEN",
  BadToken = "BAD_TOKEN",
}

type TokenAuthenticationResult =
  | {
      deviceID: string;
      userID: string;
      stale: boolean;
      error: undefined;
    }
  | {
      deviceID: string | undefined;
      userID: string | undefined;
      stale: undefined;
      error: TokenAuthenticationError;
    };

export async function authenticateToken(
  header: string | null
): Promise<TokenAuthenticationResult> {
  if (!header)
    return {
      deviceID: undefined,
      userID: undefined,
      stale: undefined,
      error: TokenAuthenticationError.NoToken,
    };

  if (!header.startsWith("Bearer "))
    return {
      deviceID: undefined,
      userID: undefined,
      stale: undefined,
      error: TokenAuthenticationError.BadToken,
    };

  const token = header.slice(7);

  const tokenData = await jwtVerify<{ sub: string; iat: number; jti: string }>(
    token,
    tokenKey,
    {
      audience: consoleTokenURI,
      requiredClaims: ["sub", "iat", "jti"],
    }
  ).catch(() => undefined);
  if (!tokenData)
    return {
      deviceID: undefined,
      userID: undefined,
      stale: undefined,
      error: TokenAuthenticationError.BadToken,
    };

  const { sub: userID, jti: deviceID, iat } = tokenData.payload,
    timeIssued = DateTime.fromSeconds(iat);

  const device = await prisma.console.findUnique({
    where: { id: deviceID, userID },
  });
  if (!device)
    return {
      deviceID,
      userID,
      stale: undefined,
      error: TokenAuthenticationError.InvalidToken,
    };

  if (
    DateTime.fromJSDate(device.tokenIssuedAt).valueOf() !== timeIssued.valueOf()
  )
    return {
      deviceID: undefined,
      userID: undefined,
      stale: undefined,
      error: TokenAuthenticationError.BadToken,
    };

  const currentTime = DateTime.now();
  if (timeIssued < currentTime.minus({ days: 30 }))
    return {
      deviceID,
      userID,
      stale: undefined,
      error: TokenAuthenticationError.ExpiredToken,
    };

  return {
    deviceID,
    userID,
    stale: timeIssued < currentTime.minus({ minutes: 5 }),
    error: undefined,
  };
}
