import express from "express";
import OracleDB from "oracledb";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("[POST] /getvehicledetail called");
  const { userid } = req.body;

  if (!userid) {
    return res.status(400).json({ message: "User ID is required" });
  }

  let conn;

  try {
    conn = await OracleDB.getConnection();

    console.log("✅ Connected to Oracle DB for getvehicledetail");

    const result = await conn.execute(
      `SELECT VEHICLEID, PLATLICENSE, VEHICLETYPES, VEHICLEMODEL, VEHICLECOLOUR
       FROM VEHICLEDETAIL
       WHERE USERID = :userid`,
      [userid],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT } // return result as array of objects
    );

    console.log("✅ Fetched vehicle details:", result.rows);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ [getvehicledetail] DB error:", err.message);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;
