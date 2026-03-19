import { createTransport } from "nodemailer";

const sendMail = async (email, subject, otp) => {
  // Return true when email was sent, false otherwise.
  // Prefer SendGrid Web API in deploy environments because SMTP ports are often blocked.
  const usingSendGrid = !!process.env.SENDGRID_API_KEY;

  if (usingSendGrid) {
    const sendgridFrom = process.env.SENDGRID_FROM || process.env.Gmail;
    if (!sendgridFrom) {
      console.warn("SendGrid is configured but no from address is set.");
      return false;
    }

    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email }],
              subject,
            },
          ],
          from: { email: sendgridFrom },
          content: [{ type: "text/html", value: html }],
        }),
      });

      if (response.ok) {
        return true;
      }

      const text = await response.text();
      console.warn("SendGrid send failed:", response.status, text);
      return false;
    } catch (error) {
      console.warn("SendGrid send error:", error?.message || error);
      return false;
    }
  }

  if (!process.env.Gmail || !process.env.Password) {
    console.warn("SMTP is not configured. OTP:", otp);
    return false;
  }

  const transport = createTransport({
    service: "gmail",
    secure: true,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
    tls: {
      // Some environments (e.g. Render) may require this to connect.
      rejectUnauthorized: false,
    },
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        h1 {
            color: red;
        }
        p {
            margin-bottom: 20px;
            color: #666;
        }
        .otp {
            font-size: 36px;
            color: #7b68ee; /* Purple text */
            margin-bottom: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>OTP Verification</h1>
        <p>Hello ${email} your (One-Time Password) for your account verification is.</p>
        <p class="otp">${otp}</p> 
    </div>
</body>
</html>
`;

  try {
    await transport.sendMail({
      from: process.env.Gmail,
      to: email,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.warn("Failed to send OTP email (nodemailer):", error?.message || error);
    return false;
  }
};

export default sendMail;
