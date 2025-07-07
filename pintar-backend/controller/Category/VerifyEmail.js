import express from "express";
import OracleDB from "oracledb";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/", async (req, res) => {
  console.log("[GET] /emailverification called");

  const { token } = req.query;

  if (!token) return res.status(400).send("Verification token missing.");

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { email, userID } = decoded;

    let conn = await OracleDB.getConnection();

    // Update ACCOUNTSTATUS to VERIFIED
    await conn.execute(
      `UPDATE PUBLICUSER SET ACCOUNTSTATUS = 'ACTIVE' WHERE USERID = :userID AND EMAIL = :email`,
      { userID, email },
      { autoCommit: true }
    );

    // Optionally generate OTP code here (e.g., 6-digit random)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in a separate OTP table or in USER table with expiration
    await conn.execute(
      `UPDATE PUBLICUSER SET OTP_CODE = :otp, OTP_EXPIRY = SYSDATE + (5 / 1440) WHERE USERID = :userID`,
      { otp, userID },
      { autoCommit: true }
    );

    await conn.close();

    // Here you can send the OTP by email or SMS if needed

    // Respond with success or redirect user to a page to enter OTP
    res.status(200).send(`
      
      <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Email Verified</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f2f2f2;
        font-family: Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        text-align: center;
      }

      .container {
        background: #fff;
        padding: 40px 30px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        max-width: 90%;
        width: 400px;
      }

      h1 {
        font-size: 24px;
        color: #2d8f3c;
        margin-bottom: 20px;
      }

      p {
        font-size: 18px;
        color: #333;
      }

      .otp {
        font-size: 28px;
        font-weight: bold;
        margin-top: 15px;
        color: #007BFF;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Email Verified Successfully</h1>
      <p>Your One-Time Password (OTP) is:</p>
      <div class="otp">${otp}</div>
    </div>
  </body>
  </html>
      `);
  } catch (err) {
    console.error("Email verification failed:", err);
    return res.status(400).send("Invalid or expired token.");
  }
});

export default router;
