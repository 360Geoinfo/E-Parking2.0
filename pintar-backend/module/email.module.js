// modules/email.module.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: ".env.dev" });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true, // true for 465, false otherwise
  auth: {
    user: process.env.OTP_EMAIL,
    pass: process.env.OTP_EMAIL_PSW,
  },
  // Optional timeout to see if it helps
  //   connectionTimeout: 10000, // 10 seconds
});

// Verify Email Module

const verifyEmailModule = async () => {
  try {
    transporter.verify((err, success) => {
      if (err) {
        console.error("Email Verification failed:", err, {
          email: process.env.OTP_EMAIL,
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
        });
      } else {
        console.log("Server is ready to send emails");
      }
    });
  } catch (error) {
    console.error("Error verifying email module:", error);
  }
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.OTP_EMAIL,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return info; // optional: return info for further use
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // re-throw if you want caller to handle it
  }
};

export default { sendEmail, verifyEmailModule };
