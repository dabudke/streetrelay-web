import { KEY_SECRET } from "$env/static/private";
import { isCuid } from "@paralleldrive/cuid2";
import { SignJWT, errors, jwtVerify } from "jose";
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

export async function authenticateSessionToken(
  token: string | undefined
): Promise<
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
    }
> {
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

type TokenAuthenticationResult =
  | {
      success: true;
      userID: string;
      deviceID: string;
    }
  | {
      success: false;
      noToken?: true;
      notFound?: true;
      expired?: true;
      invalid?: true;
      userID?: string;
      deviceID?: string;
    };

export async function authenticateToken(
  token: string | null
): Promise<TokenAuthenticationResult> {
  if (!token) return { success: false, noToken: true };

  try {
    const payload = (
      await jwtVerify(token, tokenKey, {
        audience: consoleTokenURI,
        maxTokenAge: "5 minutes",
        requiredClaims: ["sub"],
      })
    ).payload;
    if (!isCuid(payload.jti ?? "")) return { success: false, invalid: true };
    return {
      success: true,
      deviceID: payload.jti ?? "",
      userID: payload.sub ?? "",
    };
  } catch (e) {
    if (e instanceof errors.JWTExpired)
      return { success: false, expired: true };
    else return { success: false, invalid: true };
  }
}

export async function authenticateTokenForRefresh(
  token: string
): Promise<TokenAuthenticationResult> {
  try {
    const payload = (
      await jwtVerify(token, tokenKey, {
        audience: consoleTokenURI,
        maxTokenAge: "14 days",
        requiredClaims: ["jti", "sub"],
      })
    ).payload;

    const device = await prisma.console.findUnique({
      where: {
        id: payload.jti,
        userID: payload.sub,
      },
    });
    if (!device) return { success: false, notFound: true };
    if (DateTime.fromJSDate(device.tokenIssuedAt).toSeconds() !== payload.iat)
      return { success: false, invalid: true };

    // Authentication Barrier //

    return {
      success: true,
      deviceID: device.id,
      userID: device.userID,
    };
  } catch (e) {
    if (e instanceof errors.JWTExpired)
      return { success: false, expired: true };
    return { success: false, invalid: true };
  }
}

export async function issueToken(
  userID: string,
  deviceID: string
): Promise<string> {
  const issued = DateTime.now().startOf("second");

  const token = new SignJWT({
    jti: deviceID,
    sub: userID,
    iat: issued.toSeconds(),
  }).setProtectedHeader({
    alg: "HS256",
  });

  await prisma.console.upsert({
    where: {
      id: deviceID,
    },
    update: {
      tokenIssuedAt: issued.toJSDate(),
    },
    create: {
      id: deviceID,
      userID,
      tokenIssuedAt: issued.toJSDate(),
    },
  });

  return token.sign(tokenKey);
}

// Device Token
// sub - user
// iat - (invalid for use after 5 mins, invalid for login after 30d)
