import dotenv from "dotenv";
import OracleDB from "oracledb";
import { emailOTPTemplate } from "../../templates/emailOTP.template.js";

dotenv.config(".env.dev");

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
};

const checkEmail = async ({ email, conn, role }) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  try {
    if (emailRegex.test(email)) {
      const result = await conn.execute(
        `SELECT * FROM SMARTPARKINGDB.${role} WHERE EMAIL = :email`,
        [email]
      );
      return result.rows.length > 0;
    }
    return false;
  } catch (error) {
    console.error(`Error checking email at ${role}:`, error);
    throw new Error("Database error");
  }
};
const checkUsername = async ({ username, conn }) => {
  const result1 = await conn.execute(
    `SELECT * FROM SMARTPARKINGDB.PUBLICUSER WHERE USERNAME = :username`,
    [username]
  );
  const result2 = await conn.execute(
    `SELECT * FROM SMARTPARKINGDB.OPERATORS WHERE USERNAME = :username`,
    [username]
  );
  return [result1.rows.length > 0, result2.rows.length > 0]; // true if username exists in either table
};
export default function ({
  socket,
  io,
  jwt,
  bcrypt,
  uuidv4,
  emailModule,
  otpHolder,
}) {
  // Registration  ============================================================================================
  socket.on(
    "register",
    async (
      { username, email, password, phonenumber, isOperator = false },
      res
    ) => {
      console.log("[Socket] Register event received");
      console.log("Received registration data:", {
        username,
        email,
        phonenumber,
      });
      if (!username || !email || !password || !phonenumber) {
        console.log("❌ Missing fields in registration");
        return res({
          status: 400,
          message: "Username, Email, Password, and Phonenumber are required",
        });
      }
      const uniqueId = uuidv4(); // ✅ Guaranteed unique user ID
      let conn = await OracleDB.getConnection();
      try {
        if (
          await checkEmail({
            email,
            conn,
            role: isOperator ? "OPERATORS" : "PUBLICUSER",
          })
        ) {
          console.log("User already exists with email:", email);
          return res.status(409).json({ message: "Email already exists" });
        }

        // Check for existing username
        const [isPublicUserExists, isOperatorExists] = await checkUsername({
          username,
          conn,
        });

        if (isPublicUserExists || isOperatorExists) {
          console.log("User already exists with username:", username);
          return res.status(409).json({ message: "Username already exists" });
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        if (!isOperator) {
          const otp = generateOTP(); // Function to generate OTP
          otpHolder[email] = {
            otp,
            expiresAt: Date.now() + 300000,
            type: "register",
          };
          emailModule.sendEmail({
            to: email,
            subject: "OTP for Pintar Registration",
            html: emailOTPTemplate(username, otp),
          });
        }
        const query = isOperator
          ? `INSERT INTO SMARTPARKINGDB.OPERATORS (USERID, USERNAME, EMAIL, PASSWORD, PHONENUMBER) VALUES (:id, :username, :email, :password, :phonenumber)`
          : `INSERT INTO SMARTPARKINGDB.PUBLICUSER (USERID, USERNAME, EMAIL, PASSWORD, PHONENUMBER, VERIFIED) VALUES (:id, :username, :email, :password, :phonenumber, :verified)`;

        const commitedResult = await conn.execute(
          query,
          isOperator
            ? {
                id: uniqueId,
                username,
                email,
                password: hashedPassword,
                phonenumber,
              }
            : {
                id: uniqueId,
                username,
                email,
                password: hashedPassword,
                phonenumber,
                verified: 0,
              },
          { autoCommit: true }
        );

        if (commitedResult.rowsAffected === 0) {
          console.error("User registration failed");
          return res.status(500).json({
            message: "User registration failed",
          });
        }
        console.log("User registration successful:", commitedResult);
        // Token without expiry
        const token = jwt.sign(
          { email, userID: uniqueId },
          process.env.JWT_SECRET
        );

        await conn.execute(
          `UPDATE SMARTPARKINGDB.${
            isOperator ? "OPERATORS" : "PUBLICUSER"
          } SET TOKEN = :token WHERE EMAIL = :email`,
          { token, email },
          { autoCommit: true }
        );

        return res.status(201).json({
          message: "Registration successful",
          token,
        });
      } catch (err) {
        console.error("❌ Registration error:", err.message);
        return res.status(500).json({
          message:
            "Registration failed." + err.message + " Please try again later.",
        });
      } finally {
        if (conn) await conn.close();
      }
    }
  );

  // Registration  ============================================================================================

  // Login ========================================================================================================
  socket.on("login", async ({ username, password }, res) => {
    console.log("[Socket] Login event received");
    if (!username || !password) {
      console.log("❌ Missing username or password");
      return res({ message: "Username and Password are required" });
    }
    let conn = await OracleDB.getConnection();
    try {
      const result = await conn.execute(
        `SELECT USERID, USERNAME, PASSWORD FROM PUBLICUSER WHERE USERNAME = :username`,
        [username]
      );
      if (result.rows.length === 0) {
        console.log("❌ User not found:", username);
        return res({ status: 401, message: "Invalid credentials" });
      }

      const [userID, dbUsername, dbPassword] = result.rows[0];
      const passwordMatch = await bcrypt.compare(password, dbPassword);

      if (!passwordMatch) {
        console.log("Incorrect password for:", username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token without expiration
      const token = jwt.sign({ username, userID }, process.env.JWT_SECRET);
      console.log("🔐 Token generated (no expiration)");

      await conn.execute(
        `UPDATE PUBLICUSER SET TOKEN = :token WHERE USERNAME = :username`,
        { token, username },
        { autoCommit: true }
      );

      console.log("✅ Login successful. Token stored for:", username);

      return res({
        status: 200,
        message: "Login successful",
        data: {
          userID,
          userRole: "customer",
          username,
          token,
        },
      });
    } catch (error) {
      return res({ status: 500, message: error.message });
    } finally {
      if (conn) await conn.close();
    }
  });

  // Login ========================================================================================================

  //Logout ==================================================================================================
  socket.on("logout", async (data, res) => {
    const { token } = data;
    console.log("[Socket] Logout event received with token:", token);
    if (!token) {
      console.log("❌ No token provided for logout");
      return res({ status: 401, message: "No token provided" });
    }
    let conn = await OracleDB.getConnection();
    try {
      // Verify and decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userID = decoded.userID;

      // Nullify the token in the database using userID
      const result = await conn.execute(
        `UPDATE PUBLICUSER SET TOKEN = NULL WHERE USERID = :userID`,
        { userID },
        { autoCommit: true }
      );

      console.log(`[Logout] Token cleared for userID: ${userID}`);

      return res({ status: 200, message: "Logout successful" });
    } catch (err) {
      console.error("[Logout] Error:", err.message);
      return res({
        status: 401,
        message: "Invalid token or logout failed. " + err.message,
      });
    } finally {
      if (conn) await conn.close();
    }
  });
  //Logout ==================================================================================================
}
