import express from "express";
import OracleDB from "oracledb";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("[POST] /getreceiptparking called");
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  let conn;

  try {
    conn = await OracleDB.getConnection();

    console.log("✅ Connected to Oracle DB for getreceiptparking");

    // Step 1: Check if USERNAME exists in PUBLICUSER
    const userCheck = await conn.execute(
      `SELECT 1 FROM PUBLICUSER WHERE USERNAME = :username`,
      [username]
    );

    if (userCheck.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Username not found in PUBLICUSER" });
    }

    // Step 2: Query latest PETAK receipt for USERNAME
    const result = await conn.execute(
      `SELECT * FROM (
        SELECT IDTRANSACTION, USERNAME, PAYMENTMETHOD, BUYDATE, BUYTIME, PAYMENTAMOUNT, PETAKDIGIT
        FROM PETAK
        WHERE USERNAME = :username
        ORDER BY BUYTIME DESC
      ) WHERE ROWNUM = 1`,
      [username],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );


    if (result.rows.length === 0) {
      //return res.status(404).json({ message: 'No petak purchases found for this user' });
      console.log(`⚠️ No petak purchases found for user: ${username}`);
    }

    console.log(`✅ Fetched latest receipt for ${username}`);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("❌ [getreceiptparking] DB error:", err.message);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;
