import express from "express";
import OracleDB from "oracledb";
import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  console.log("[POST] /getsamanhistory called");

  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  let conn;
  try {
    conn = await OracleDB.getConnection();

    console.log("✅ Connected to Oracle DB for saman history");

    const result = await conn.execute(
      `SELECT 
        SAMANID,
        USERID,
        USERNAME,
        VEHICLEID,
        PLATLICENSE,
        LOCATION,
        TO_CHAR(SAMANDATE, 'YYYY-MM-DD') AS SAMANDATE,
        SAMANTIME,
        STATUS,
        STARTTIME
      FROM SAMAN
      WHERE USERNAME = :username
        AND STATUS NOT IN ('Kereta Telah Keluar', 'PAID')
      ORDER BY SAMANDATE DESC, SAMANTIME DESC`,
      { username },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      console.log(`No saman history found for username: ${req.body.username}`);
      // Optionally return empty result instead of 404
    }

    return res.json({
      message: "Saman history retrieved successfully",
      data: result.rows,
    });
  } catch (err) {
    console.error("❌ [getsamanhistory] DB error:", err.message);
    return res
      .status(500)
      .json({ message: "Database error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;