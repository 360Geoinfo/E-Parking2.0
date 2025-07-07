import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs, { readdirSync } from "fs";
import express from "express";
import { Server as socketIo } from "socket.io";
import dotenv from "dotenv";
import http, { get } from "http";
import tinify from "tinify";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";
import emailModule from "./module/email.module.js";

dotenv.config({ path: ".env.dev" });

// Middleware to check Bearer Token ============================================================================
import { authenticateToken } from "./middlewares/auth.middleware.js";
// Middleware to check Bearer Token ============================================================================
// Middleware to initialize Oracle DB connection pool ============================================================
import { initDB } from "./middlewares/db.middleware.js";
import OracleDB from "oracledb";
import OpenAI from "openai";
// Middleware to initialize Oracle DB connection pool ============================================================

// require("dotenv").config();
// const express = require("express");
// const oracledb = require("oracledb");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const { v4: uuidv4 } = require("uuid");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(
  cors({
    origin: "*", // Or specify your frontend domain for more security
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Middleware to parse JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Set Server Locale Time
dayjs.locale("en");

// Extend plugins BEFORE using them
dayjs.extend(utc);
dayjs.extend(timezone);
// Set default timezone
dayjs.tz.setDefault("Asia/Brunei");

const server = http.createServer(app);
const io = new socketIo(server, {
  cors: {
    origin: ["temp_db_360.jaejormasie.click"], // Or specify your frontend domain for more security
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  maxHttpBufferSize: 1e8, // 100MB
});

app.use((req, res, next) => {
  req.io = io;
  next();
});
const fetchZoneData = async (zone, type = "CODE") => {
  const conn = await OracleDB.getConnection();
  // If type is code but zone is not an Alphabet or mix of Alphabet, return "Invalid zone code"
  if (type === "CODE" && !/^[A-Za-z]+$/.test(zone)) {
    return { error: "Invalid zone code" };
  }
  try {
    const result = await conn.execute(
      `SELECT ID, CODE FROM ZONES WHERE ${type} = :zone`,
      [zone],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching zone data:", error.message);
    throw error;
  } finally {
    await conn.close();
  }
};

// Import All Controllers =========================================================

const controllers = [];
const socketControllers = [];
const superadminControllers = [];
const controllersDir = path.join(__dirname, "controller");
const socketControllersDir = path.join(controllersDir, "socket");
const superadminControllersDir = path.join(socketControllersDir, "Superadmin");
const controllerFiles = readdirSync(controllersDir).filter((file) =>
  file.endsWith(".controller.js")
);
const socketControllerFiles = readdirSync(socketControllersDir).filter((file) =>
  file.endsWith(".controller.js")
);
const superadminControllersFiles = readdirSync(superadminControllersDir).filter(
  (file) => file.endsWith(".controller.js")
);

for (const file of controllerFiles) {
  const name = file.split(".")[0].toUpperCase();
  const modulePath = path.join(controllersDir, file);
  // Convert the absolute file path to a file:// URL
  const moduleUrl = pathToFileURL(modulePath).href;
  // Use the URL with import()
  const module = await import(moduleUrl);
  controllers.push(module.default);
}

for (const file of socketControllerFiles) {
  const name = file.split(".")[0].toUpperCase();
  const modulePath = path.join(socketControllersDir, file);
  // Convert the absolute file path to a file:// URL
  const moduleUrl = pathToFileURL(modulePath).href;
  // Use the URL with import()
  const module = await import(moduleUrl);
  socketControllers.push(module.default);
}
for (const file of superadminControllersFiles) {
  const name = file.split(".")[0].toUpperCase();
  const modulePath = path.join(superadminControllersDir, file);
  // Convert the absolute file path to a file:// URL
  const moduleUrl = pathToFileURL(modulePath).href;
  // Use the URL with import()
  const module = await import(moduleUrl);
  superadminControllers.push(module.default);
}

const otpHolder = {}; // Store OTPs in memory for simplicity, consider using a database for production
// Oracle DB connection pool initialization
initDB();

console.log("Open AI Base and Token:", {
  baseURL: process.env.OPENAI_API_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});
emailModule.verifyEmailModule();

app.use("/tempPlate", express.static(path.join(__dirname, "tempPlate")));

// Users Functions =========================================================
const getUser = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM USERS WHERE ${field} = :identifier`
      : `SELECT * FROM USERS`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching user:", error.message);
    throw error;
  }
};

const getUserPersonal = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM USER_PERSONAL WHERE ${field} = :identifier`
      : `SELECT * FROM USER_PERSONAL`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching user personal:", error.message);
    throw error;
  }
};

const getOperator = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM OPERATORS WHERE ${field} = :identifier`
      : `SELECT * FROM OPERATORS`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error fetching operator:", error.message);
    throw error;
  }
};

const getOperatorPersonal = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM OPERATOR_PERSONAL WHERE ${field} = :identifier`
      : `SELECT * FROM OPERATOR_PERSONAL`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching operator personal:", error.message);
    throw error;
  }
};

const getSuperAdmin = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM SUPERADMINS WHERE ${field} = :identifier`
      : `SELECT * FROM SUPERADMINS`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error("Error fetching super admin:", error.message);
    throw error;
  }
};

const getSuperAdminPersonal = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM SUPERADMIN_PERSONAL WHERE ${field} = :identifier`
      : `SELECT * FROM SUPERADMIN_PERSONAL`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching super admin personal:", error.message);
    throw error;
  }
};

const getZone = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM ZONES WHERE ${field} = :identifier`
      : `SELECT * FROM ZONES`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching zone:", error.message);
    throw error;
  }
};

const getZoneAreas = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM ZONEAREAS WHERE ${field} = :identifier`
      : `SELECT * FROM ZONEAREAS`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching zone areas:", error.message);
    throw error;
  }
};

const getOperatorAttendance = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM OPERATOR_ATTENDANCE WHERE ${field} = :identifier`
      : `SELECT * FROM OPERATOR_ATTENDANCE`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching operator attendance:", error.message);
    throw error;
  }
};

const getOperatorLogs = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM OPERATOR_LOGS WHERE ${field} = :identifier`
      : `SELECT * FROM OPERATOR_LOGS`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching operator logs:", error.message);
    throw error;
  }
};
const getSuperAdminLogs = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM SUPERADMIN_LOGS WHERE ${field} = :identifier`
      : `SELECT * FROM SUPERADMIN_LOGS`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching super admin logs:", error.message);
    throw error;
  }
};

const getVehicle = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM VEHICLEDETAIL WHERE ${field} = :identifier`
      : `SELECT * FROM VEHICLEDETAIL`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching vehicle:", error.message);
    throw error;
  }
};

const getOutdoorParking = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM OUTDOORPARKING WHERE ${field} = :identifier`
      : `SELECT * FROM OUTDOORPARKING`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching outdoor parking:", error.message);
    throw error;
  }
};

const getPetak = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM PETAK WHERE ${field} = :identifier`
      : `SELECT * FROM PETAK`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching petak:", error.message);
    throw error;
  }
};

const getPetakPurchases = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM PETAK_PURCHASES WHERE ${field} = :identifier`
      : `SELECT * FROM PETAK_PURCHASES`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching petak purchases:", error.message);
    throw error;
  }
};

const getPetakUsage = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM PETAK_USAGE WHERE ${field} = :identifier`
      : `SELECT * FROM PETAK_USAGE`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching petak usage:", error.message);
    throw error;
  }
};

const getSeasonal = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM SEASONAL WHERE ${field} = :identifier`
      : `SELECT * FROM SEASONAL`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching seasonal:", error.message);
    throw error;
  }
};

const getSeasonalPurchases = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM SEASONAL_PURCHASES WHERE ${field} = :identifier`
      : `SELECT * FROM SEASONAL_PURCHASES`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching seasonal purchases:", error.message);
    throw error;
  }
};

const getSeasonPass = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM SEASONPASS WHERE ${field} = :identifier`
      : `SELECT * FROM SEASONPASS`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching season pass:", error.message);
    throw error;
  }
};

const getSaman = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM SAMAN WHERE ${field} = :identifier`
      : `SELECT * FROM SAMAN`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching Saman:", error.message);
    throw error;
  }
};

const getSamanPayment = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM SAMAN_PAYMENT WHERE ${field} = :identifier`
      : `SELECT * FROM SAMAN_PAYMENT`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching Saman payment:", error.message);
    throw error;
  }
};
const getPetakSamanUsage = async (field, identifier, conn) => {
  try {
    const query = field
      ? `SELECT * FROM PETAK_SAMAN_USAGE WHERE ${field} = :identifier`
      : `SELECT * FROM PETAK_SAMAN_USAGE`;
    const params = field ? { identifier } : {};
    const result = await conn.execute(query, params, {
      outFormat: OracleDB.OUT_FORMAT_OBJECT,
    });
    return result.rows.length > 0 ? result.rows : null;
  } catch (error) {
    console.error("Error fetching petak saman usage:", error.message);
    throw error;
  }
};

const passableFunctions = {
  getUser,
  getUserPersonal,
  getOperator,
  getOperatorPersonal,
  getOperatorAttendance,
  getOperatorLogs,
  getSuperAdmin,
  getSuperAdminPersonal,
  getSuperAdminLogs,
  getZone,
  getZoneAreas,
  getVehicle,
  getOutdoorParking,
  getPetak,
  getPetakPurchases,
  getPetakUsage,
  getSeasonal,
  getSeasonalPurchases,
  getSeasonPass,
  getSaman,
  getSamanPayment,
  getPetakSamanUsage,
};

controllers.forEach((registerController) => {
  registerController({
    app,
    jwt,
    emailModule,
    uuidv4,
    authenticateToken,
    tinify,
    dayjs,
    otpHolder,
    bcrypt,
    fetchZoneData,
    openai,
    __dirname,
    express,
  });
});

io.on("connection", (socket) => {
  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
  });
  socket.onAny((res) => {
    console.log("Receives: ", res);
  });
  console.log("A user connected:", socket.id);
  socketControllers.forEach((registerSocketController) => {
    registerSocketController({
      socket,
      io,
      jwt,
      otpHolder,
      emailModule,
      uuidv4,
      authenticateToken,
      tinify,
      dayjs,
      bcrypt,
      fetchZoneData,
      openai,
      __dirname,
      ...passableFunctions,
    });
  });

  superadminControllers.forEach((registerSocketController) => {
    registerSocketController({
      socket,
      io,
      jwt,
      otpHolder,
      emailModule,
      uuidv4,
      authenticateToken,
      tinify,
      dayjs,
      bcrypt,
      fetchZoneData,
      openai,
      __dirname,
      ...passableFunctions,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
const checkExpiredParking = async (parkingId, conn) => {
  try {
    const result = (await getOutdoorParking("OUTDOORID", parkingId, conn))[0];
    if (result) {
      const fulltimestring = `${result.STARTDATE} ${result.STARTTIME}`;
      const fulltimestringEnd = dayjs(fulltimestring).add(
        result.DURATION,
        "hour"
      );
      const vehicleData = await getVehicle("VEHICLEID", result.VEHICLEID, conn);
      const finesData = await getSaman("OUTDOORID", parkingId, conn);
      const currentTime = dayjs();
      const difference = fulltimestringEnd.diff(currentTime, "seconds");
      // Check if the current time is more than 30 minutes past the end time
      if (
        difference < 0 &&
        !["Cancelled", "Expired", "Summon", "Exit"].includes(result.PETAKSTATUS)
      ) {
        // Parking is expired
        const response = await conn.execute(
          `UPDATE OUTDOORPARKING SET PETAKSTATUS = 'Expired' WHERE OUTDOORID = :parkingId AND PETAKSTATUS != 'Expired'`,
          [parkingId],
          {
            autoCommit: true,
            outFormat: OracleDB.OUT_FORMAT_OBJECT,
          }
        );
        if (response.rowsAffected > 0) {
          const expiredInfo = {
            parkingId,
            status: "Expired",
            endTime: fulltimestringEnd.format(),
          };

          console.log("Parking marked as expired for vehicle:", parkingId);

          // 🔥 Emit to all clients
          io.emit("parkingExpired", {
            ID: parkingId,
            VEHICLE: vehicleData,
            SAMAN: finesData,
            STARTDATE: result.STARTDATE,
            STARTTIME: result.STARTTIME,
            DURATION: result.DURATION,
            ZONE: result.ZONE,
            PETAKSTATUS: result.PETAKSTATUS,
          });

          return expiredInfo;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error checking expired parking:", error.message);
    throw null;
  }
};

// Check for Expired Parking Time
setInterval(async () => {
  // Extract End Time
  const conn = await OracleDB.getConnection();
  try {
    const result = await getOutdoorParking(null, null, conn);
    if (result.length > 0) {
      await Promise.all(
        result.map(async (row) => {
          const parkingId = row.OUTDOORID;
          const expiredParking = await checkExpiredParking(parkingId, conn);
          if (expiredParking) {
            console.log("Expired parking found:", expiredParking);
          }
        })
      );
    }
  } catch (error) {
    console.error("Error checking expired parking:", error.message);
  } finally {
    await conn.close();
  }
}, 1000 * 5); // every 5 SECONDS
// Set up static file serving for the frontend

const PORT = process.env.PORT || 3001;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
