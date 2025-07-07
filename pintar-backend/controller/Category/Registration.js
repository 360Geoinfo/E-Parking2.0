import express from "express";
import OracleDB from "oracledb";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import emailModule from "../Middleware/EmailModule.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("[POST] /registration called");

  const { username, email, password, phonenumber } = req.body;
  console.log("Received registration data:", { username, email, phonenumber });

  // Basic null/undefined/empty validation
  if (
    !username?.trim() ||
    !email?.trim() ||
    !password?.trim() ||
    !phonenumber?.trim()
  ) {
    console.log("❌ Missing or empty required fields");
    return res.status(400).json({
      message:
        "Username, Email, Password, and Phonenumber are required and must not be empty.",
    });
  }

  const userID = uuidv4();
  let conn;

  try {
    conn = await OracleDB.getConnection();

    console.log("✅ Connected to Oracle DB for registration");

    // Check if email already exists
    const emailCheck = await conn.execute(
      `SELECT * FROM PUBLICUSER WHERE ACCOUNTSTATUS IN ('ACTIVE', 'UNVERIFIED') AND EMAIL = :email `,
      [email]
    );
    console.log("Email Check", { emails: emailCheck.rows });

    if (emailCheck.rows.length > 0) {
      console.log("❌ Email already exists:", email);
      return res.status(409).json({ message: "Email already exists" });
    }

    // Check if username already exists
    const usernameCheck = await conn.execute(
      `SELECT USERNAME FROM PUBLICUSER WHERE USERNAME = :username`,
      [username]
    );

    if (usernameCheck.rows.length > 0) {
      console.log("❌ Username already exists:", username);
      return res.status(409).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await conn.execute(
      `INSERT INTO PUBLICUSER (USERID, USERNAME, EMAIL, PASSWORD, PHONENUMBER, ACCOUNTSTATUS)
       VALUES (:userID, :username, :email, :password, :phonenumber, :accountStatus)`,
      {
        userID,
        username,
        email,
        password: hashedPassword,
        phonenumber,
        accountStatus: "UNVERIFIED",
      },
      { autoCommit: true }
    );

    // Create token
    const token = jwt.sign({ email, userID }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Update token in DB
    await conn.execute(
      `UPDATE PUBLICUSER SET TOKEN = :token WHERE USERID = :userID`,
      { token, userID },
      { autoCommit: true }
    );

    console.log("✅ Registration successful for:", email);

    // Send verification email using emailModule
    await emailModule.sendEmail({
      to: email,
      subject: "Verify Your Smart Parking Account",
      html: `
        <h3>Hello ${username},</h3>
        <p>Thank you for registering with Smart Parking.</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="http://server360.i-8ea.com/emailverification?token=${token}" 
           style="display:inline-block;padding:10px 20px;background-color:#007BFF;color:white;text-decoration:none;border-radius:5px;">
           Verify Email
        </a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    console.log(`📨 Verification email sent to ${email}`);

    // Respond to client
    res.status(201).json({
      message: "Registration successful. Verification email sent.",
      token,
    });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(500).json({
      message:
        "Registration failed. Please check your network or try again later.",
      error: err.message,
    });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;
