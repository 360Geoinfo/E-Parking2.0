import express from "express";
import OracleDB from "oracledb";
import authenticateToken from "../Middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  console.log("[POST] /seasonalcancel called");

  const { IDSeasonalTransaction } = req.body;

  if (!IDSeasonalTransaction) {
    return res
      .status(400)
      .json({ message: "IDSeasonalTransaction is required" });
  }

  let conn;

  try {
    conn = await OracleDB.getConnection();

    console.log("✅ Connected to Oracle DB");

    const updateResult = await conn.execute(
      `UPDATE SEASONAL
       SET STATUS = 'Inactive'
       WHERE IDSEASONALTRANSACTION = :IDSeasonalTransaction`,
      { IDSeasonalTransaction },
      { autoCommit: true }
    );

    if (updateResult.rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "No record updated. ID may be invalid." });
    }

    res
      .status(200)
      .json({ message: "STATUS updated to inactive successfully." });
  } catch (err) {
    console.error("❌ [seasonalcancel] Database error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("❌ Error closing Oracle DB connection:", err);
      }
    }
  }
});

export default router;
