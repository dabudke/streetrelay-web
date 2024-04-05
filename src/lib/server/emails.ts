// export const recoveryEmailAddress = "StreetRelay <recovery@emails.streetrelay.me>";
export const recoveryEmailAddress = "StreetRelay <onboarding@resend.dev>";
// export const verificationEmailAddress = "StreetRelay <verify@emails.streetrelay.me>";
export const verificationEmailAddress = "StreetRelay <onboarding@resend.dev>";

export const getStartedEmailHTML = (
  origin: string,
  verificationToken: string
) => `Welcome to StreetRelay! We're so glad you've decided to join!<br>
To verify your email and opt-in to email notifications, click the link below:<br><br>

<a href="${origin}/verify-email?t=${verificationToken}">Verify Email</a><br><br>

If you did not request this email, you can ignore it.<br>
This link will expire in 10 minutes.`;

export const getStartedEmailText = (
  origin: string,
  verificationToken: string
) => `Welcome to StreetRelay! We're so glad you've decided to join!
To verify your email and opt-in to email notifications, click the link below:

${origin}/verify-email?t=${verificationToken}

If you did not request this email, you can ignore it.
This link will expire in 10 minutes.`;

export const resetPasswordEmailHTML = (
  origin: string,
  token: string
) => `You have requested a password reset for your StreetRelay account.<br>
Click the link below to reset your password and recover your account:<br><br>

<a href="${origin}/reset-password?t=${token}">Reset Password</a><br><br>

If you did not request this email, you can ignore it.<br>
This link will expire in 5 minutes.`;
export const resetPasswordEmailText = (
  origin: string,
  token: string
) => `You have requested a password reset for your StreetRelay account.
Click the link below to reset your password and recover your account:

${origin}/reset-password?t=${token}

If you did not request this email, you can ignore it.
This link will expire in 5 minutes.`;
