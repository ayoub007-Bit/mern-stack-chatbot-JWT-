import { createTransport } from "nodemailer";

const sendMail = async (email, subject, otp) => {
  // Return true when email was sent, false otherwise.
  // Prefer SendGrid in deploy environments because many hosts block Gmail SMTP.
  const usingSendGrid = !!process.env.SENDGRID_API_KEY;

  if (!usingSendGrid && (!process.env.Gmail || !process.env.Password)) {
    console.warn("SMTP is not configured. OTP:", otp);
    return false;
  }

  const transportOptions = usingSendGrid
    ? {
        host: "smtp.sendgrid.net",
        port: 587,
        secure: false,
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY,
        },
      }
    : {
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
      };

  const transport = createTransport(transportOptions);

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
