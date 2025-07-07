import express from "express";
import OracleDB from "oracledb";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userID = decoded.userID;

    const conn = await OracleDB.getConnection();

    await conn.execute(
      `UPDATE PUBLICUSER SET TOKEN = NULL, LOGINSTATUS = 'LOG OUT' WHERE USERID = :userID`,
      { userID },
      { autoCommit: true }
    );

    console.log(`[Logout] ✅ Token cleared for userID: ${userID}`);

    req.io.emit("userLoggedOut", {
      status: 200,
      USERID: userID,
    });
    res.status(200).json({ message: "Logout successful" });

    await conn.close();
  } catch (err) {
    console.error("[Logout] ❌ Error:", err.message);
    res.status(401).json({ message: "Invalid token or logout failed" });
  }
});

export default router;
