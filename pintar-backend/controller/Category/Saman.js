import express from "express";
import OracleDB from "oracledb";
import { v4 as uuidv4 } from "uuid";
import authenticateToken from "../Middleware/authenticateToken.js";

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
  console.log("[POST] /saman called");

  const {
    userID,
    Vehicleid,
    PlatLicense,
    Duration,
    location,
    zone,
    startTime,
  } = req.body;
  const username = req.user?.username;

  console.log("Received:", {
    userID,
    Vehicleid,
    PlatLicense,
    Duration,
    location,
    username,
    zone,
    startTime,
  });

  // Basic field check
  if (
    !userID ||
    !Vehicleid ||
    !PlatLicense ||
    !location ||
    !username ||
    !zone ||
    !startTime
  ) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided" });
  }

  const samanID = uuidv4();
  const dateNow = new Date();
  const timeNow = dateNow.toTimeString().split(" ")[0]; // Format: 'HH:MM:SS'

  let conn;

  try {
    conn = await OracleDB.getConnection();

    console.log("✅ Connected to Oracle DB");

    await conn.execute(
      `INSERT INTO Saman (
      SAMANID, USERID, USERNAME, VEHICLEID, PLATLICENSE, LOCATION,
      SAMANDATE, SAMANTIME, STARTTIME, STATUS, ZONE
    )
    VALUES (
      :samanID, :userID, :username, :vehicleID, :plat, :location,
      :samanDate, :samanTime, :startTime, :status, :zone
    )`,
      {
        samanID,
        userID,
        username,
        vehicleID: Vehicleid,
        plat: PlatLicense,
        location,
        samanDate: dateNow,
        samanTime: timeNow,
        startTime, // already "HH:MM:SS"
        status: "Saman",
        zone,
      }
    );

    // await conn.execute(
    //   `UPDATE OUTDOORPARKING
    //    SET PETAKSTATUS = 'Summon'
    //    WHERE VEHICLEID = :vehicleID AND ZONE = :zone`,
    //   {
    //     vehicleID: Vehicleid,
    //     zone,
    //   },
    //   { autoCommit: false }
    // );

    await conn.commit();

    return res.status(201).json({
      message: "Duration Times Up – Saman inserted successfully",
      samanID,
    });
  } catch (err) {
    console.error("❌ DB Error:", err.message);
    return res
      .status(500)
      .json({ message: "Database error", error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

export default router;
