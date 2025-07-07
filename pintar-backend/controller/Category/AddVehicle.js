import express from "express";
import OracleDB from "oracledb";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("[POST] /addvehicle called");

  const { userid, PlateLicense, VehicleTypes, VehicleModel, VehicleColor } =
    req.body;
  console.log("Received vehicle data:", {
    userid,
    PlateLicense,
    VehicleTypes,
    VehicleModel,
    VehicleColor,
  });

  // Basic validation
  if (
    !userid ||
    !PlateLicense ||
    !VehicleTypes ||
    !VehicleModel ||
    !VehicleColor
  ) {
    console.log("❌ Missing fields in request body");
    return res.status(400).json({ message: "All fields are required" });
  }

  const vehicleId = uuidv4();
  let conn;

  try {
    conn = await OracleDB.getConnection();
    console.log("✅ Connected to Oracle DB for /addvehicle");

    // Check if the plate already exists
    const plateCheck = await conn.execute(
      `SELECT * FROM VehicleDetail WHERE PLATLICENSE = :plate`,
      { plate: PlateLicense }
    );


    console.log("Plate check result:", plateCheck.rows);

    if (plateCheck.rows.length > 0) {
      console.log("❌ Plate already exists:", PlateLicense);
      return res.status(409).json({ message: "Vehicle already registered" });
    }

    // Insert new vehicle
    await conn.execute(
      `INSERT INTO VehicleDetail (USERID, VEHICLEID, PLATLICENSE, VEHICLETYPES, VEHICLEMODEL, VEHICLECOLOUR)
       VALUES (:userid, :vehicleid, :plate, :type, :model, :color)`,
      {
        userid,
        vehicleid: vehicleId,
        plate: PlateLicense,
        type: VehicleTypes,
        model: VehicleModel,
        color: VehicleColor,
      },
      { autoCommit: true }
    );

    console.log("✅ Vehicle inserted successfully with ID:", vehicleId);

    res.status(201).json({
      message: "Vehicle added successfully",
      vehicleID: vehicleId,
    });
  } catch (err) {
    console.error("❌ [addvehicle] DB error:", err.message);
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (closeErr) {
        console.error("Error closing DB connection:", closeErr.message);
      }
    }
  }
});

export default router;
