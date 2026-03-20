import sendgrid from "@sendgrid/mail";

const sendMail = async (email, subject, otp) => {
  const from = process.env.SENDGRID_FROM || process.env.Gmail;

  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY is not set, cannot send email.", otp);
    return false;
  }

  if (!from) {
    console.warn("SENDGRID_FROM (or Gmail) is not set as a from address.");
    return false;
  }

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
        <p>Hello ${email}, your One-Time Password is:</p>
        <p class="otp">${otp}</p>
    </div>
</body>
</html>
`;

  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: email,
    from,
    subject,
    html,
  };

  try {
    await sendgrid.send(msg);
    return true;
  } catch (error) {
    console.warn("SendGrid send failed:", error?.response?.body || error?.message || error);
    return false;
  }
};

export default sendMail;
       