import { SignJWT, errors, jwtVerify } from "jose";
import prisma from "./prisma";
import { KEY_SECRET } from "$env/static/private";
import { DateTime } from "luxon";
import { isCuid } from "@paralleldrive/cuid2";

export const signingKey = new TextEncoder().encode(KEY_SECRET);
export const resetPasswordURI = "strl:reset-password";

type SessionVerificationResult =
  | {
      success: true;
      userID: string;
      sessionToken: string;
    }
  | {
      success: false;
      loggedOut?: true;
      noToken?: true;
      invalid?: true;
      expired?: true;
      userID?: string;
    };

export async function authenticateSession(
  token: string | undefined
): Promise<SessionVerificationResult> {
  if (!token) return { success: false, noToken: true };
  if (!isCuid(token)) return { success: false, invalid: true };

  const session = await prisma.session.findUnique({
    where: { token },
  });
  if (!session) return { success: false, loggedOut: true };
  if (session.expires <= new Date())
    return { success: false, expired: true, userID: session.userID };

  return {
    success: true,
    userID: session.userID,
    sessionToken: session.token,
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
      await jwtVerify(token, signingKey, {
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
      await jwtVerify(token, signingKey, {
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

  return token.sign(signingKey);
}

// Device Token
// sub - user
// iat - (invalid for use after 5 mins, invalid for login after 30d)
