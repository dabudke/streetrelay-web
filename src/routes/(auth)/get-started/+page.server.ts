import {
  authenticateSessionToken,
  sessionTokenURI,
  tokenKey,
  verifyEmailURI,
} from "$lib/server/auth";
import {
  getStartedEmailHTML,
  getStartedEmailText,
  resend,
  verificationEmailAddress,
} from "$lib/server/email";
import prisma from "$lib/server/prisma";
import { fail, redirect } from "@sveltejs/kit";
import { hash } from "bcrypt";
import { SignJWT } from "jose";
import { DateTime } from "luxon";
import { UAParser } from "ua-parser-js";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, cookies }) => {
  const redirectTo = url.searchParams.get("r");

  const { error } = await authenticateSessionToken(cookies.get("session"));

  if (!error) throw redirect(303, redirectTo ?? "/");
};

export const actions: Actions = {
  default: async ({ request, cookies, getClientAddress, url }) => {
    const formData = await request.formData();

    const email = formData.get("email") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!email || !username || !password)
      return fail(400, {
        success: false,
        error: {
          email: !email ? "Please provide an email address" : null,
          username: !username ? "Please provide a username" : null,
          password: !password,
          creation: null,
        },
      });

    if (!email.match(/^.+@.+\.(?:.){2,6}$/))
      return fail(400, {
        success: false,
        error: {
          email: "Please provide a valid email address",
          username: null,
          password: false,
          creation: null,
        },
      });

    if (username.length > 20 || username.length < 2)
      return fail(400, {
        success: false,
        error: {
          email: null,
          username: "Your username must be between 2 and 20 characters",
          password: false,
          creation: null,
        },
      });
    if (!username.match(/^[A-Za-z0-9_]+$/))
      return fail(400, {
        success: false,
        error: {
          email: null,
          username: "Please provide a valid username",
          password: false,
          creation: null,
        },
      });

    const passwordChecks =
      !!password.match(/[a-z]/) &&
      !!password.match(/[A-Z]/) &&
      !!password.match(/[\W_]/) &&
      !!password.match(/[0-9]/) &&
      password.length >= 8;

    if (!passwordChecks) {
      return fail(400, {
        success: false,
        error: {
          email: null,
          username: null,
          password: true,
          creation: null,
        },
      });
    }

    const existingEmail = prisma.user.findFirst({
      where: {
        email,
        emailVerified: true,
      },
    });
    const existingUsername = prisma.user.findFirst({
      where: {
        id: username,
      },
    });

    if (await existingEmail) {
      return fail(400, {
        success: false,
        error: {
          email: "Email is already verified by another user.",
          username: null,
          password: false,
          creation: null,
        },
      });
    }
    if (await existingUsername) {
      return fail(400, {
        success: false,
        error: {
          email: null,
          username: "Username is already taken, please choose another",
          password: false,
          creation: null,
        },
      });
    }

    // Account creation succeeds!

    const uaHeader = request.headers.get("user-agent"),
      ua = uaHeader == null ? uaHeader : new UAParser(uaHeader),
      loginTime = DateTime.now().startOf("second");

    const user = prisma.user.create({
      data: {
        id: username,
        email,
        password: await hash(password, 10),
        sessions: {
          create: {
            name: ua
              ? `${ua.getBrowser().name} on ${ua.getOS().name}`
              : "Unknown Device",
            ip: getClientAddress(),
            device: ua?.getDevice().type ?? "desktop",
            lastLogin: loginTime.toJSDate(),
          },
        },
      },
      include: {
        sessions: true,
      },
    });
    try {
      await user;
    } catch (e) {
      console.error(e);
      return fail(500, {
        success: false,
        error: {
          email: null,
          username: null,
          password: false,
          creation:
            "An error occured during account creation. Please try again later",
        },
      });
    }

    const emailVerificationToken = await new SignJWT({
      aud: verifyEmailURI,
      sub: username,
      exp: DateTime.now().plus({ minutes: 10 }).toSeconds(),
      email,
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .sign(tokenKey);

    const emailSent = resend.emails
      .send({
        from: verificationEmailAddress,
        to: email,
        subject: "Welcome to StreetRelay",
        html: getStartedEmailHTML(url.origin, emailVerificationToken),
        text: getStartedEmailText(url.origin, emailVerificationToken),
      })
      .then(
        () => true,
        (err) => {
          console.error(err);
          return false;
        }
      );

    const { id: sessionID, userID } = (await user).sessions[0];
    const sessionToken = await new SignJWT({
      aud: sessionTokenURI,
      iat: loginTime.toSeconds(),
      sub: userID,
      jti: sessionID,
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(tokenKey);

    cookies.set("session", sessionToken, { path: "/" });

    return {
      success: (await emailSent)
        ? true
        : "An error occured while sending the verification email. You can resend the verification email later in profile settings.",
      error: {
        email: null,
        username: null,
        password: false,
        creation: null,
      },
    };
  },
};
