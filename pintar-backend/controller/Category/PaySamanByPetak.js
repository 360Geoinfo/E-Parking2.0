import express from "express";
import OracleDB from "oracledb";

const router = express.Router();
const getUser = async (field, identifier, conn) => {
  try {
    const query = `SELECT * FROM PUBLICUSER WHERE ${field} = :identifier`;
    const result = await conn.execute(query, [identifier], {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ Error fetching user:", error.message);
    throw error;
  }
};
const getPetak = async (field, identifier, conn) => {
  try {
    const query = `SELECT * FROM PETAK WHERE ${field} = :identifier`;
    const result = await conn.execute(query, [identifier], {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows[result.rows.length - 1] || []; // Return the last row if exists
  } catch (error) {
    console.error("❌ Error fetching petak:", error.message);
    throw error;
  }
};

router.post("/", async (req, res) => {
  console.log("[POST] /paybypetak called");

  const { username, samanid, jumlahPetak } = req.body;
  console.log("Received payment data:", { username, samanid, jumlahPetak });

  if (!username || !samanid || !jumlahPetak || isNaN(jumlahPetak)) {
    console.log("❌ Missing username, samanid, or jumlahPetak");
    return res
      .status(400)
      .json({ message: "Username, samanid and jumlahPetak are required" });
  }

  let conn;

  try {
    conn = await OracleDB.getConnection();

    console.log("✅ Connected to Oracle DB for PETAK deduction");

    // Get current PETAKDIGIT
    const petakResult = await conn.execute(
      `SELECT PETAKDIGIT 
        FROM (
          SELECT PETAKDIGIT 
          FROM PETAK 
          WHERE USERNAME = :username 
          ORDER BY BUYDATE DESC, BUYTIME DESC
        )
        WHERE ROWNUM = 1`,
      [username],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    if (petakResult.rows.length === 0) {
      console.log("❌ User not found in PETAK table:", username);
      return res.status(404).json({ message: "User not found in PETAK table" });
    }

    const currentPetak = petakResult.rows[0].PETAKDIGIT;

    if (currentPetak < jumlahPetak) {
      console.log(
        `❌ Not enough PETAK. Required: ${jumlahPetak}, Available: ${currentPetak}`
      );
      return res.status(400).json({
        message: `Not enough PETAK. You have ${currentPetak}, need ${jumlahPetak}`,
      });
    }

    // Deduct jumlahPetak
    await conn.execute(
      `UPDATE PETAK 
       SET PETAKDIGIT = PETAKDIGIT - :jumlahPetak, BUYDATE = SYSDATE 
       WHERE USERNAME = :username`,
      { jumlahPetak, username },
      { autoCommit: false }
    );

    // Update SAMAN table to mark as paid
    await conn.execute(
      `UPDATE SAMAN 
       SET STATUS = 'PAID', SAMANDATE = SYSDATE 
       WHERE SAMANID = :samanid`,
      [samanid],
      { autoCommit: false }
    );

    await conn.commit();

    console.log(
      `✅ ${jumlahPetak} PETAK deducted and SAMAN paid for user: ${username}`
    );
    const user = await getUser("USERNAME", username, conn);
    const newPetakData = await getPetak("USERID", user.USERID, conn);
    req.io.emit("petakDeduct", {
      status: 200,
      USERID: user?.USERID,
      PETAK: newPetakData,
    });
    res.status(200).json({
      message: `Payment successful. ${jumlahPetak} PETAK deducted.`,
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("❌ Payment error:", err.message);
    res.status(500).json({
      message: "Payment failed. Please check your data or try again later.",
      error: err.message,
    });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;
