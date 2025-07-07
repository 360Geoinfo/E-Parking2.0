// File: routes/seasonalStatus.js
import express from "express";
import OracleDB from "oracledb";
import authenticateToken from "../Middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  console.log("[POST] /seasonalactiveinactive called");

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
        IDSEASONALTRANSACTION,
        STATUS,
        MONTHLYPASSTITLE,
        MONTHLYPASSPRICE,
        STARTDATE,
        ENDDATE,
        SEASONALPETAK,
        VEHICLEPLATELICENSE
      FROM SEASONAL
      WHERE USERNAME = :username AND STATUS = 'Active'
      `,
      { username },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    console.log("Active seasonals:", result.rows);

    if (result.rows.length === 0) {
      return res.json({
        message: "No active seasonal passes found",
        activeSeasonals: [],
      });
    }

    return res.json({
      message: "Active seasonal passes found",
      activeSeasonals: result.rows,
    });
  } catch (err) {
    console.error("Database error:", err.message, err);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;
