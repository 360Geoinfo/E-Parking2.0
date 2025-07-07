import express from "express";
import OracleDB from "oracledb";
import { v4 as uuidv4 } from "uuid";
import authenticateToken from "../Middleware/authenticateToken.js";
import dayjs from "dayjs";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  console.log("[POST] /petakpayment called");

  const {
    userID,
    IDTRANSACTION,
    USERNAME,
    PAYMENTSTATUS,
    PAYMENTAMOUNT,
    PAYMENTMETHOD,
  } = req.body;

  if (
    !userID ||
    !IDTRANSACTION ||
    !USERNAME ||
    !PAYMENTSTATUS ||
    !PAYMENTAMOUNT ||
    !PAYMENTMETHOD
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const petakID = uuidv4();
  let conn;

  try {
    conn = await OracleDB.getConnection();
    console.log("✅ Connected to Oracle DB");

    // ✅ Get latest PETAKDIGIT (only the most recent)
    const latestResult = await conn.execute(
      `SELECT PETAKDIGIT FROM Petak 
       WHERE USERNAME = :username 
       ORDER BY PAYMENTDATE DESC FETCH FIRST 1 ROWS ONLY`,
      [USERNAME],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    const previousDigitRaw = latestResult.rows[0]?.PETAKDIGIT || "0";
    const previousDigit = parseInt(previousDigitRaw) || 0;

    const paymentAmount = parseInt(PAYMENTAMOUNT);
    const finalPetak = previousDigit + paymentAmount;

    // ✅ Insert into Petak
    await conn.execute(
      `INSERT INTO Petak (
        PETAKID, USERID, PETAKDIGIT, IDTRANSACTION, USERNAME,
        PAYMENTSTATUS, PAYMENTAMOUNT, PAYMENTMETHOD, PAYMENTDATE,
        BuyDate, BuyTime
      ) VALUES (
        :petakID, :userID, :petakDigit, :idTransaction, :username,
        :paymentStatus, :paymentAmount, :paymentMethod, SYSDATE,
        TRUNC(SYSDATE), TO_TIMESTAMP(TO_CHAR(SYSDATE, 'HH24:MI:SS'), 'HH24:MI:SS')
      )`,
      {
        petakID,
        userID,
        petakDigit: finalPetak,
        idTransaction: IDTRANSACTION,
        username: USERNAME,
        paymentStatus: PAYMENTSTATUS,
        paymentAmount: PAYMENTAMOUNT,
        paymentMethod: PAYMENTMETHOD,
      },
      { autoCommit: true }
    );

    // ✅ Insert into RECEIPTPETAK
    await conn.execute(
      `INSERT INTO RECEIPTPETAK (
        PETAKID, USERID, PETAKDIGIT, PAYMENTSTATUS, PAYMENTAMOUNT,
        PAYMENTMETHOD, PAYMENTDATE, IDTRANSACTION, USERNAME, BUYDATE, BUYTIME
      ) VALUES (
        :petakID, :userID, :petakDigit, :paymentStatus, :paymentAmount,
        :paymentMethod, SYSDATE, :idTransaction, :username, TRUNC(SYSDATE),
        TO_TIMESTAMP(TO_CHAR(SYSDATE, 'HH24:MI:SS'), 'HH24:MI:SS')
      )`,
      {
        petakID,
        userID,
        petakDigit: finalPetak,
        paymentStatus: PAYMENTSTATUS,
        paymentAmount: PAYMENTAMOUNT,
        paymentMethod: PAYMENTMETHOD,
        idTransaction: IDTRANSACTION,
        username: USERNAME,
      },
      { autoCommit: true }
    );

    req.io.emit("petakTopUp", {
      status: 200,
      USERID: userID,
      PETAK: {
        PETAKID: petakID,
        PETAKDIGIT: finalPetak,
        PAYMENTSTATUS: PAYMENTSTATUS,
        PAYMENTAMOUNT: PAYMENTAMOUNT,
        PAYMENTMETHOD: PAYMENTMETHOD,
        PAYMENTDATE: dayjs().format("YYYY-MM-DDTHH:mm"),
        IDTRANSACTION: IDTRANSACTION,
        BUYDATE: dayjs().format("YYYY-MM-DD"),
        BUYTIME: dayjs().format("HH:mm:ss"),
      },
    });

    res.status(201).json({
      message: "Petak payment inserted successfully",
      petakID,
      previousPetakDigit: previousDigit,
      paymentAmount,
      petakDigitStored: finalPetak,
    });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;
