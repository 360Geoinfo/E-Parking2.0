import dayjs from "dayjs";
import fs from "fs";
import OracleDB from "oracledb";
import path from "path";
import sharp from "sharp";

const getUsername = async (userId, conn) => {
  if (userId === "MANUAL") {
    return "Manual Entry";
  }
  try {
    const result = await conn.execute(
      `SELECT USERNAME FROM PUBLICUSER WHERE USERID = :userId`,
      [userId],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    return result.rows.length > 0 ? result.rows[0].USERNAME : "Unknown User";
  } catch (error) {
    console.error("❌ Error fetching username:", error.message);
    return "Unknown User";
  }
};
const getOperatorData = async (field, value, conn) => {
  const query = `SELECT * FROM OPERATORS WHERE ${field} = :value`;
  const result = await conn.execute(
    query,
    { value },
    { outFormat: OracleDB.OUT_FORMAT_OBJECT }
  );
  if (result.rows.length === 0) {
    console.log("❌ Operator not found:", value);
    return {
      ID: "Unknown",
      USERID: "Unknown Operator",
      USERNAME: "Unknown Operator",
      EMAIL: "unknown@example.com",
      PHONENUMBER: "Unknown",
    };
  }
  const { PASSWORD, CREATED_AT, UPDATED_AT, ...operatorData } = result.rows[0];
  return operatorData;
};

const findPayments = async (field, outdoorID, conn) => {
  try {
    const result = await conn.execute(
      `SELECT * FROM PAYMENT_TO_OPERATOR WHERE ${field} = :outdoorID`,
      [outdoorID],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0) {
      console.log("❌ Payment not found:", outdoorID);
      return null;
    }
    const operator = await getOperatorData(
      "USERID",
      result.rows[0].OPERATOR_ID,
      conn
    );
    return {
      paymentID: result.rows[0].PAYMENT_ID,
      amount: result.rows[0].AMOUNT,
      paymentDate: result.rows[0].PAYMENT_DATE,
      status: result.rows[0].STATUS,
      paymentMethod: result.rows[0].PAYMENT_METHOD,
      operator,
    };
  } catch (error) {
    console.error("❌ Error finding payments:", error.message);
    return null;
  }
};

const getVehicle = async (field, identifier, conn) => {
  console.log(`🔍 Fetching vehicle by ${field}:`, identifier);
  try {
    const result = await conn.execute(
      `SELECT * FROM VEHICLEDETAIL WHERE ${field} = :identifier`,
      [identifier],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    console.log(`🚗 Vehicle fetched by ${field}:`, result);

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("❌ Error fetching vehicle:", error.message);
    return null;
  }
};

const getZoneData = async (field, identifier, conn) => {
  try {
    const result = await conn.execute(
      `SELECT * FROM ZONES WHERE ${field} = :identifier`,
      [identifier.trim()],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0) {
      console.log("❌ Zone not found:", identifier);
    }
    const zone = result.rows[0];
    return zone;
  } catch (error) {
    console.error("❌ Error fetching zone data:", error.message);
    return null;
  }
};

// Helper: check if plate exists in DB
const findPlateInDB = async (plate) => {
  const conn = await OracleDB.getConnection();
  try {
    const result = await conn.execute(
      "SELECT * FROM VEHICLEDETAIL WHERE PLATLICENSE = :plate",
      { plate },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length > 0) {
      console.log("✅ Found plate in DB:", plate);
      return plate;
    }
  } catch (err) {
    console.error("❌ DB error:", err.message);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
  return null;
};
const getUserData = async (field, value, conn) => {
  if (value === "MANUAL") {
    return {
      ID: "Manual",
      USERID: "MANUAL",
      USERNAME: "Manual Entry",
      EMAIL: "manual@example.com",
      PHONENUMBER: "Unknown",
    };
  }
  const query = `SELECT * FROM PUBLICUSER WHERE ${field} = :value`;
  const result = await conn.execute(
    query,
    { value },
    { outFormat: OracleDB.OUT_FORMAT_OBJECT }
  );
  return result.rows.length > 0
    ? result.rows[0]
    : {
        ID: "Unknown",
        USERID: "Unknown",
        USERNAME: "Unknown User",
        EMAIL: "unknown@example.com",
        PHONENUMBER: "Unknown",
      };
};
const getPetakData = async (field, value, conn) => {
  const query = `SELECT * FROM PETAK WHERE ${field} = :value`;
  const result = await conn.execute(
    query,
    { value },
    { outFormat: OracleDB.OUT_FORMAT_OBJECT }
  );
  return result.rows.length > 0 ? result.rows[0] : null;
};

const getSamanData = async (field, value, conn) => {
  const query = `SELECT * FROM SAMAN WHERE ${field} = :value`;
  const result = await conn.execute(
    query,
    { value },
    { outFormat: OracleDB.OUT_FORMAT_OBJECT }
  );
  if (result.rows.length === 0) {
    console.log("❌ Saman not found:", value);
    return null;
  }
  const operator = await getOperatorData(
    "USERID",
    result.rows[0].OPERATORID,
    conn
  );
  const { OPERATORID, OUTDOORPARKINGID, ZONE, ...samanData } = result.rows[0];
  return {
    ...samanData,
    operator,
  };
};

export default function ({ socket, io, uuidv4, __dirname, openai }) {
  socket.on("fetchAllData", async ({ parkingID }, res) => {
    // Parking ID -> Checks in Outdoor Parking -> Outdoor Parking Data
    // Parking ID -> Checks in Payment To Operator -> Payment Data + Operator ID
    // Parking ID -> Checks in Saman -> Saman Data + Operator ID
    // Outdoor Parking Data -> Checks in Zone using Zone Code -> Zone Data
    // Outdoor Parking Data -> Checks in Vehicle using Vehicle ID -> Vehicle Data + User ID

    // User ID -> Checks in Public User -> User Data
    // User ID -> Checks in Petak -> Petak Data
    // Operator ID -> Checks in Operators using Operator ID -> Operator Data
    console.log("Handling fetchAllData event:", parkingID);
    if (!parkingID) {
      console.log("❌ Parking ID is required");
      return res({
        status: 400,
        message: "Parking ID is required",
      });
    }
    let conn;
    try {
      conn = await OracleDB.getConnection();
      console.log("Connected to OracleDB");

      const outDoorData = await conn.execute(
        `SELECT * FROM OUTDOORPARKING WHERE OUTDOORID = :parkingID`,
        { parkingID },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );

      if (outDoorData.rows.length === 0) {
        console.log("❌ No outdoor parking found with ID:", parkingID);
        return res({
          status: 404,
          message: "Outdoor parking not found",
        });
      }
      const outdoor = outDoorData.rows[0];
      console.log("Outdoor parking data:", outdoor);
      const zoneData = await getZoneData("CODE", outdoor.ZONE, conn);
      if (!zoneData) {
        console.log("❌ Zone not found for code:", outdoor.ZONE);
        return res({
          status: 404,
          message: "Zone not found",
        });
      }
      console.log("Zone data:", zoneData);
      const vehicleData = await getVehicle(
        "VEHICLEID",
        outdoor.VEHICLEID,
        conn
      );
      if (!vehicleData) {
        console.log("❌ Vehicle not found with ID:", outdoor.VEHICLEID);
        return res({
          status: 404,
          message: "Vehicle not found",
        });
      }
      console.log("Vehicle data:", vehicleData);
      const userData = await getUserData("USERID", vehicleData.USERID, conn);
      const paymentData = await findPayments(
        "OUTDOORID",
        outdoor.OUTDOORID,
        conn
      );
      if (!userData) {
        console.log("❌ User not found with ID:", vehicleData.USERID);
        return res({
          status: 404,
          message: "User not found",
        });
      }
      const samanData = await getSamanData(
        "OUTDOORPARKINGID",
        outdoor.OUTDOORID,
        conn
      );
      console.log("User data:", userData);
      console.log("Payment data:", paymentData);
      console.log("Saman data:", samanData);

      // const petakData = await getPetakData("CODE", zoneData.CODE, conn);
      // if (!petakData) {
      //   console.log("❌ Petak not found with code:", zoneData.CODE);
      //   return res({
      //     status: 404,
      //     message: "Petak not found",
      //   });
      // }
      // console.log("Petak data:", petakData);
      // const operatorData = await getOperatorData(
      //   "USERID",
      //   paymentData.operatorID,
      //   conn
      // );
      // console.log("Operator data:", operatorData);
      // const samanData = await conn.execute(
      //   `SELECT * FROM SAMAN WHERE OUTDOORPARKINGID = :parkingID`,
      //   { parkingID },
      //   { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      // );
      // console.log("Saman data:", samanData.rows);
      return res({
        status: 200,
        data: {
          outdoor,
          zoneData,
          vehicleData,
          userData,
          paymentData,
          // petakData,
          samanData,
        },
      });
    } catch (error) {
      console.error("Error fetching all data:", error);
      return res({
        status: 500,
        message: `Internal server error: ${error.message}`,
      });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  });
  socket.on("newParking", async (data, res) => {
    console.log("🚗 New parking request received:", data);

    const {
      operatorId,
      userId,
      plate,
      type,
      model,
      color,
      duration,
      startTime,
      startDate,
      zone,
    } = data;

    if (
      !operatorId ||
      !userId ||
      !plate ||
      !type ||
      !model ||
      !color ||
      !duration ||
      !zone
    ) {
      console.log("❌ Missing required fields", {
        operatorId,
        userId,
        plate,
        type,
        model,
        color,
        duration,
        zone,
      });
      return res({ status: 400, message: "All fields are required" });
    }
    let conn = await OracleDB.getConnection();
    const zoneData = await getZoneData("CODE", zone, conn);
    let vehicleData = await getVehicle("PLATLICENSE", plate, conn);

    try {
      if (!vehicleData || vehicleData.length === 0) {
        const vehicleId = uuidv4();
        console.log("❌ Vehicle not found with plate:", plate);
        const createVehicleResult = await conn.execute(
          `INSERT INTO VEHICLEDETAIL (VEHICLEID, USERID, PLATLICENSE, VEHICLETYPES, VEHICLEMODEL, VEHICLECOLOUR)
         VALUES (:vehicleId, :userId, :plate, :type, :model, :color)`,
          { vehicleId, userId, plate, type, model, color },
          { autoCommit: true }
        );

        if (createVehicleResult.rowsAffected === 0) {
          console.error("❌ Failed to create vehicle record");
          return res({
            status: 500,
            message: "Failed to create vehicle record",
          });
        }

        await conn.execute(
          `INSERT INTO OPERATOR_LOGS (OPERATOR_ID, ACTION, DETAILS)
         VALUES (:operatorId, 'Create Vehicle', 'Created new vehicle with plate ${plate}')`,
          { operatorId },
          { autoCommit: true }
        );

        vehicleData = {
          VEHICLEID: vehicleId,
          USERID: userId,
          PLATLICENSE: plate,
          VEHICLETYPES: type,
          VEHICLEMODEL: model,
          VEHICLECOLOUR: color,
        };
      } else {
        // Filter vehicleData for correct userId (if it's an array)
        if (Array.isArray(vehicleData)) {
          vehicleData = vehicleData.find((v) => v.USERID === userId);
          if (!vehicleData) {
            return res({
              status: 404,
              message: "Vehicle exists but not linked to user",
            });
          }
        }
      }

      // Parse times correctly
      const parsedStartDate = startDate
        ? dayjs(startDate).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD");

      const parsedStartTime = startTime
        ? dayjs(startTime).format("HH:mm")
        : dayjs().format("HH:mm");

      const outdoorId = uuidv4();
      const insertParkingResult = await conn.execute(
        `INSERT INTO OUTDOORPARKING 
        (OUTDOORID, USERID, VEHICLEID, ZONE, STARTDATE, STARTTIME, DURATION, PETAKSTATUS)
       VALUES 
        (:outdoorId, :userId, :vehicleId, :zone, :startDate, :startTime, :duration, :petakStatus)`,
        {
          outdoorId,
          userId: vehicleData.USERID,
          vehicleId: vehicleData.VEHICLEID,
          zone,
          startDate: parsedStartDate,
          startTime: parsedStartTime,
          duration,
          petakStatus: "Unpaid",
        },
        { autoCommit: true }
      );

      if (insertParkingResult.rowsAffected === 0) {
        console.error("❌ Failed to insert parking record");
        return res({ status: 500, message: "Failed to insert parking record" });
      }

      // OPERATOR_ID
      // OUTDOORID
      // AMOUNT
      // PAYMENT_DATE
      // PAYMENT_METHOD
      const paymentId = uuidv4();
      const payload = {
        paymentId,
        operatorId,
        outdoorId,
        amount: (duration * 100).toFixed(2), // Set initial amount to duration
        paymentDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
      };
      console.log("Payment payload:", payload);

      const insertPaymentResult = await conn.execute(
        `INSERT INTO PAYMENT_TO_OPERATOR (PAYMENT_ID, OPERATOR_ID, OUTDOORID, AMOUNT, PAYMENT_DATE, PAYMENT_METHOD)
       VALUES (:paymentId, :operatorId, :outdoorId, :amount, :paymentDate, 'Cash')`,
        payload,
        { autoCommit: true, outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );

      if (insertPaymentResult.rowsAffected === 0) {
        console.error("❌ Failed to insert payment record");
        return res({ status: 500, message: "Failed to insert payment record" });
      }

      await conn.execute(
        `INSERT INTO OPERATOR_LOGS (OPERATOR_ID, ACTION, DETAILS)
       VALUES (:operatorId, 'Create Parking', 'Created new parking for vehicle ${plate} in zone ${zone}')`,
        { operatorId },
        { autoCommit: true }
      );

      const fetchPaymentResult = await conn.execute(
        `SELECT * FROM PAYMENT_TO_OPERATOR WHERE PAYMENT_ID = :paymentId`,
        { paymentId },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );
      if (fetchPaymentResult.rows.length === 0) {
        console.error("❌ Payment record not found after insertion");
      }

      console.log("✅ Parking record created successfully:", outdoorId);
      const responseData = {
        OUTDOORID: outdoorId,
        USER: await getUsername(userId, conn),
        VEHICLE: await getVehicle("VEHICLEID", vehicleData.VEHICLEID, conn),
        PAYMENT: payload,
        STARTDATETIME: `${parsedStartDate}T${parsedStartTime}`,
        DURATION: duration,
        PETAKSTATUS: "Unpaid",
      };
      return res({
        status: 201,
        message: "Parking created successfully",
        data: responseData,
      });
    } catch (error) {
      console.error("❌ Error in newParking handler:", error.message);
      return res({
        status: 500,
        message: "Internal server error: " + error.message,
      });
    } finally {
      if (conn) await conn.close();
    }
  });

  socket.on("parkingData", async ({ zoneCode }, res) => {
    if (!zoneCode) {
      console.log("❌ Zone code is required");
      return res({ status: 400, error: "Zone code is required" });
    }
    let conn = await OracleDB.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM outdoorparking WHERE ZONE = :zoneCode AND PETAKSTATUS IN ('Active', 'Expired', 'Available', 'Unpaid', 'Summon', 'Exit')`,
        [zoneCode],
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );
      console.log("result.rows.length:", result.rows.length);

      if (result.rows.length === 0) {
        console.log("No outdoor parking records found for zone:", zoneCode);
        return res({
          status: 404,
          message: "No outdoor parking records found",
        });
      }
      const data = await Promise.all(
        result.rows.map(async (row) => ({
          OUTDOORID: row.OUTDOORID,
          USER: await getUsername(row.USERID, conn),
          VEHICLE: await getVehicle("VEHICLEID", row.VEHICLEID, conn),
          PAYMENT: await findPayments("OUTDOORID", row.OUTDOORID, conn),
          STARTDATETIME: `${row.STARTDATE}T${row.STARTTIME}`,
          ENDDATETIME:
            row.EXITDATE && row.EXITTIME
              ? `${row.EXITDATE}T${row.EXITTIME}`
              : null,
          EXITDATE: row.EXITDATE,
          EXITTIME: row.EXITTIME,
          DURATION: row.DURATION,
          ZONE: await getZoneData("CODE", zoneCode, conn),
          PETAKSTATUS: row.PETAKSTATUS,
        }))
      );

      //   Arranbge in PETAKSTATUS of "Expired", "Active", "Available"
      data.sort((a, b) => {
        const statusOrder = {
          Expired: 0,
          Active: 1,
          Available: 2,
        };
        return statusOrder[a.PETAKSTATUS] - statusOrder[b.PETAKSTATUS];
      });
      // only return data that is within the day
      data.filter((item) => {
        return (
          dayjs(item.STARTDATETIME).isSame(dayjs(), "day") ||
          (item.ENDDATETIME && dayjs(item.ENDDATETIME).isSame(dayjs(), "day"))
        );
      });
      console.log("Fetched outdoor parking data:", [...data]);
      return res({ status: 200, data: data });
    } catch (error) {
      console.error("❌ Error fetching parking data:", error.message);
      return res({
        status: 500,
        message: `Internal server error ${error.message}`,
      });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  });

  socket.on("extractPlate", async (base64, res) => {
    const cropSize = {
      width: 200,
      height: 350,
    };
    try {
      console.log("📸 Received plate image for OCR");

      const filename = `plate-${uuidv4()}.png`;
      const filePath = path.join(__dirname, "tempPlate", filename);

      // Convert and crop the base64 image using sharp
      const buffer = Buffer.from(base64, "base64");
      const buffermetadata = await sharp(buffer).metadata();
      console.log("📷 Image metadata:", buffermetadata);

      const rotated = sharp(buffer); // apply EXIF orientation

      const { width, height } = await rotated.metadata(); // get size after rotation

      // const left = Math.max(0, Math.floor((width - cropSize.width) / 2)); // center horizontally
      // const top = Math.max(0, Math.floor((height - cropSize.height) / 2)); // center vertically
      const left = Math.floor(width * 0.45 - cropSize.width); // 45% from left
      const top = Math.floor(height * 0.36 - cropSize.height); // 36% from top

      const croppedBuffer = await rotated
        .extract({
          left,
          top,
          width: cropSize.width * 4,
          height: cropSize.height * 3,
          autoOrient: {
            width: cropSize.height * 3,
            height: cropSize.width * 4,
          },
        })
        .png()
        .toBuffer();

      const croppedBase64 = croppedBuffer.toString("base64");

      // Save cropped image to disk
      await fs.promises.writeFile(filePath, croppedBuffer);
      console.log("📥 Image saved:", filePath);

      const img_url = `https://server.i-8ea.com/tempPlate/${filename}`;
      const prompt = `Extract the license plate from this image and return and respond it only as JSON: {"licensePlate": [The License Plate]}
        INCLUDE:-
        - if the prefix of "Jubilee Emas" or "Jubilee Perak" exists, that is part of the plate license.
        - If the license plate is stacked, return the full plate as a single string.
        - If the license plate is not stacked, return the full plate as a single string.
        
        DO NOT INCLUDE:-
        - any other text or information.
        - any special characters or spaces in the license plate.
        - any other text or information that is not part of the license plate.

        DO: 
        - If you think it is not a license plate, return an empty string for the license plate.
        - If you think it is a license plate, return the full license plate as a single string.

        if you cannot find the license plate or an error has occured, return a JSON object:
        {"message": [short brief message about the error or why the plate was not found]}
        `;

      let result = null;
      const maxRetries = 10;

      for (let i = 0; i < maxRetries; i++) {
        try {
          console.log(`🔄 Attempt ${i + 1}/${maxRetries}`);

          if (i < 5) {
            // Use your custom recognizer
            console.log("🔄 Using 360 Geo Info License Plate Recognizer");

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 30000);

            try {
              const response = await fetch(
                "http://192.168.102.15:5000/process",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ image_base64: croppedBase64 }),
                  signal: controller.signal,
                }
              );

              const data = await response.json();
              console.log("📦 Recognizer response:", data);

              const matching = data.plate_text;
              if (!Array.isArray(matching) || matching.length === 0) {
                console.warn("⚠️ No valid license plates found");
                continue;
              }

              // Clean and search each plate
              const trimmedPlates = matching.map((plate) =>
                plate.replace(/\s/g, "")
              );
              const dbChecks = await Promise.all(
                trimmedPlates.map(async (plate) => {
                  const found = await findPlateInDB(plate);
                  return found ? plate : null;
                })
              );

              // Filter out null results
              const validPlates = dbChecks.filter(Boolean);

              if (validPlates.length > 0) {
                console.log("✅ Valid plates found in DB:", validPlates);
                result = { licensePlate: validPlates };
                break;
              } else {
                console.warn("⚠️ No plates matched in DB:", trimmedPlates);
              }
            } catch (err) {
              if (err.name === "AbortError") {
                console.error("❌ Timeout from plate recognizer");
              } else {
                console.error("❌ Error from plate recognizer:", err.message);
              }
            } finally {
              clearTimeout(timeout);
            }
          } else {
            // Fallback: OpenAI Vision
            const model =
              i < 8
                ? process.env.OPENAI_MODEL_3
                : i < 9
                ? process.env.OPENAI_MODEL_2
                : process.env.OPENAI_MODEL_1;

            console.log("🧠 Using OpenAI model:", model);

            const completion = await openai.chat.completions.create({
              model,
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "text", text: prompt },
                    { type: "image_url", image_url: { url: img_url } },
                  ],
                },
              ],
            });

            const content = completion.choices[0]?.message?.content;
            const parsed = JSON.parse(
              content.replace(/```json/g, "").replace(/```/g, "")
            );

            if (parsed.licensePlate) {
              const trimmedPlate = parsed.licensePlate
                .trim()
                .replace(/\s/g, "");
              const dbPlate = await findPlateInDB(trimmedPlate);

              if (dbPlate) {
                result = { licensePlate: dbPlate };
                break;
              } else {
                console.warn("⚠️ Plate not in DB:", trimmedPlate);
              }
            } else {
              console.warn("⚠️ No plate from OpenAI model");
            }
          }
        } catch (err) {
          console.error("❌ OCR error:", err.message);
        }

        await new Promise((r) => setTimeout(r, 2000));
      }

      // Cleanup
      await fs.promises.unlink(filePath);

      if (!result?.licensePlate) {
        console.error("❌ No license plate detected.");
        return res({ status: 400, message: "No license plate detected" });
      }

      const finalPlate = Array.isArray(result.licensePlate)
        ? result.licensePlate[0]?.trim().replace(/\s/g, "")
        : result.licensePlate?.trim().replace(/\s/g, "");
      console.log("✅ Plate extracted:", finalPlate);
      return res({ status: 200, data: { plate: finalPlate } });
    } catch (err) {
      console.error("❌ Unexpected error:", err.message);
      return res({ status: 500, message: "Internal server error" });
    }
  });

  socket.on("searchParkedPlate", async ({ plate, zone }, res) => {
    if (!plate || !zone) {
      console.log("❌ Plate and zone are required");
      return res({ status: 400, error: "Plate and zone are required" });
    }

    let conn;
    try {
      conn = await OracleDB.getConnection();

      // 1. Get all VEHICLEID(s) associated with this plate
      const vehicleResult = await conn.execute(
        `SELECT VEHICLEID FROM VEHICLEDETAIL WHERE PLATLICENSE = :plate`,
        { plate },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );

      const vehicleIds = vehicleResult.rows.map((row) => row.VEHICLEID);
      if (vehicleIds.length === 0) {
        console.log("❌ No vehicle found with plate:", plate);
        return res({
          status: 404,
          message: "No vehicle found with this plate",
        });
      }

      // 2. Query all outdoorparking entries for any of the VEHICLEID(s) in the specified zone
      const outdoorResults = await conn.execute(
        `
      SELECT * FROM outdoorparking 
      WHERE ZONE = :zone 
        AND VEHICLEID IN (${vehicleIds.map((_, i) => `:v${i}`).join(", ")})
      `,
        {
          zone,
          ...vehicleIds.reduce((acc, id, i) => ({ ...acc, [`v${i}`]: id }), {}),
        },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );

      if (outdoorResults.rows.length === 0) {
        console.log("❌ No parked records found for:", plate);
        return res({ status: 404, message: "No parked plate found" });
      }

      // 3. Enrich the data
      const data = await Promise.all(
        outdoorResults.rows.map(async (row) => ({
          OUTDOORID: row.OUTDOORID,
          USER: await getUsername(row.USERID, conn),
          VEHICLE: await getVehicle("VEHICLEID", row.VEHICLEID, conn),
          PAYMENT: await findPayments("OUTDOORID", row.OUTDOORID, conn),
          STARTDATETIME: `${row.STARTDATE}T${row.STARTTIME}`,
          DURATION: row.DURATION,
          ZONE: await getZoneData("CODE", zone, conn),
          PETAKSTATUS: row.PETAKSTATUS,
        }))
      );

      data.sort((a, b) => {
        const statusOrder = {
          Expired: 0,
          Active: 1,
          Available: 2,
        };
        return statusOrder[a.PETAKSTATUS] - statusOrder[b.PETAKSTATUS];
      });
      // only return data that is within the day
      data.filter((item) => {
        return (
          dayjs(item.STARTDATETIME).isSame(dayjs(), "day") ||
          (item.ENDDATETIME && dayjs(item.ENDDATETIME).isSame(dayjs(), "day"))
        );
      });
      console.log("✅ Found parked plate data:", data);
      return res({ status: 200, data });
    } catch (error) {
      console.error("❌ Error searching parked plate:", error.message);
      return res({
        status: 500,
        error: `Internal server error: ${error.message}`,
      });
    } finally {
      if (conn) await conn.close();
    }
  });

  socket.on("checkExistingParking", async ({ plate, zone }, res) => {
    if (!plate || !zone) {
      console.log("❌ Plate and zone are required");
      return res({ status: 400, error: "Plate and zone are required" });
    }

    let conn;
    try {
      conn = await OracleDB.getConnection();

      // 1. Get all VEHICLEID(s) associated with this plate
      const vehicleResult = await conn.execute(
        `SELECT VEHICLEID FROM VEHICLEDETAIL WHERE PLATLICENSE = :plate`,
        { plate },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );

      const vehicleIds = vehicleResult.rows.map((row) => row.VEHICLEID);
      if (vehicleIds.length === 0) {
        console.log("❌ No vehicle found with plate:", plate);
        return res({
          status: 200,
          message: "No vehicle found with this plate",
        });
      }

      // 2. Query outdoorparking entries for any of the VEHICLEID(s) in the specified zone
      const outdoorResults = await conn.execute(
        `
        SELECT * FROM outdoorparking 
        WHERE ZONE = :zone 
          AND VEHICLEID IN (${vehicleIds.map((_, i) => `:v${i}`).join(", ")})
          AND PETAKSTATUS IN ('Active', 'Unpaid', 'Expired', 'Summon')
      `,
        {
          zone,
          ...vehicleIds.reduce((acc, id, i) => ({ ...acc, [`v${i}`]: id }), {}),
        },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );

      if (outdoorResults.rows.length > 0) {
        console.log("❌ Existing parking found for:", plate);
        return res({ status: 404, message: "Existing parking found" });
      }

      console.log("✅ No existing parking data found");
      return res({ status: 200 });
    } catch (error) {
      console.error("❌ Error checking existing parking:", error.message);
      return res({
        status: 500,
        error: `Internal server error: ${error.message}`,
      });
    } finally {
      if (conn) await conn.close();
    }
  });

  socket.on("fineParking", async ({ outdoorId, operatorId }, res) => {
    if (!outdoorId || !operatorId) {
      console.log("❌ Outdoor ID and Operator ID are required");
      return res({
        status: 400,
        error: "Outdoor ID and Operator ID are required",
      });
    }

    let conn;
    try {
      conn = await OracleDB.getConnection();

      const outdoorResult = await conn.execute(
        `SELECT * FROM outdoorparking WHERE OUTDOORID = :outdoorId`,
        { outdoorId },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );
      if (outdoorResult.rows.length === 0) {
        console.log("❌ No outdoor parking found with ID:", outdoorId);
        return res({ status: 404, message: "Outdoor parking not found" });
      }
      const outdoorData = outdoorResult.rows[0];
      const updatePayment = await conn.execute(
        `UPDATE PAYMENT_TO_OPERATOR SET STATUS = 'FINED' WHERE OUTDOORID = :outdoorId`,
        {
          outdoorId,
        },
        {
          autoCommit: true,
          outFormat: OracleDB.OUT_FORMAT_OBJECT,
        }
      );
      if (updatePayment.rowsAffected === 0) {
        console.log("❌ Failed to update payment record for fine");
        return res({ status: 500, message: "Failed to update payment record" });
      }

      const insertSaman = await conn.execute(
        `INSERT INTO SAMAN (SAMANID, OUTDOORPARKINGID, OPERATORID, JUMLAH, STATUS, SAMANDATETIME)
         VALUES (:samanId, :outdoorId, :operatorId, :amount, 'UNPAID', SYSDATE)`,
        { samanId: uuidv4(), outdoorId, operatorId, amount: 500 },
        { autoCommit: true }
      );
      if (insertSaman.rowsAffected === 0) {
        console.log("❌ Failed to insert fine record");
        return res({ status: 500, message: "Failed to insert fine record" });
      }
      const updateOutdoor = await conn.execute(
        `UPDATE outdoorparking SET PETAKSTATUS = 'Summon', EXITDATE = :exitDate, EXITTIME = :exitTime WHERE OUTDOORID = :outdoorId`,
        {
          outdoorId,
          exitDate: dayjs().format("YYYY-MM-DD"),
          exitTime: dayjs().format("HH:mm"),
        },
        { autoCommit: true }
      );
      if (updateOutdoor.rowsAffected === 0) {
        console.log("❌ Failed to update outdoor parking status to 'Summon'");
      }
      const operatorLog = await conn.execute(
        `INSERT INTO OPERATOR_LOGS (OPERATOR_ID, ACTION, DETAILS)
         VALUES (:operatorId, 'Fine Parking', 'Fined parking with ID ${outdoorId}')`,
        { operatorId },
        { autoCommit: true }
      );
      if (operatorLog.rowsAffected === 0) {
        console.log("❌ Failed to log operator action for fine");
        return res({ status: 500, message: "Failed to log operator action" });
      }
      console.log("✅ Parking fined successfully:", outdoorId);
      io.to(`operator_${operatorId}`).emit("parkingFined");
      return res({
        status: 200,
        message: "Parking fined successfully",
      });
    } catch (error) {
      console.error("❌ Error in fineParking handler:", error.message);
      return res({
        status: 500,
        message: "Internal server error: " + error.message,
      });
    } finally {
      if (conn) await conn.close();
    }
  });

  socket.on("exitParking", async ({ outdoorId, operatorId }, res) => {
    if (!outdoorId || !operatorId) {
      console.log("❌ Outdoor ID and Operator ID are required");
      return res({
        status: 400,
        error: "Outdoor ID and Operator ID are required",
      });
    }

    let conn;
    try {
      conn = await OracleDB.getConnection();

      const outdoorResult = await conn.execute(
        `SELECT * FROM outdoorparking WHERE OUTDOORID = :outdoorId`,
        { outdoorId },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );
      if (outdoorResult.rows.length === 0) {
        console.log("❌ No outdoor parking found with ID:", outdoorId);
        return res({ status: 404, message: "Outdoor parking not found" });
      }
      const outdoorData = outdoorResult.rows[0];

      // Check if the parking is already exited
      if (outdoorData.PETAKSTATUS === "Exit") {
        console.log("❌ Parking already exited:", outdoorId);
        return res({ status: 400, message: "Parking already exited" });
      }

      // Update the parking status to Exited
      const updateOutdoor = await conn.execute(
        `UPDATE outdoorparking SET PETAKSTATUS = 'Exit', EXITDATE = :exitDate, EXITTIME = :exitTime WHERE OUTDOORID = :outdoorId`,
        {
          outdoorId,
          exitDate: dayjs().format("YYYY-MMM-DD"),
          exitTime: dayjs().format("HH:mm"),
        },
        { autoCommit: true }
      );
      if (updateOutdoor.rowsAffected === 0) {
        console.log("❌ Failed to update outdoor parking status to 'Exit'");
        return res({ status: 500, message: "Failed to update parking status" });
      }

      // Log the operator action
      const operatorLog = await conn.execute(
        `INSERT INTO OPERATOR_LOGS (OPERATOR_ID, ACTION, DETAILS)
         VALUES (:operatorId, 'Exit Parking', 'Exited parking with ID ${outdoorId}')`,
        { operatorId },
        { autoCommit: true }
      );
      if (operatorLog.rowsAffected === 0) {
        console.log("❌ Failed to log operator action for exit");
        return res({ status: 500, message: "Failed to log operator action" });
      }

      console.log("✅ Parking exited successfully:", outdoorId);
      io.to(`operator_${operatorId}`).emit("parkingExited");
      return res({
        status: 200,
        message: "Parking exited successfully",
      });
    } catch (error) {
      console.error("❌ Error in exitParking handler:", error.message);
      return res({
        status: 500,
        message: "Internal server error: " + error.message,
      });
    }
  });

  socket.on("exitParkingLate", async ({ outdoorId, operatorId }, res) => {
    if (!outdoorId || !operatorId) {
      console.log("❌ Outdoor ID and Operator ID are required");
      return res({
        status: 400,
        error: "Outdoor ID and Operator ID are required",
      });
    }
    let conn;
    try {
      conn = await OracleDB.getConnection();
      const outdoorResult = await conn.execute(
        `SELECT * FROM outdoorparking WHERE OUTDOORID = :outdoorId`,
        { outdoorId },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );
      if (outdoorResult.rows.length === 0) {
        console.log("❌ No outdoor parking found with ID:", outdoorId);
        return res({ status: 404, message: "Outdoor parking not found" });
      }
      const outdoorData = outdoorResult.rows[0];
      // Check if the parking is already exited
      if (outdoorData.PETAKSTATUS === "Exit") {
        console.log("❌ Parking already exited:", outdoorId);
        return res({ status: 200, message: "Parking already exited" });
      }
      // Update the parking status to Exited
      const updateOutdoor = await conn.execute(
        `UPDATE outdoorparking SET PETAKSTATUS = 'Exit', EXITDATE = :exitDate, EXITTIME = :exitTime WHERE OUTDOORID = :outdoorId`,
        {
          outdoorId,
          exitDate: dayjs().format("YYYY-MM-DD"),
          exitTime: dayjs().format("HH:mm"),
        },
        { autoCommit: true }
      );
      if (updateOutdoor.rowsAffected === 0) {
        console.log("❌ Failed to update outdoor parking status to 'Exit'");
        return res({ status: 500, message: "Failed to update parking status" });
      }
      // Log the operator action
      const operatorLog = await conn.execute(
        `INSERT INTO OPERATOR_LOGS (OPERATOR_ID, ACTION, DETAILS)
         VALUES (:operatorId, 'Exit Parking Late', 'Exited parking with ID ${outdoorId} late')`,
        { operatorId },
        { autoCommit: true }
      );
      if (operatorLog.rowsAffected === 0) {
        console.log("❌ Failed to log operator action for exit late");
        return res({ status: 500, message: "Failed to log operator action" });
      }
      console.log("✅ Parking exited late successfully:", outdoorId);
      io.to(`operator_${operatorId}`).emit("parkingExitedLate");
      return res({
        status: 200,
        message: "Parking exited late successfully",
      });
    } catch (error) {
      console.error("❌ Error in exitParkingLate handler:", error.message);
      return res({
        status: 500,
        message: "Internal server error: " + error.message,
      });
    }
  });

  socket.on("fetchDetails", async ({ outdoorId }, res) => {
    if (!outdoorId) {
      console.error("Outdoor ID is required");
      return res({ status: 400, error: "Outdoor ID is required" });
    }

    let conn;
    try {
      conn = await OracleDB.getConnection();

      const outdoorResult = await conn.execute(
        `SELECT * FROM outdoorparking WHERE OUTDOORID = :outdoorId`,
        { outdoorId },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );
      if (outdoorResult.rows.length === 0) {
        console.error("No outdoor parking found with ID:", outdoorId);
        return res({ status: 404, error: "Outdoor parking not found" });
      }

      const paymentToOperatorResult = await conn.execute(
        `SELECT * FROM PAYMENT_TO_OPERATOR WHERE OUTDOORID = :outdoorId`,
        { outdoorId },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );

      const samanResult = await conn.execute(
        `SELECT * FROM SAMAN WHERE OUTDOORPARKINGID = :outdoorId`,
        { outdoorId },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );

      const vehicleResult = await conn.execute(
        `SELECT * FROM VEHICLEDETAIL WHERE VEHICLEID = :vehicleId`,
        { vehicleId: outdoorResult.rows[0].VEHICLEID },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );

      const userResult = await conn.execute(
        `SELECT * FROM PUBLICUSER WHERE USERID = :userId`,
        { userId: vehicleResult.rows[0].USERID },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );

      const { _: PASSWORD, ...userData } = userResult.rows[0];

      const data = {
        user: userData,
        parking: outdoorResult.rows[0],
        payment: paymentToOperatorResult.rows[0] || null,
        saman: samanResult.rows[0] || null,
      };
    } catch (error) {
      console.error("❌ Error in fetchDetails handler:", error.message);
      return res({
        status: 500,
        message: "Internal server error: " + error.message,
      });
    }
  });
}
