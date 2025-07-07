import express from "express";
import OracleDB from "oracledb";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("[POST] /getreceiptseasonal called");
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  let conn;

  try {
    conn = await OracleDB.getConnection();

    console.log("✅ Connected to Oracle DB for getreceiptseasonal");

    const result = await conn.execute(
      `SELECT IDSEASONALTRANSACTION, USERNAME, SEASONALPAYMENTMETHOD, MONTHLYPASSTITLE,
       MONTHLYPASSPRICE, SEASONALBUYDATE, SEASONALBUYTIME, SEASONALPETAK,
       STARTDATE, ENDDATE, VEHICLEPLATELICENSE
        FROM SEASONAL
        WHERE USERNAME = :username
        ORDER BY SEASONALBUYDATE DESC, SEASONALBUYTIME DESC
        FETCH FIRST 1 ROW ONLY`,
      [username],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      console.warn("⚠️ No seasonal records found for username:", username);
      return res
        .status(404)
        .json({ message: "No seasonal receipt found for this user" });
    }

    console.log(`✅ Fetched most recent seasonal receipt for ${username}`);
    res.status(200).json(result.rows[0]); // Return the single latest receipt
  } catch (err) {
    console.error("❌ [getreceiptseasonal] DB error:", err.message);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;
