import dayjs from "dayjs";
import OracleDB from "oracledb";

const fetchUser = async (field, identifier, conn) => {
  const query = `SELECT * FROM OPERATORS WHERE ${field} = :identifier`;
  const result = await conn.execute(query, [identifier], {
    outFormat: OracleDB.OUT_FORMAT_OBJECT,
  });
  return result.rows.length > 0 ? result.rows[0] : null;
};

const fetchZone = async (field, identifier, conn) => {
  const query = `SELECT * FROM ZONES WHERE ${field} = :identifier`;
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

export default function ({ socket, io }) {
  socket.on("fetchAllAttendance", async (res) => {
    const currentDate = dayjs().format("YYYY-MM-DD");
    let conn;
    try {
      conn = await OracleDB.getConnection();
      const allOperators = await conn.execute(
        "SELECT * FROM OPERATORS",
        {},
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );
      if (allOperators.rows.length === 0) {
        return res({
          status: 404,
          message: "No operators found.",
        });
      }
      const result = await Promise.all(
        allOperators.rows.map(async (operator) => {
          const { USERID: operatorID } = operator;
          if (!operatorID) return null;

          const userData = await fetchUser("USERID", operatorID, conn);
          const rawAttendance = await conn.execute(
            `SELECT * FROM OPERATOR_ATTENDANCE WHERE OPERATOR_ID = :operatorID ORDER BY ID DESC`,
            [operatorID],
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
          );

          const attendance = rawAttendance.rows.find((record) =>
            dayjs(`${record.DATE}T${record.CLOCK_IN}`).isSame(
              currentDate,
              "day"
            )
          );

          if (!attendance)
            return {
              [operatorID]: {
                USERID: operatorID,
                USERNAME: userData?.USERNAME || "Unknown Operator",
                LOGINDATE: null,
                LOGOUTDATE: null,
                ZONE: null,
                TRANSACTION_ACCEPTED: 0,
                FINES_ISSUED: 0,
                STATUS: "Off Duty",
              },
            };

          const transactionData = await fetchPayments(
            "OPERATOR_ID",
            operatorID,
            conn
          );
          const finesData = await fetchSaman("OPERATORID", operatorID, conn);
          const zone = attendance
            ? await fetchZone("ID", attendance.ZONE_ID, conn)
            : null;

          return {
            [operatorID]: {
              USERID: operatorID,
              USERNAME: userData?.USERNAME || "Unknown Operator",
              LOGINDATE: dayjs(
                `${attendance.DATE}T${attendance.CLOCK_IN}`
              ).format("YYYY-MM-DD HH:mm:ss"),
              LOGOUTDATE: attendance.CLOCK_OUT
                ? dayjs(`${attendance.CLOCK_OUT}`).format("YYYY-MM-DD HH:mm:ss")
                : null,
              ZONE: zone,
              TRANSACTION_ACCEPTED: transactionData?.length || 0,
              FINES_ISSUED: finesData?.length || 0,
              STATUS: !attendance.CLOCK_OUT ? "On Duty" : "Off Duty",
            },
          };
        })
      );

      const data = Object.assign({}, ...result.filter(Boolean));

      // data output structure
      // [
      //   operatorID: {
      //     USERID: operatorID,
      //     USERNAME: output.USERNAME,
      //     LOGINDATE: output.LOGINDATE,
      //     LOGOUTDATE: output.LOGOUTDATE,
      //     ZONE: output.ZONE,
      //     TRANSACTION_ACCEPTED: output.TRANSACTION_ACCEPTED,
      //     FINES_ISSUED: output.FINES_ISSUED
      //   },
      //   ...other operators
      // ]

      // Final Output Structure
      // USERID -- FROM OPERATOR TABLE .... DONE
      // USERNAME -- FROM OPERATOR TABLE .... DONE
      // LOGINDATE -- FROM ATTENDANCE TABLE .... DONE
      // LOGOUTDATE -- FROM ATTENDANCE TABLE .... DONE
      // ZONE -- FROM ATTENDANCE TABLE .... DONE
      // TRANSACTION_ACCEPTED -- FROM PAYMENT_TO_OPERATOR TABLE .... DONE
      // FINES_ISSUED -- FROM SAMAN TABLE .... DONE
      return res({
        status: 200,
        data,
      });
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return res({
        status: 500,
        message: error.message,
      });
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (err) {
          console.error("Error closing Oracle DB connection:", err);
        }
      }
    }
  });
}
