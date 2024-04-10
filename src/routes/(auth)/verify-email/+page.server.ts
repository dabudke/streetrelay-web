import { recoverEmailURI, tokenKey, verifyEmailURI } from "$lib/server/auth";
import prisma from "$lib/server/prisma";
import { jwtVerify } from "jose";
import { JWTExpired } from "jose/errors";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const token = url.searchParams.get("t");
  if (!token) {
    return {
      error: true,
      message: "Click the link in your email to verify your email address.",
    };
  }

  const data = await jwtVerify<{
    aud: string;
    sub: string;
    email: string;
  }>(token, tokenKey, {
    requiredClaims: ["exp", "sub", "aud", "email"],
  }).then(
    ({ payload }) => ({ success: true, payload, err: undefined }),
    (err) => ({ success: undefined, payload: undefined, err })
  );

  if (!data.success) {
    if (data.err instanceof JWTExpired)
      return {
        error: true,
        message:
          "Token has expired, try resending the verification email. If you are trying to recover your account, please contact support.",
      };
    console.error(data.err);
    return {
      error: true,
      message:
        "Invalid token. Try resending the verification email. If you are trying to recover your account, please contact support.",
    };
  }
  const { aud: audience, sub: userID, email } = data.payload;

  const user = await prisma.user.findUnique({
    where: {
      id: userID,
    },
  });
  if (!user)
    return {
      error: true,
      message: "Could not find your user account. Please try again later.",
    };

  switch (audience) {
    case verifyEmailURI: {
      if (user.email !== email)
        return {
          error: true,
          message: "Email verification link invalid.",
        };

      await prisma.user.update({
        where: {
          id: userID,
        },
        data: {
          emailVerified: true,
        },
      });
      return {
        error: false,
        message: `Email address ${email} verified! You can now recieve email notifications.`,
      };
    }

    case recoverEmailURI: {
      await prisma.user.update({
        where: {
          id: userID,
        },
        data: {
          email,
          emailVerified: true,
        },
      });
      return {
        error: false,
        message: `Your email has been successfully reset to ${email}. If your account has been hijacked, you can reset your password.`,
      };
    }

    default:
      return {
        error: true,
        message: "Invalid email verification token. Please try again later.",
      };
  }
};
