const nodemailer = require("nodemailer");
const Jimp = require("jimp");

var transporter = nodemailer.createTransport({
  service: "sendMail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
});

exports.sendOtpEmail = async (email, otp, share2Image) => {
  try {
    // Convert Jimp image instance to buffer in PNG format
    const share2Buffer = await new Promise((resolve, reject) => {
      share2Image.getBufferAsync(Jimp.MIME_PNG, (err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign-In OTP</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333;
          }
          p {
            font-size: 18px;
            color: #666;
          }
          strong {
            color: #000;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Your Sign-In OTP - Action Required</h1>
          <p>Your OTP: <strong>${otp}</strong></p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      replyTo: process.env.SMTP_FROM,
      to: email,
      subject: "Your Sign-In OTP - Action Required",
      html: htmlContent,
      attachments: [
        {
          filename: "share2.png",
          content: share2Buffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log("Mail sent successfully");
  } catch (err) {
    console.error("Error sending mail:", err);
  } finally {
    transporter.close();
  }
};

exports.newAccountCreatedMail = async (email, otp) => {
  transporter.sendMail(
    {
      from: process.env.SMTP_FROM,
      replyTo: process.env.SMTP_FROM,
      to: email,
      subject: "Registration Successful",
      template: "registrationSuccess", // Replace with the appropriate email template name
      context: {
        otp: otp,
      },
    },
    (err) => {
      if (err) {
        console.log("Something went wrong:", err);
      } else {
        console.log("Registration email sent successfully");
      }
    }
  );
  transporter.close();
};
