import OracleDB from "oracledb";
import dotenv from "dotenv";
dotenv.config(".env.dev");

export async function initDB() {
  try {
    await OracleDB.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });
    console.log("Oracle pool created");
  } catch (err) {
    console.error("Error creating Oracle pool:", err);
  }
}
