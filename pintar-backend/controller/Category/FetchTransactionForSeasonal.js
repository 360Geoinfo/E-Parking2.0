// File: routes/seasonalStatusDetails.js
import express from "express";
import OracleDB from "oracledb";
import authenticateToken from "../Middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  console.log("[POST] /fetchtransactionforseasonal called");

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  let conn;
  try {
    conn = await OracleDB.getConnection();

    const result = await conn.execute(
      `
      SELECT 
        SEASONALID,
        USERID,
        IDSEASONALTRANSACTION,
        PAYMENTSTATUSSEASONAL,
        USERNAME,
        SEASONALPAYMENTMETHOD,
        MONTHLYPASSTITLE,
        MONTHLYPASSPRICE,
        SEASONALBUYDATE,
        SEASONALBUYTIME,
        SEASONALPETAK,
        STARTDATE,
        ENDDATE,
        VEHICLEPLATELICENSE,
        STATUS
      FROM RECEIPTSEASONAL
      WHERE USERNAME = :username
      `,
      { username },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    console.log("Seasonal status result:", result.rows);

    if (result.rows.length === 0) {
      return res.json({
        message: "No SEASONAL records found",
        seasonalRecords: [],
      });
    }

    return res.json({
      message: "SEASONAL records found",
      seasonalRecords: result.rows,
    });
  } catch (err) {
    console.error("Database error:", err.message, err);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;


