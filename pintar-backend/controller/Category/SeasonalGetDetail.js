import express from "express";
import OracleDB from "oracledb";
import authenticateToken from "../Middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  console.log("[POST] /seasonalgetdetail called");

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({
      message: "Username are required",
    });
  }

  let conn;

  try {
    conn = await OracleDB.getConnection();

    console.log("✅ Connected to Oracle DB");

    const fetchResult = await conn.execute(
      `SELECT SEASONALID,
              USERID,
              IDSEASONALTRANSACTION,
              PAYMENTSTATUSSEASONAL,
              USERNAME,
              SEASONALPAYMENTMETHOD,
              MONTHLYPASSTITLE,
              MONTHLYPASSPRICE,
              TO_CHAR(SEASONALBUYDATE, 'YYYY-MM-DD') AS SEASONALBUYDATE,
              SEASONALBUYTIME,
              SEASONALPETAK,
              VEHICLEPLATELICENSE,
              TO_CHAR(STARTDATE, 'YYYY-MM-DD') AS STARTDATE,
              TO_CHAR(ENDDATE, 'YYYY-MM-DD') AS ENDDATE,
              STATUS
         FROM SEASONAL
        WHERE USERNAME = :username AND STATUS = 'Active'`,
      { username },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    if (fetchResult.rows.length === 0) {
      return res.status(404).json({ message: "No matching record found" });
    }

    res.status(200).json({
      message: "Seasonal data fetched successfully",
      data: fetchResult.rows,
    });
  } catch (err) {
    console.error("❌ [seasonalgetdetail] Database error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error("❌ Error closing Oracle DB connection:", closeErr);
      }
    }
  }
});

export default router;
