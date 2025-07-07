import express from "express";
import OracleDB from "oracledb";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("[POST] /getplatlicense called");
  const { userid } = req.body;

  if (!userid) {
    return res.status(400).json({ message: "User ID is required" });
  }

  let conn;

  try {
    conn = await OracleDB.getConnection();

    console.log("✅ Connected to Oracle DB for getplatlicense");

    const result = await conn.execute(
      `SELECT VEHICLEID, PLATLICENSE FROM VEHICLEDETAIL WHERE USERID = :userid`,
      [userid]
    );

    const plateList = result.rows.map((row) => ({
      vehicleID: row[0],
      plateLicense: row[1],
    }));

    console.log("✅ Fetched vehicle/plate list:", plateList);

    res.status(200).json({ plateList });
  } catch (err) {
    console.error("❌ [getplatlicense] DB error:", err.message);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;
