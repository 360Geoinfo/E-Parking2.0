import express from "express";
import OracleDB from "oracledb";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const runAutoDeduct = async () => {
  console.log("[AUTO] Starting scheduled SEASONALPETAK deduction...");

  let conn;

  try {
    conn = await OracleDB.getConnection();

    console.log("✅ Connected to Oracle DB (Auto Deduct)");

    // Deduct 1 from SEASONALPETAK
    const deductResult = await conn.execute(
      `UPDATE SEASONAL
       SET SEASONALPETAK = SEASONALPETAK - 1
       WHERE SEASONALPETAK > 0
         AND ENDDATE >= SYSDATE`,
      [],
      { autoCommit: false }
    );

    console.log(
      `✅ Deducted 1 Day from ${deductResult.rowsAffected} record(s)`
    );

    // Set STATUS = 'inactive' where SEASONALPETAK is now 0
    const deactivateResult = await conn.execute(
      `UPDATE SEASONAL
       SET STATUS = 'Inactive'
       WHERE SEASONALPETAK = 0`,
      [],
      { autoCommit: false }
    );

    console.log(
      `✅ Marked ${deactivateResult.rowsAffected} record(s) as inactive`
    );

    // Commit both changes
    await conn.commit();
  } catch (err) {
    console.error("❌ [AUTO] Database error:", err.message);
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error(
          "❌ [AUTO] Error closing Oracle DB connection:",
          closeErr.message
        );
      }
    }
  }
};

// Run after 1 minute, then every 1 hour
setTimeout(() => {
  runAutoDeduct(); // first run after 1 minute
  setInterval(runAutoDeduct, 60 * 60 * 1000); // subsequent runs every 1 hour
}, 60 * 1000);

export default router;
