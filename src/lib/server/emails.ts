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

