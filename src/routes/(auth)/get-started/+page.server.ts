import { authenticateSession } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import prisma from "$lib/server/prisma";
import resend from "$lib/server/mail";
import { hash } from "bcrypt";
import { UAParser } from "ua-parser-js";
import { createId } from "@paralleldrive/cuid2";
import { EMAIL_BASE_URL } from "$env/static/private";
import { DateTime } from "luxon";

export const load: PageServerLoad = async ({ url, cookies }) => {
  const redirectTo = url.searchParams.get("r");

  const { success: loggedIn } = await authenticateSession(
    cookies.get("session")
  );

  if (loggedIn) throw redirect(303, redirectTo ?? "/");

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
        id: username,
        password: await hash(password, 10),
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
        expires: DateTime.now().plus({ days: 30 }).toJSDate(),
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

    const emailVerificationID = createId();

    const response = await resend.emails.send({
      from: "StreetRelay <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to StreetRelay",
      html: `Welcome to StreetRelay! We're so glad you've decided to join!<br>
To verify your email and opt-in to email notifications, click the link below:<br><br>

<a href="${EMAIL_BASE_URL}/verify-email?t=${emailVerificationID}">Verify Email</a><br><br>

If you did not request this email, you can ignore it.<br>
This link will expire in 10 minutes.`,
      text: `Welcome to StreetRelay! We're so glad you've decided to join!
To verify your email and opt-in to email notifications, click the link below:

${EMAIL_BASE_URL}/verify-email?t=${emailVerificationID}

If you did not request this email, you can ignore it.
This link will expire in 10 minutes.`,
    });

    if (response.data) {
      prisma.emailVerification
        .create({
          data: {
            emailId: response.data.id,
            expires: DateTime.now().plus({ minutes: 10 }).toJSDate(), // todo
            token: emailVerificationID,
            userId: username,
            email: email,
          },
        })
        .catch(console.error);
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
