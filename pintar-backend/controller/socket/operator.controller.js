import dayjs from "dayjs";
import OracleDB from "oracledb";

const getZoneData = async (zone) => {
  let conn = await OracleDB.getConnection();
  try {
    const result = await conn.execute(
      `SELECT * FROM ZONES WHERE CODE = :zoneCode`,
      { zoneCode: zone },
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length === 0) {
      throw new Error("Zone not found");
    }
    return result.rows[0];
  } catch (error) {
    console.error("❌ Error fetching zone data:", error.message);
    throw error;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
};

const fetchOperator = async (field, identifier, conn) => {
  const query = `SELECT * FROM OPERATORS WHERE ${field} = :identifier`;
  const result = await conn.execute(query, [identifier], {
    outFormat: OracleDB.OUT_FORMAT_OBJECT,
  });
  return result.rows.length > 0 ? result.rows[0] : null;
};
const fetchPayments = async (field, identifier, conn) => {
  const query = `SELECT * FROM PAYMENT_TO_OPERATOR WHERE ${field} = :identifier`;
  const result = await conn.execute(query, [identifier], {
    outFormat: OracleDB.OUT_FORMAT_OBJECT,
  });
  return result.rows.length > 0 ? result.rows[0] : null;
};
const fetchSaman = async (field, identifier, conn) => {
  const query = `SELECT * FROM SAMAN WHERE ${field} = :identifier`;
  const result = await conn.execute(query, [identifier], {
    outFormat: OracleDB.OUT_FORMAT_OBJECT,
  });
  return result.rows.length > 0 ? result.rows[0] : null;
};
const fetchAttendance = async (field, identifier, conn) => {
  const query = `SELECT * FROM OPERATOR_ATTENDANCE WHERE ${field} = :identifier`;
  const result = await conn.execute(query, [identifier], {
    outFormat: OracleDB.OUT_FORMAT_OBJECT,
  });
  return result.rows.length > 0 ? result.rows[0] : null;
};

export default function ({
  socket,
  io,
  bcrypt,
  uuidv4,
  getZone,
  getOperator,
  getOperatorPersonal,
  getOperatorAttendance,
  getPayments,
  getSaman,
}) {
  // Handle socket connection

  socket.on("joinRoom", ({ room }) => {
    socket.join(room);
    console.log(`✅ Socket ${socket.id} joined ${room}`);
  });

  socket.on("leaveRoom", ({ room }) => {
    socket.leave(room);
    console.log(`❎ Socket ${socket.id} left ${room}`);
  });

  socket.on(
    "insertNewOperator",
    async ({ USERNAME, EMAIL, PHONENUMBER, password }, res) => {
      console.log("New Operator Called");

      if (!USERNAME && !EMAIL) {
        return res({
          status: 400,
          message: "Missing Operator Username or Email",
        });
      }

      let conn = await OracleDB.getConnection();
      try {
        const emailResponse = await conn.execute(
          "SELECT * FROM OPERATORS WHERE EMAIL = :email",
          { email: EMAIL }
        );
        const userResponse = await conn.execute(
          "SELECT * FROM OPERATORS WHERE USERNAME = :username",
          { username: USERNAME }
        );

        if (emailResponse.rows.length > 0) {
          return res({
            status: 401,
            message: "Email Already Exists",
          });
        }
        if (userResponse.rows.length > 0) {
          return res({
            status: 401,
            message: "Username Already Exists",
          });
        }

        const userID = uuidv4();
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const insertResponse = await conn.execute(
          "INSERT INTO OPERATORS (USERID, USERNAME, EMAIL, PHONENUMBER, PASSWORD) VALUES (:userID, :username, :email, :phonenumber, :hashedPassword)",
          {
            userID,
            username: USERNAME,
            email: EMAIL,
            phonenumber: PHONENUMBER,
            hashedPassword,
          },
          { autoCommit: true }
        );

        if (insertResponse.rowsAffected === 0) {
          return res({
            status: 405,
            message: "Error Inserting New Operator",
          });
        }

        const fetchedNewOperator = await conn.execute(
          `SELECT * FROM OPERATORS WHERE USERID = :userID`,
          { userID },
          { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        if (fetchedNewOperator.rows.length === 0) {
          return res({
            status: 404,
            message: "No Newly Created Operator Found",
          });
        }

        const { PASSWORD, ...operatorData } = fetchedNewOperator.rows[0];

        return res({
          status: 200,
          message: "Successfully insert new operator",
          data: operatorData,
        });
      } catch (error) {
        console.log("❌ Error Inserting New Operator: ", error.message);
        return res({
          status: 500,
          message: `Internal error: ${error.message}`,
        });
      } finally {
        if (conn) await conn.close();
      }
    }
  );

  socket.on("operatorList", async (res) => {
    let conn = await OracleDB.getConnection();
    try {
      const { rows } = await conn.execute(
        "SELECT * FROM OPERATORS",
        {},
        {
          outFormat: OracleDB.OUT_FORMAT_OBJECT,
        }
      );
      if (rows.length === 0) {
        return res({
          status: 400,
          message: "No Operators Found",
        });
      }
      const data = await Promise.all(
        rows.map((operator) => {
          const { PASSWORD, ...d } = operator;

          return d;
        })
      );

      data.sort((a, b) => a.ID - b.ID);

      return res({
        status: 200,
        message: "Operator List Found",
        data,
      });
    } catch (error) {
      console.error("Internal Server Error: ", error.message);
      return res({
        status: 500,
        message: "Internal Server Error ",
      });
    } finally {
      if (conn) await conn.close();
    }
  });

  socket.on("loginOperator", async ({ username, email, password }, res) => {
    // Check if either username or email is provided
    if (!username && !email) {
      return res({
        status: 400,
        message: "Either username or email is required",
      });
    }
    if (!password) {
      return res({
        status: 400,
        message: "Password is required",
      });
    }

    let conn = await OracleDB.getConnection();
    try {
      // Build dynamic query based on provided identifier
      let query, value;
      if (email) {
        query = "SELECT * FROM OPERATORS WHERE EMAIL = :identifier";
        value = { identifier: email };
      } else {
        query = "SELECT * FROM OPERATORS WHERE USERNAME = :identifier";
        value = { identifier: username };
      }

      const operatorCheck = await conn.execute(query, value, {
        outFormat: OracleDB.OUT_FORMAT_OBJECT,
      });

      if (operatorCheck.rows.length === 0) {
        console.log("❌ Invalid username, email, or password");
        return res({
          status: 401,
          message: "Invalid username, email, or password",
        });
      }
      const storedPassword = operatorCheck.rows[0].PASSWORD;
      console.log(storedPassword);

      const isPasswordValid = await bcrypt.compare(password, storedPassword);
      console.log("is Password Valid?", isPasswordValid);

      if (!isPasswordValid) {
        console.log("❌ Invalid password");
        return res({
          status: 401,
          message: "Invalid password",
        });
      }
      const isDefaultPassword = isPasswordValid && password === "Pintar@123"; // Replace with your actual default password check

      // Remove password from response
      const operatorData = { ...operatorCheck.rows[0] };
      delete operatorData.PASSWORD; // Remove password field
      console.log("Operator data without password:", operatorData);

      socket.join(`operator_${operatorData.ID}`);
      console.log(`✅ Operator ${operatorData.ID} joined their room`);
      return res({
        status: 200,
        message: "Login operator successful",
        data: operatorData,
        firstTime: isDefaultPassword,
      });
    } catch (error) {
      console.error("❌ Error connecting to Oracle DB:", error.message);
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

  socket.on("requestResetPassword", async ({ email }, res) => {
    if (!email) {
      console.log("❌ Email is required for password reset");
      return res({
        status: 400,
        message: "Email is required for password reset",
      });
    }
    let conn = await OracleDB.getConnection();
    try {
      const result = await conn.execute(
        `SELECT USERID FROM OPERATORS WHERE EMAIL = :email`,
        { email },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );
      if (result.rows.length === 0) {
        console.log("❌ No operator found with the given email");
        return res({
          status: 404,
          message: "No operator found with the given email",
        });
      }
      const operatorID = result.rows[0].USERID;
      const requestResult = await conn.execute(
        `INSERT INTO RESETREQUEST (OPERATORID) VALUES (:operatorID)`,
        { operatorID },
        { autoCommit: true }
      );

      if (requestResult.rowsAffected === 0) {
        console.log("❌ Failed to create password reset request");
        return res({
          status: 500,
          message: "Failed to create password reset request",
        });
      }

      console.log("✅ Password reset requested for operator:", operatorID);
      return res({
        status: 200,
        message: "Password reset requested successfully",
      });
    } catch (error) {
      console.error("❌ Error requesting password reset:", error.message);
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

  socket.on("resetPasswordOperator", async ({ operatorID, password }, res) => {
    if (!operatorID || !password) {
      console.log("❌ Operator ID and password are required");
      return res({
        status: 400,
        message: "Operator ID and password are required",
      });
    }
    if (password === "Pintar@123") {
      console.log("❌ Password cannot be the default password");
      return res({
        status: 400,
        message: "Password cannot be the default password",
      });
    }
    let conn = await OracleDB.getConnection();
    try {
      const salt = 10;
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log(hashedPassword);

      const result = await conn.execute(
        `UPDATE OPERATORS SET PASSWORD = :password WHERE USERID = :operatorID`,
        {
          password: hashedPassword,
          operatorID,
        },
        { autoCommit: true }
      );

      if (result.rowsAffected === 0) {
        console.log("❌ No operator found with the given ID");
        return res({
          status: 404,
          message: "No operator found with the given ID",
        });
      }

      console.log("✅ Password reset successful for operator:", operatorID);
      return res({
        status: 200,
        message: "Password reset successful",
      });
    } catch (error) {
      console.error("❌ Error resetting password:", error.message);
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

  socket.on("operatorAttendance", async ({ operatorID }, res) => {
    if (!operatorID) {
      console.log("❌ Operator ID is required");
      return res({ status: 400, message: "Operator ID is required" });
    }

    let conn = await OracleDB.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM OPERATOR_ATTENDANCE WHERE OPERATOR_ID = :operatorID`,
        [operatorID],
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );

      if (result.rows.length === 0) {
        console.log("❌ No attendance records found for this operator");
        return res({
          status: 404,
          message: "No attendance records found for this operator",
        });
      }

      // filter out if the CLOCK_OUT field is not null
      const data = result.rows.filter((row) => !row.CLOCK_OUT);
      // const data = [result.rows[0]];
      if (data.length === 0) {
        console.log("❌ No active attendance records found for this operator");
        return res({
          status: 404,
          message: "No active attendance records found for this operator",
        });
      }

      return res({ status: 200, data });
    } catch (error) {
      console.error("❌ Error fetching attendance data:", error.message);
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

  socket.on("clockIn", async ({ operatorID, zone }, res) => {
    if (!operatorID || !zone) {
      console.log("❌ Operator ID is required");
      return res({ status: 400, message: "Operator ID is required" });
    }
    let conn = await OracleDB.getConnection();
    const zoneData = await getZoneData(zone);
    const userData = await fetchOperator("USERID", operatorID, conn);
    const transactionData = await fetchPayments(
      "OPERATOR_ID",
      operatorID,
      conn
    );
    const finesData = await fetchSaman("OPERATORID", operatorID, conn);
    console.log("Clocking in for operator:", operatorID, "at zone:", zoneData);

    try {
      const result = await conn.execute(
        `INSERT INTO OPERATOR_ATTENDANCE (OPERATOR_ID, ZONE_ID) VALUES (:operatorID, :zoneID)`,
        {
          operatorID,
          zoneID: zoneData.ID,
        },
        { autoCommit: true, outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );
      if (result.rowsAffected === 0) {
        console.log("❌ Failed to clock in for operator:", operatorID);
        return res({
          status: 500,
          message: "Failed to clock in",
        });
      }

      const response = await conn.execute(
        `SELECT * FROM OPERATOR_ATTENDANCE WHERE OPERATOR_ID = :operatorID ORDER BY CREATED_AT DESC FETCH FIRST 2 ROWS ONLY`,
        {
          operatorID,
        },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );
      if (response.rows.length === 0) {
        console.log("❌ No active attendance found for operator:", operatorID);
        return res({
          status: 404,
          message: "No active attendance found",
        });
      }
      socket.join(`operator_${operatorID}`);
      console.log(`✅ Operator ${operatorID} clocked in successfully`);
      io.emit("operatorLoggedIn", {
        status: 200,
        USERID: userData.USERID,
        USERNAME: userData.USERNAME,
        LOGINDATE: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        LOGOUTDATE: null,
        ZONE_ID: zoneData.ID,
        TRANSACTIONS_ACCEPTED: transactionData?.length || 0,
        FINES: finesData?.length || 0,
        STATUS: "On Duty",
      });
      return res({
        status: 200,
        message: "Clock-in successful",
        data: [response.rows[0], response.rows[1] || null],
      });
    } catch (error) {
      console.error("❌ Error clocking in:", error.message);
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
  socket.on("clockOut", async ({ attendanceID, operatorID }, res) => {
    if (!attendanceID || !operatorID) {
      console.log(
        "❌ Attendance ID and Operator ID are required for clock out"
      );
      return res({
        status: 400,
        message: "Attendance ID and Operator ID are required",
      });
    }
    let conn = await OracleDB.getConnection();
    const userData = await fetchOperator("USERID", operatorID, conn);
    try {
      const result = await conn.execute(
        `UPDATE OPERATOR_ATTENDANCE SET CLOCK_OUT = :clockOut WHERE ID = :id AND OPERATOR_ID = :operatorID`,
        {
          clockOut: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
          id: attendanceID,
          operatorID,
        },
        { autoCommit: true }
      );
      if (result.rowsAffected === 0) {
        console.log("❌ No active attendance found for operator:", operatorID);
        return res({
          status: 404,
          message: "No active attendance found",
        });
      }
      console.log("✅ Operator clocked out successfully:", operatorID);

      const forSuperAdminData = {
        status: 200,
        USERID: userData.USERID,
        LOGOUTDATE: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        STATUS: "Off Duty",
      };
      console.log(
        "Emitting operatorLoggedOut event with data:",
        JSON.stringify(forSuperAdminData, null, 2)
      );
      io.emit("operatorLoggedOut", forSuperAdminData);
      socket.leave(`operator_${operatorID}`);
      return res({
        status: 200,
        message: "Clock-out successful",
        data: null,
      });
    } catch (error) {
      console.error("❌ Error during clock out:", error.message);
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
  socket.on("logoutOperator", async ({ attendanceID, operatorID }, res) => {
    if (!attendanceID) {
      console.log("❌ Attendance ID is required for logout");
      return res({ status: 400, message: "Attendance ID is required" });
    }

    let conn = await OracleDB.getConnection();
    // const userData = await fetchOperator("USERID", operatorID, conn);

    try {
      const result = await conn.execute(
        `UPDATE OPERATOR_ATTENDANCE SET CLOCK_OUT = :clockOut WHERE ID = :id AND OPERATOR_ID = :operatorID`,
        {
          clockOut: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
          id: attendanceID,
          operatorID,
        },
        { autoCommit: true }
      );

      // const forSuperAdminData = {
      //   status: 200,
      //   USERID: userData.USERID,
      //   LOGOUTDATE: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      //   STATUS: "Off Duty",
      // };
      // console.log(
      //   "Emitting operatorLoggedOut event with data:",
      //   JSON.stringify(forSuperAdminData, null, 2)
      // );
      // io.emit("operatorLoggedOut", forSuperAdminData);
      socket.leave(`operator_${operatorID}`);
      console.log("✅ Operator logged out successfully:", operatorID);
      return res({
        status: 200,
        message: "Logout successful",
        data: null,
      });
    } catch (error) {
      console.error("❌ Error during logout:", error.message);
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

  socket.on("logoutOperatorOnly", async ({ operatorID }, res) => {
    if (!operatorID) {
      console.log("❌ Operator ID is required for logout");
      return res({ status: 400, message: "Operator ID is required" });
    }
    let conn = await OracleDB.getConnection();
    try {
      socket.leave(`operator_${operatorID}`);
      console.log("✅ Operator logged out successfully:", operatorID);
      return res({
        status: 200,
        message: "Logout successful",
        data: null,
      });
    } catch (error) {
      console.error("❌ Error during logout:", error.message);
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

  socket.on(
    "changeOperatorPassword",
    async ({ operatorID, oldPassword, newPassword }, res) => {
      if (!operatorID || !oldPassword || !newPassword) {
        console.log(
          "❌ Operator ID, old password, and new password are required"
        );
        return res({
          status: 400,
          message: "Operator ID, old password, and new password are required",
        });
      }
      if (newPassword === "Pintar@123") {
        console.log("❌ Password cannot be the default password");
        return res({
          status: 400,
          message: "Password cannot be the default password",
        });
      }
      let conn = await OracleDB.getConnection();
      try {
        const result = await conn.execute(
          `SELECT PASSWORD FROM OPERATORS WHERE ID = :id`,
          { id: operatorID },
          { outFormat: OracleDB.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
          console.log("❌ Operator not found");
          return res({
            status: 404,
            message: "Operator not found",
          });
        }

        const isMatch = await bcrypt.compare(
          oldPassword,
          result.rows[0].PASSWORD
        );
        if (!isMatch) {
          console.log("❌ Old password is incorrect");
          return res({
            status: 400,
            message: "Old password is incorrect",
          });
        }

        const isTheSamePassword = await bcrypt.compare(
          newPassword,
          result.rows[0].PASSWORD
        );
        if (isTheSamePassword) {
          console.log("❌ New password cannot be the same as the old password");
          return res({
            status: 400,
            message: "New password cannot be the same as the old password",
          });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await conn.execute(
          `UPDATE OPERATORS SET PASSWORD = :password WHERE ID = :id`,
          { password: hashedNewPassword, id: operatorID },
          { autoCommit: true }
        );

        console.log("✅ Password changed successfully");
        return res({
          status: 200,
          message: "Password changed successfully",
        });
      } catch (error) {
        console.error("❌ Error changing password:", error.message);
        return res({
          status: 500,
          message: `Internal server error: ${error.message}`,
        });
      } finally {
        if (conn) {
          await conn.close();
        }
      }
    }
  );
}
