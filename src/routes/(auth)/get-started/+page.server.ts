import { isValidSession, signToken } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import prisma from "$lib/server/prisma";
import resend from "$lib/server/mail";
import { SignJWT } from "jose";
import { hash } from "bcrypt";
import { UAParser } from "ua-parser-js";

export const load: PageServerLoad = async ({ url, cookies }) => {
  const redirectTo = url.searchParams.get("r");

  const sessionToken = cookies.get("session") ?? "";
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
  });

  if (await isValidSession(session)) {
    throw redirect(303, redirectTo ?? "/");
  }

  return { redirectTo };
};

export const actions: Actions = {
  default: async ({ request, cookies, getClientAddress }) => {
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
        emailVerification: {
          is: {
            verified: true,
          },
        },
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
      ua = uaHeader == null ? uaHeader : new UAParser(uaHeader);

    const user = prisma.user.create({
      data: {
        email,
        id: username,
        password: await hash(password, 10),
        emailVerification: {},
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

    const session = prisma.session.create({
      data: {
        userID: username,
        expires: new Date(Date.now() + 2_592_000_000),
        lastSeen: new Date(),
        name: ua
          ? `${ua.getBrowser().name} on ${ua.getOS().name}`
          : "Unknown Device",
        ip: getClientAddress(),
        device: ua?.getDevice().type ?? "desktop",
      },
    });

    try {
      await session;
    } catch (e) {
      console.error(e);
      return fail(500, {
        success: false,
        error: {
          email: null,
          username: null,
          password: false,
          creation:
            "An error occured while signing you in. Please log in to continue setup.",
        },
      });
    }

    cookies.set("session", (await session).token, { path: "/" });

    const verifyEmailToken = new SignJWT({
      sub: email,
      aud: username,
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setExpirationTime("10 minutes");

    const verifyEmailTokenString = await signToken(verifyEmailToken);

    const response = await resend.emails.send({
      from: "StreetRelay <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to StreetRelay",
      html: `Welcome to StreetRelay! We're so glad you've decided to join!<br>
To verify your email and opt-in to email notifications, click the link below:<br><br>

<a href="https://localhost:5173/verify-email?t=${verifyEmailTokenString}">Verify Email</a><br><br>

If you did not request this email, you can ignore it.<br>
This link will expire in 10 minutes.`,
      text: `Welcome to StreetRelay! We're so glad you've decided to join!
To verify your email and opt-in to email notifications, click the link below:

https://localhost:5173/verify-email?t=${verifyEmailTokenString}

If you did not request this email, you can ignore it.
This link will expire in 10 minutes.`,
    });

    if (response.data) {
      prisma.user.update({
        where: {
          id: username,
        },
        data: {
          emailVerification: {
            emailSent: true,
            emailId: response.data.id,
          },
        },
      });
    }

    return {
      success: response.error
        ? "An error occured while sending the verification email. You can resend the verification email later in profile settings."
        : true,
      error: {
        email: null,
        username: null,
        password: false,
        creation: null,
      },
    };
  },
};
