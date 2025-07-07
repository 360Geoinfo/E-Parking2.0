import express from "express";
import OracleDB from "oracledb";
import authenticateToken from "../Middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  console.log("[POST] /deleteaccount called");

  const { userID, ReasonDeleteAccount } = req.body;

  if (!userID) {
    return res.status(400).json({ message: "USERID is required" });
  }

  if (!ReasonDeleteAccount) {
    return res.status(400).json({ message: "ReasonDeleteAccount is required" });
  }

  let conn;
  try {
    conn = await OracleDB.getConnection();

    const updateResult = await conn.execute(
      `UPDATE PUBLICUSER
       SET ACCOUNTSTATUS = 'INACTIVE', 
           REASONDELETEACCOUNT = :ReasonDeleteAccount
       WHERE USERID = :userID`,
      { userID, ReasonDeleteAccount },
      { autoCommit: true }
    );

    if (updateResult.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "User not found or already deleted." });
    }

    console.log(`✅ Account status and reason updated for USERID: ${userID}`);
    return res
      .status(200)
      .json({ message: "Account deleted with reason successfully." });
  } catch (err) {
    console.error("❌ Database error:", err.message);
    return res
      .status(500)
      .json({ message: "Database error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;
