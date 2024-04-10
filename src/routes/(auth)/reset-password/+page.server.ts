import { jwtVerify, errors, SignJWT } from "jose";
import type { Actions, PageServerLoad } from "./$types";
import {
  authenticateSessionToken,
  resetPasswordURI,
  tokenKey,
} from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import resend from "$lib/server/mail";
import {
  recoveryEmailAddress,
  resetPasswordEmailHTML,
  resetPasswordEmailText,
} from "$lib/server/emails";
import { DateTime } from "luxon";
import { hash } from "bcrypt";

async function verifyToken(
  token: string
): Promise<{ success: boolean; error?: string; userID?: string }> {
  return new Promise((res) => {
    jwtVerify(token, tokenKey, {
      audience: resetPasswordURI,
      requiredClaims: ["sub", "exp"],
    }).then(
      (data) => {
        const userID = data.payload["sub"] as string;
        prisma.user
          .findUnique({
            where: {
              id: userID,
            },
          })
          .then((user) => {
            if (!user)
              res({
                success: false,
                error: "An error has occured, your account could not be found.",
              });
            else res({ success: true, userID: user.id });
          });
      },
      (err) => {
        if (err instanceof errors.JWTExpired)
          res({ success: false, error: "Password reset expired." });
        else res({ success: false, error: "Invalid password reset token." });
      }
    );
  });
}

export const load: PageServerLoad = async ({ url, cookies }) => {
  const { error } = await authenticateSessionToken(cookies.get("session"));
  if (!error) redirect(301, "/");

  const token = url.searchParams.get("t");
  if (token) {
    return {
      resetPassword: true,
      result: verifyToken(token),
    };
  } else return { resetPassword: false };
};

export const actions: Actions = {
  sendEmail: async ({ request, url }) => {
    const formData = await request.formData(),
      email = formData.get("email") as string;

    if (typeof email !== "string")
      return fail(422, {
        success: false,
        error: {
          global: null,
          email: "Invalid email field type.",
          password: null,
        },
      });
    if (!email.match(/^.+@.+\.(?:.){2,6}$/))
      return fail(400, {
        success: false,
        error: {
          global: null,
          email: "Please enter a valid email address.",
          password: null,
        },
      });

    // send email

    const user = await prisma.user.findFirst({
      where: {
        email,
        emailVerified: true,
      },
    });
    if (user) {
      const token = await new SignJWT({
        sub: user.id,
        aud: resetPasswordURI,
        exp: DateTime.now().plus({ minutes: 5 }).toSeconds(),
      })
        .setProtectedHeader({
          alg: "HS256",
        })
        .sign(tokenKey);
      const response = await resend.emails.send({
        from: recoveryEmailAddress,
        to: email,
        subject: "StreetRelay Password Reset",
        html: resetPasswordEmailHTML(url.origin, token),
        text: resetPasswordEmailText(url.origin, token),
      });
      if (response.error)
        return fail(500, {
          success: false,
          error: {
            global:
              "Could not send an email to your email address. Please try again later.",
            email: null,
            password: null,
          },
        });
    }

    return {
      success: true,
      error: {
        global: null,
        email: null,
        password: null,
      },
    };
  },
  changePassword: async ({ request }) => {
    const formData = await request.formData(),
      token = formData.get("token") as string;
    if (!token)
      return fail(401, {
        success: false,
        error: { global: "No token provided.", email: null, password: null },
      });
    if (typeof token !== "string")
      return fail(422, {
        success: false,
        error: {
          global: "Invalid token field type.",
          email: null,
          password: null,
        },
      });

    const { success, error, userID } = await verifyToken(token);
    if (!success)
      return fail(401, {
        success: false,
        error: {
          global: error,
          email: null,
          password: null,
        },
      });

    const password = formData.get("password");
    if (typeof password !== "string")
      return fail(422, {
        success: false,
        error: {
          global: null,
          email: null,
          password: "Invalid password field type.",
        },
      });

    if (
      !password.match(/[a-z]/) ||
      !password.match(/[A-Z]/) ||
      !password.match(/[\W_]/) ||
      !password.match(/[0-9]/) ||
      password.length < 8
    )
      return fail(400, {
        success: false,
        error: {
          global: null,
          email: null,
          password: true,
        },
      });

    const exists = await prisma.user.findUnique({ where: { id: userID } }).then(
      (data) => data !== null,
      () => false
    );
    if (!exists)
      return fail(500, {
        success: false,
        error: {
          global: "Could not find your account. Please try again later.",
          email: null,
          password: null,
        },
      });

    await prisma.user.update({
      where: {
        id: userID,
      },
      data: {
        password: await hash(password, 10),
      },
    });

    return {
      success: true,
      error: {
        global: null,
        email: null,
        password: null,
      },
    };
  },
};
