import express from "express";
import OracleDB from "oracledb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import emailModule from "../Middleware/EmailModule.js";

const router = express.Router();

/**
 * POST /resetpassword
 * Request password reset and send token via email
 */
router.post("/", async (req, res) => {
  const { email } = req.body;
  console.log("[POST] /resetpassword called with:", email);

  if (!email?.trim()) {
    return res.status(400).json({ message: "Email is required" });
  }

  let conn;
  try {
    conn = await OracleDB.getConnection();

    const result = await conn.execute(
      `SELECT USERID, USERNAME, PHONENUMBER FROM PUBLICUSER 
       WHERE EMAIL = :email AND ACCOUNTSTATUS IN ('ACTIVE', 'UNVERIFIED')`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const [userID, username, phonenumber] = result.rows[0];

    const resetToken = jwt.sign({ email, userID }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    await conn.execute(
      `UPDATE PUBLICUSER SET TOKEN = :token WHERE USERID = :userID`,
      { token: resetToken, userID },
      { autoCommit: true }
    );

    await emailModule.sendEmail({
      to: email,
      subject: "Reset Your Smart Parking Password",
      html: `
        <h3>Hello ${username},</h3>
        <p>You requested a password reset for your Smart Parking account.</p>
        <p>Click the link below to reset your password (valid for 1 hour):</p>
        <a href="http://server360.i-8ea.com/reset-password?token=${resetToken}"
           style="display:inline-block;padding:10px 20px;background-color:#28a745;color:white;text-decoration:none;border-radius:5px;">
          Reset Password
        </a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    return res.status(200).json({ message: "Reset link sent to your email." });
  } catch (err) {
    console.error("❌ Forgot password error:", err);
    return res
      .status(500)
      .json({ message: "An error occurred. Please try again later." });
  } finally {
    if (conn) await conn.close();
  }
});

// GET /resetpassword/verify-token?token=...
router.get("/verify-token", async (req, res) => {
  const { token } = req.query;

  console.log("Received token:", token); // Add this

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  let conn;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, userID } = decoded;

    conn = await OracleDB.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });

    const result = await conn.execute(
      `SELECT USERNAME, PHONENUMBER FROM PUBLICUSER WHERE USERID = :userID AND EMAIL = :email`,
      [userID, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const [username, phonenumber] = result.rows[0];

    res.json({ email, username, phonenumber });
  } catch (err) {
    console.error("❌ Token verification error:", err.message);
    res.status(400).json({ error: "Invalid or expired token" });
  } finally {
    if (conn) await conn.close();
  }
});

router.post("/update-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ error: "Token and new password are required" });
  }

  let conn;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, userID } = decoded;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    conn = await OracleDB.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });

    await conn.execute(
      `UPDATE PUBLICUSER SET PASSWORD = :password WHERE USERID = :userID AND EMAIL = :email`,
      { password: hashedPassword, userID, email },
      { autoCommit: true }
    );

    return res.json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("❌ Password reset error:", err.message);
    return res.status(400).json({
      error: "Failed to reset password. Token may be invalid or expired.",
    });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;
