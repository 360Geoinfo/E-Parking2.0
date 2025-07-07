import express from "express";
import OracleDB from "oracledb";
import { v4 as uuidv4 } from "uuid";
import authenticateToken from "../Middleware/authenticateToken.js";
import dayjs from "dayjs";

const router = express.Router();

const getPetak = async (field, identifier, conn) => {
  try {
    const result = await conn.execute(
      `SELECT * FROM Petak WHERE ${field} = :identifier`,
      { identifier },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    return result.rows[result.rows.length - 1] || []; // Return the last row if exists
  } catch (error) {
    console.error("Error fetching Petak data:", error);
  }
};

router.post("/", authenticateToken, async (req, res) => {
  console.log("[POST] /outdoorparking called");

  const {
    userID,
    Vehicleid,
    PlatLicense,
    Duration,
    location,
    IDTransaction,
    zone,
  } = req.body;
  const username = req.user?.username;
  console.log("Received data:", {
    userID,
    Vehicleid,
    PlatLicense,
    Duration,
    location,
    IDTransaction,
    username,
    zone,
  });

  if (
    !userID ||
    !Vehicleid ||
    !PlatLicense ||
    !Duration ||
    !location ||
    !IDTransaction ||
    !username ||
    !zone
  ) {
    return res
      .status(400)
      .json({ message: "All fields are required, including username" });
  }

  const parsedDuration = parseInt(Duration);

  if (isNaN(parsedDuration) || parsedDuration <= 0) {
    return res
      .status(400)
      .json({ message: "Duration must be a positive number" });
  }

  let conn;

  try {
    conn = await OracleDB.getConnection();
    console.log("✅ Connected to Oracle DB");

    // Check if username exists in Petak table
    const usernameCheck = await conn.execute(
      `SELECT COUNT(*) AS COUNT FROM Petak WHERE USERNAME = :username`,
      { username },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    console.log("Username check result:", usernameCheck.rows[0]);

    const userExistsInPetak = usernameCheck.rows[0]?.COUNT;

    if (userExistsInPetak === 0) {
      return res.status(404).json({
        code: "NO_PETAK_RECORD",
        message: "User has no Petak balance",
      });
    }

    // Check PETAKDIGIT for the specific transaction
    const petakCheck = await conn.execute(
      `SELECT PETAKDIGIT FROM Petak WHERE IDTRANSACTION = :idTransaction`,
      { idTransaction: IDTransaction },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    console.log("PETAKDIGIT check result:", petakCheck.rows[0]);

    const currentPetakRaw = petakCheck.rows[0]?.PETAKDIGIT;

    if (currentPetakRaw == null) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Convert PETAKDIGIT string to number safely
    const currentPetak = Number(currentPetakRaw.trim());

    if (isNaN(currentPetak)) {
      return res
        .status(500)
        .json({ message: "Invalid petak balance from database" });
    }

    //currentpetak is from PETAKDIGIT
    //parsedDuration is from front end = const newDuration = originalDuration + addedDuration;

    if (currentPetak <= 0 || currentPetak < parsedDuration) {
      return res.status(400).json({
        message: `Insufficient petak balance. Available: ${currentPetak}, required: ${parsedDuration}`,
        currentPetak,
      });
    }

    // Insert OutdoorParking
    const parkingId = uuidv4();
    const payload = {
      outdoorID: parkingId,
      userID,
      vehicleID: Vehicleid,
      plat: PlatLicense,
      duration: parsedDuration,
      location,
      zone,
      startDate: dayjs().format("YYYY-MM-DD"),
      startTime: dayjs().format("HH:mm"),
      petakStatus: "Active",
    };
    console.log("Payload for OutdoorParking insert:", payload);

    const insertOutdoor = await conn.execute(
      `INSERT INTO OutdoorParking (
        OUTDOORID, USERID, VEHICLEID, PLATLICENSE, DURATION, LOCATION, ZONE,
        STARTDATE, STARTTIME, PETAKSTATUS
      ) VALUES (
        :outdoorID, :userID, :vehicleID, :plat, :duration, :location, :zone,
        :startDate, :startTime, :petakStatus
      )`,
      payload
    );

    console.log("OutdoorParking insert result:", insertOutdoor);
    // Deduct PETAKDIGIT using TO_NUMBER and TO_CHAR to avoid varchar issues
    const updatePetak = await conn.execute(
      `UPDATE Petak
       SET PETAKDIGIT = TO_CHAR(TO_NUMBER(PETAKDIGIT) - :parsedDuration)
       WHERE IDTRANSACTION = :IDTransaction`,
      { parsedDuration, IDTransaction }
    );
    /// start sini nda mau

    console.log("Petak update result:", updatePetak);
    // Get new PETAKDIGIT value
    const updatedResult = await conn.execute(
      `SELECT PETAKDIGIT FROM Petak WHERE IDTRANSACTION = :idTransaction`,
      { idTransaction: IDTransaction },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );

    const updatedPetakRaw = updatedResult.rows[0]?.PETAKDIGIT;
    const updatedPetak = Number(updatedPetakRaw.trim());

    if (isNaN(updatedPetak)) {
      await conn.rollback();
      return res
        .status(500)
        .json({ message: "Invalid updated petak balance from database" });
    }

    // Final safeguard
    if (updatedPetak < 0) {
      await conn.rollback();
      return res.status(400).json({
        message: "Transaction blocked. Petak balance would go negative.",
        remainingPetak: updatedPetak,
      });
    }

    await conn.commit();
    const newPetakData = await getPetak("USERID", userID, conn);
    req.io.emit("petakDeduct", {
      status: 200,
      USERID: userID,
      PETAK: newPetakData,
    });
    res.status(201).json({
      message: "Outdoor parking data inserted successfully",
      parkingID: parkingId,
      petakUpdate: `Petak deducted by -${parsedDuration}`,
      remainingPetak: updatedPetak,
    });
  } catch (err) {
    console.error("❌ Database error:", err.message);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;
