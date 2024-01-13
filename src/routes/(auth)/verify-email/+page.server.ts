import type { PageServerLoad } from "./$types";
import prisma from "$lib/server/prisma";

export const load: PageServerLoad = async ({ url }) => {
  const token = url.searchParams.get("t");
  if (!token) {
    return {
      error: true,
      message: "Click the link in your email to verify your email address.",
    };
  }

  const verification = await prisma.emailVerification.findUnique({
    where: {
      token,
    },
    include: {
      user: true,
    },
  });
  if (!verification) {
    return {
      error: true,
      message:
        "An error occured while trying to verify your email. Please try again later.",
    };
  }
  if (verification.expires <= new Date()) {
    prisma.emailVerification
      .delete({
        where: {
          token,
        },
      })
      .catch(console.error);
    return {
      error: true,
      message: "This link has expired. Please resend the verification email.",
    };
  }

  // Email verified!

  try {
    await prisma.user.update({
      where: {
        id: verification.userId,
      },
      data: {
        email: verification.email,
      },
    });
  } catch (e) {
    console.error(e);
    return {
      error: true,
      message:
        "An error occured while updating your email address. Please try again later.",
    };
  }

  try {
    await prisma.emailVerification.delete({
      where: {
        token,
      },
    });
  } catch (e) {
    console.error(e);
    return {
      error: true,
      message: "Your email has not been updated, please try again later.",
    };
  }

  return {
    error: false,
    message: `Email successfully updated to ${verification.email}. You may now close this tab.`,
  };
};
