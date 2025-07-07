import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: ".env.dev" });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.OTP_EMAIL,
    pass: process.env.OTP_EMAIL_PSW,
  },
  tls: {
    rejectUnauthorized: false, // Temporary fix for self-signed cert
  },
});

const verifyEmailModule = async () => {
  console.log("Verifying email module...");

  try {
    transporter.verify((err, success) => {
      if (err) {
        console.error("❌ Email Verification Failed:", err, {
          email: process.env.OTP_EMAIL,
          host: process.env.EMAIL_HOST,
          port: process.env.EMAIL_PORT,
        });
      } else {
        console.log("✅ Email Module Connected. Ready to send emails.");
      }
    });
  } catch (error) {
    console.error("Error verifying email module:", error);
  }
};

const sendEmail = async ({ to, subject, html, text }) => {
  console.log("📤 Sending email to:", to);

  try {
    const info = await transporter.sendMail({
      from: '"Smart Parking" <no-reply@byjae.dev>', // ✅ matches your domain
      to,
      subject,
      text: text || "",
      html,
      replyTo: "support@byjae.dev", // or any working inbox
      headers: {
        "X-Priority": "3",
        "X-Mailer": "SmartParkingMailer",
      },
    });

    console.log("✅ Email sent to:", to);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

export default { sendEmail, verifyEmailModule };
