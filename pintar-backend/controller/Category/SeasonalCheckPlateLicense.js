import express from "express";
import OracleDB from "oracledb";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("[POST] /seasonalcheckplatelicense called");

  const { username, Platlicense } = req.body;

  // Basic validation
  if (!username || !Platlicense) {
    console.log("❌ Missing username or Platlicense in request body");
    return res
      .status(400)
      .json({ message: "Both username and Platlicense are required" });
  }

  let conn;

  try {
    conn = await OracleDB.getConnection();

    console.log("✅ Connected to Oracle DB for /seasonalcheckplatelicense");

    // Query the SEASONAL table with both USERNAME and VEHICLEPLATELICENSE
    const checkResult = await conn.execute(
      `SELECT * FROM SEASONAL
       WHERE USERNAME = :username AND VEHICLEPLATELICENSE = :plate AND STATUS = 'Active'`,
      {
        username,
        plate: Platlicense,
      }
    );

    console.log("🔍 Query result:", checkResult.rows);

    if (checkResult.rows.length > 0) {
      console.log(
        `❌ Plate ${Platlicense} is already in use by ${username} with active status`
      );
      return res
        .status(409)
        .json({ message: "Vehicle already in use (active)" });
    }

    console.log(`✅ Plate ${Platlicense} is available for ${username}`);
    res.status(200).json({ message: "Plate is available" });
  } catch (err) {
    console.error("❌ [seasonalcheckplatelicense] DB error:", err.message);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error("❌ Error closing Oracle DB connection:", err.message);
      }
    }
  }
});

export default router;
