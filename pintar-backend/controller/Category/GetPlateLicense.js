import express from "express";
import OracleDB from "oracledb";
import jwt from "jsonwebtoken";

// If authenticateToken middleware is reused, import it from a shared file
// or define it again here if not modularized yet:

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
  console.log("[POST] /getplatelicense called");

  const { userid, function: func } = req.body || {};
  console.log("Request body:", req.body);

  if (func !== "get plate license") {
    return res.status(400).json({ message: "Invalid function type" });
  }

  let conn;
  try {
    conn = await OracleDB.getConnection();
    console.log("✅ Connected to Oracle DB for plate license lookup");

    const result = await conn.execute(
      `SELECT PLATLICENSE FROM VEHICLEDETAIL WHERE USERID = :userid`,
      [userid],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0 || !result.rows[0].PLATLICENSE) {
      console.log("❌ Plate license not found");
      return res
        .status(404)
        .json({ message: "Plate license not found", PLATLICENSE: null });
    }

    const plate = result.rows[0].PLATLICENSE;
    console.log("✅ Plate license found:", plate);

    res.json({ message: "Plate license found", PLATLICENSE: plate });
  } catch (err) {
    console.error("❌ [getplatelicense] DB error:", err.message);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;
