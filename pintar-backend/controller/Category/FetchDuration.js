import express from "express";
import OracleDB from "oracledb";
import authenticateToken from "../Middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  console.log("[POST] /fetchduration called");

  const { userID } = req.body;

  if (!userID) {
    return res.status(400).json({ message: "UserID is required" });
  }

  let conn;
  try {
    conn = await OracleDB.getConnection();

    const result = await conn.execute(
      `
      SELECT 
        OUTDOORID,
        USERID,
        VEHICLEID,
        PLATLICENSE,
        DURATION,
        LOCATION,
        STARTTIME,
        STARTDATE,
        ZONE,
        ENDTIME
      FROM OUTDOORPARKING
      WHERE USERID = :userID
      `,
      { userID },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    console.log("Outdoor status result:", result.rows);

    if (result.rows.length === 0) {
      return res.json({
        message: "No OUTDOOR records found",
        outdoorRecords: [],
      });
    }

    return res.json({
      message: "OUTDOOR records found",
      outdoorRecords: result.rows,
    });
  } catch (err) {
    console.error("Database error:", err.message, err);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;
