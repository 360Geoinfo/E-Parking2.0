import dotenv from "dotenv";
import OracleDB from "oracledb";

dotenv.config(".env.dev");
export default function ({
  socket,
  authenticateToken,
  io,
  jwt,
  bcrypt,
  uuidv4,
}) {
  //Add Vehicle ==================================================================================================
  socket.on("addVehicle", async (data, res) => {
    console.log("[SOCKET] addVehicle called with data:", data);
    const { userid, PlateLicense, VehicleTypes, VehicleModel, VehicleColor } =
      data;
    console.log("Received vehicle data:", {
      userid,
      PlateLicense,
      VehicleTypes,
      VehicleModel,
      VehicleColor,
    });
    if (
      !userid ||
      !PlateLicense ||
      !VehicleTypes ||
      !VehicleModel ||
      !VehicleColor
    ) {
      console.log("❌ Missing fields in request body");
      return res({ status: 400, error: "All fields are required" });
    }
    const vehicleId = uuidv4(); // Unique vehicle ID
    let conn;
    try {
      conn = await OracleDB.getConnection();
      console.log("✅ Connected to Oracle DB for addVehicle");
      // Check if plate already exists
      const plateCheck = await conn.execute(
        `SELECT * FROM VehicleDetail WHERE PLATLICENSE = :plate AND USERID = :userid`,
        [PlateLicense, userid]
      );
      console.log("Plate check result:", plateCheck.rows);
      if (plateCheck.rows.length > 0) {
        console.log("❌ Plate already exists:", PlateLicense);
        return res({ status: 409, error: "Vehicle already registered" });
      }
      // Insert vehicle
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
      return res({
        status: 201,
        message: "Vehicle added successfully",
        vehicleID: vehicleId,
      });
    } catch (err) {
      console.error("❌ [addVehicle] DB error:", err.message);
      return res({
        status: 500,
        error: "Database error",
        details: err.message,
      });
    } finally {
      if (conn) await conn.close();
    }
  });

  // app.post("/addvehicle", authenticateToken, async (req, res) => {
  //   console.log("[POST] /addvehicle called");

  //   const { userid, PlateLicense, VehicleTypes, VehicleModel, VehicleColor } =
  //     req.body;
  //   console.log("Received vehicle data:", {
  //     userid,
  //     PlateLicense,
  //     VehicleTypes,
  //     VehicleModel,
  //     VehicleColor,
  //   });

  //   if (
  //     !userid ||
  //     !PlateLicense ||
  //     !VehicleTypes ||
  //     !VehicleModel ||
  //     !VehicleColor
  //   ) {
  //     console.log("❌ Missing fields in request body");
  //     return res.status(400).json({ message: "All fields are required" });
  //   }

  //   const vehicleId = uuidv4(); // Unique vehicle ID
  //   const conn = await OracleDB.getConnection();

  //   try {
  //     console.log("✅ Connected to Oracle DB for addvehicle");

  //     // Check if plate already exists
  //     const plateCheck = await conn.execute(
  //       `SELECT * FROM VehicleDetail WHERE PLATLICENSE = :plate`,
  //       [PlateLicense]
  //     );

  //     console.log("Plate check result:", plateCheck.rows);

  //     if (plateCheck.rows.length > 0) {
  //       console.log("❌ Plate already exists:", PlateLicense);
  //       return res.status(409).json({ message: "Vehicle already registered" });
  //     }

  //     // Insert vehicle
  //     await conn.execute(
  //       `INSERT INTO VehicleDetail (USERID, VEHICLEID, PLATLICENSE, VEHICLETYPES, VEHICLEMODEL, VEHICLECOLOUR)
  //      VALUES (:userid, :vehicleid, :plate, :type, :model, :color)`,
  //       {
  //         userid,
  //         vehicleid: vehicleId,
  //         plate: PlateLicense,
  //         type: VehicleTypes,
  //         model: VehicleModel,
  //         color: VehicleColor,
  //       },
  //       { autoCommit: true }
  //     );

  //     console.log("✅ Vehicle inserted successfully with ID:", vehicleId);

  //     res.status(201).json({
  //       message: "Vehicle added successfully",
  //       vehicleID: vehicleId,
  //     });
  //   } catch (err) {
  //     console.error("❌ [addvehicle] DB error:", err.message);
  //     res.status(500).json({ message: "Database error", error: err.message });
  //   } finally {
  //     if (conn) await conn.close();
  //   }
  // });
  //Add Vehicle ==================================================================================================

  //Fetching PlatLicense ==================================================================================================
  socket.on("getlicenseplates", async ({ userID }, res) => {
    if (!userID) {
      console.error("User ID is required");
      return res({ status: 400, error: "User ID is required" });
    }
    let conn = await OracleDB.getConnection();
    try {
      const result = await conn.execute(
        `SELECT VEHICLEID, PLATLICENSE FROM VEHICLEDETAIL WHERE USERID = :userid`,
        [userID]
      );
      if (result.rows.length === 0) {
        console.log("No vehicle details found for user:", userID);
        return res({ status: 404, error: "No vehicle details found" });
      }
      const plateList = result.rows.map((row) => ({
        vehicleID: row[0],
        plateLicense: row[1],
      }));

      return res({ status: 200, data: plateList });
    } catch (error) {
      return res({ status: 500, error: error.message });
    } finally {
      if (conn) await conn.close();
    }
  });
  //   app.post("/getplatlicense", async (req, res) => {
  //     console.log("[POST] /getplatlicense called");
  //     const { userid } = req.body;

  //     if (!userid) {
  //       return res.status(400).json({ message: "User ID is required" });
  //     }
  //     const conn = await OracleDB.getConnection();

  //     try {
  //       console.log("Connected to Oracle DB for getplatlicense");

  //       const result = await conn.execute(
  //         `SELECT VEHICLEID, PLATLICENSE FROM VEHICLEDETAIL WHERE USERID = :userid`,
  //         [userid]
  //       );

  //       const plateList = result.rows.map((row) => ({
  //         vehicleID: row[0],
  //         plateLicense: row[1],
  //       }));

  //       console.log("Fetched vehicle/plate list:", plateList);

  //       res.status(200).json({ plateList });
  //     } catch (err) {
  //       console.error("[getplatlicense] DB error:", err.message);
  //       res.status(500).json({ message: "Database error", error: err.message });
  //     } finally {
  //       if (conn) await conn.close();
  //     }
  //   });

  //Fetching PlatLicense ==================================================================================================
}
