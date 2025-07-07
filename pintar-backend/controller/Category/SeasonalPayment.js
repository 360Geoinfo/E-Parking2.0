import express from "express";
import OracleDB from "oracledb";
import { v4 as uuidv4 } from "uuid";
import authenticateToken from "../Middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  console.log("[POST] /seasonalpayment called");

  const {
    userID,
    username,
    selectedPaymentMethod,
    monthlyPassTitle,
    monthlyPassPrice,
    days,
    startDate,
    endDate,
    plateLicense,
  } = req.body;

  if (
    !userID ||
    !username ||
    !selectedPaymentMethod ||
    !monthlyPassTitle ||
    !monthlyPassPrice ||
    !days ||
    !startDate ||
    !endDate ||
    !plateLicense
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const seasonalID = uuidv4();
  const idSeasonalTransaction = `SP-${uuidv4()}`;
  const seasonalBuyDate = new Date().toISOString().split("T")[0];
  const seasonalBuyTime = new Date().toLocaleTimeString("en-GB", {
    hour12: false,
  });
  const status = "Active";

  let conn;

  try {
    conn = await OracleDB.getConnection();

    console.log("✅ Connected to Oracle DB");

    await conn.execute(
      `INSERT INTO SEASONAL (
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
      ) VALUES (
        :seasonalID,
        :userID,
        :idSeasonalTransaction,
        :paymentStatus,
        :username,
        :paymentMethod,
        :passTitle,
        :passPrice,
        TO_DATE(:buyDate, 'YYYY-MM-DD'),
        :buyTime,
        :seasonalPetak,
        TO_DATE(:startDate, 'DD/MM/YYYY'),
        TO_DATE(:endDate, 'DD/MM/YYYY'),
        :plateLicense,
        :status
      )`,
      {
        seasonalID,
        userID,
        idSeasonalTransaction,
        paymentStatus: "Paid",
        username,
        paymentMethod: selectedPaymentMethod,
        passTitle: monthlyPassTitle,
        passPrice: monthlyPassPrice,
        buyDate: seasonalBuyDate,
        buyTime: seasonalBuyTime,
        seasonalPetak: days,
        startDate,
        endDate,
        plateLicense,
        status: "Active",
      },
      { autoCommit: true }
    );

    // ✅ Also insert into RECEIPTSEASONAL table
    await conn.execute(
      `INSERT INTO RECEIPTSEASONAL (
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
      ) VALUES (
        :seasonalID,
        :userID,
        :idSeasonalTransaction,
        :paymentStatus,
        :username,
        :paymentMethod,
        :passTitle,
        :passPrice,
        TO_DATE(:buyDate, 'YYYY-MM-DD'),
        :buyTime,
        :seasonalPetak,
        TO_DATE(:startDate, 'DD/MM/YYYY'),
        TO_DATE(:endDate, 'DD/MM/YYYY'),
        :plateLicense,
        :status
      )`,
      {
        seasonalID,
        userID,
        idSeasonalTransaction,
        paymentStatus: "Paid",
        username,
        paymentMethod: selectedPaymentMethod,
        passTitle: monthlyPassTitle,
        passPrice: monthlyPassPrice,
        buyDate: seasonalBuyDate,
        buyTime: seasonalBuyTime,
        seasonalPetak: days,
        startDate,
        endDate,
        plateLicense,
        status: "Active",
      },
      { autoCommit: true }
    );

    console.log(
      `✅ Inserted record into RECEIPTSEASONAL with ID = ${seasonalID}`
    );

    res.status(201).json({
      message: "SeasonalPayment Successful",
      seasonalID,
      idSeasonalTransaction,
      status,
    });
  } catch (err) {
    console.error("❌ [SeasonalPayment] Database error:", err);
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
