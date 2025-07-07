import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import OracleDB from "oracledb";

const router = express.Router();
const getUser = async (field, identifier, conn) => {
  try {
    const result = await conn.execute(
      `SELECT * FROM PUBLICUSER WHERE ${field} = :identifier`,
      { identifier },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    const { password, ...userData } = result.rows[0] || {};
    return userData || null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

router.post("/", async (req, res) => {
  console.log("[POST] /login called");
  const { username, password } = req.body;
  console.log("Login attempt with:", username);

  if (!username || !password) {
    console.log("❌ Missing username or password");
    return res
      .status(400)
      .json({ message: "Username and Password are required" });
  }

  let conn;
  try {
    conn = await OracleDB.getConnection();
    console.log("✅ Connected to Oracle DB for login");

    const result = await conn.execute(
      `SELECT USERID, USERNAME, PASSWORD, ACCOUNTSTATUS, LOGINSTATUS
       FROM PUBLICUSER
       WHERE USERNAME = :username`,
      [username]
    );

    if (result.rows.length === 0) {
      console.log("❌ User not found:", username);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const [userID, dbUsername, dbPassword, accountStatus, loginStatus] =
      result.rows[0];

    // Check if the account is unverified
    if (accountStatus === "UNVERIFIED") {
      console.log(`❌ Account for ${username} is not verified`);
      return res.status(403).json({
        message:
          "Your account is not activated. Please check your email and verify your account.",
      });
    }

    // Check if the account has been marked as deleted
    if (accountStatus === "INACTIVE") {
      console.log(`❌ Account for ${username} is deleted`);
      return res
        .status(403)
        .json({ message: "Account has been deleted by user." });
    }

    const passwordMatch = await bcrypt.compare(password, dbPassword);

    if (!passwordMatch) {
      console.log("❌ Incorrect password for:", username);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username, userID }, process.env.JWT_SECRET);
    console.log("🔐 Token generated");

    await conn.execute(
      `UPDATE PUBLICUSER SET TOKEN = :token, LOGINSTATUS = 'LOG IN' WHERE USERNAME = :username`,
      { token, username },
      { autoCommit: true }
    );

    const petakResult = await conn.execute(
      `SELECT IDTRANSACTION FROM PETAK WHERE USERNAME = :username ORDER BY BUYTIME DESC FETCH FIRST 1 ROWS ONLY`,
      [username]
    );
    const idtransation =
      petakResult.rows.length > 0 ? petakResult.rows[0][0] : "";

    const seasonalResult = await conn.execute(
      `SELECT IDSEASONALTRANSACTION FROM SEASONAL WHERE USERNAME = :username ORDER BY SEASONALBUYTIME DESC FETCH FIRST 1 ROWS ONLY`,
      [username]
    );
    const idseasonaltransaction =
      seasonalResult.rows.length > 0 ? seasonalResult.rows[0][0] : "";

    console.log("✅ Login successful. Sending response");
    if (loginStatus !== "LOG IN") {
      console.log(`🔔 User ${username} logged in`);
      req.io.emit("newUserLogin", {
        status: 200,
        USERID: userID,
      });
    }
    res.json({
      userID,
      username,
      idtransation,
      idseasonaltransaction,
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({
      message: "Login failed. Please check your network or try again later.",
    });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;
