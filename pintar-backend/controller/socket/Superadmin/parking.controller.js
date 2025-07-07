import OracleDB from "oracledb";
const getVehicle = async (field, identifier, conn) => {
  try {
    const result = await conn.execute(
      `SELECT * FROM VEHICLEDETAIL WHERE ${field} = :identifier`,
      [identifier],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    console.log(`✅ Vehicle data fetched for ${field}: ${identifier}`);

    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ Error fetching vehicle data:", error.message);
    return null;
  }
};

const getFines = async (field, identifier, conn) => {
  try {
    const result = await conn.execute(
      `SELECT * FROM SAMAN WHERE ${field} = :identifier`,
      [identifier],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    console.log(
      `✅ Fines data fetched for ${field}: ${identifier}`,
      JSON.stringify(result.rows)
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ Error fetching fines data:", error.message);
    return null;
  }
};

const getUser = async (field, identifier, conn) => {
  if (identifier === "Manual Entry") {
    return {
      USERID: "Manual Entry",
      USERNAME: "Manual Entry",
    };
  }
  try {
    const result = await conn.execute(
      `SELECT * FROM PUBLICUSER WHERE ${field} = :identifier`,
      [identifier],
      { outFormat: OracleDB.OUT_FORMAT_OBJECT }
    );
    console.log(`✅ User data fetched for ${field}: ${identifier}`);

    return result.rows[0] || null;
  } catch (error) {
    console.error("❌ Error fetching user data:", error.message);
    return null;
  }
};

export default function ({ socket, io }) {
  socket.on("getParkingData", async (res) => {
    let conn;
    try {
      conn = await OracleDB.getConnection();
      console.log("✅ Connected to Oracle DB for fetchParkingData");
      const result = await conn.execute(`SELECT * FROM OUTDOORPARKING`, [], {
        outFormat: OracleDB.OUT_FORMAT_OBJECT,
      });
      //   const gatedresult = await conn.execute(
      //     `SELECT * FROM GATEDPARKING`, [], {
      //       outFormat: OracleDB.OUT_FORMAT_OBJECT,
      //     }
      //   );

      if (result.rows.length === 0) {
        console.log("❌ No outdoor parking data found");
        return res({
          status: 404,
          message: "No outdoor parking data found",
        });
      }
      const data = {
        outdoorParking: await Promise.all(
          result.rows.map(async (row) => {
            const vehicleData =
              (await getVehicle("VEHICLEID", row.VEHICLEID, conn)) || {};
            const { USERID, ...vehicleDataTrimmed } = vehicleData; // Exclude USERID from vehicle data
            const userData = (await getUser("USERID", USERID, conn)) || {};
            const { PASSWORD, ...userDataTrimmed } = userData; // Exclude PASSWORD from user data
            const finesData =
              (await getFines("OUTDOORPARKINGID", row.OUTDOORID, conn)) || {};
            return {
              ID: row.OUTDOORID,
              VEHICLE: { ...vehicleDataTrimmed, USER: userDataTrimmed },
              SAMAN: finesData,
              STARTDATE: row.STARTDATE,
              STARTTIME: row.STARTTIME,
              EXITDATE: row.EXITDATE,
              EXITTIME: row.EXITTIME,
              DURATION: row.DURATION,
              ZONE: row.ZONE,
              PETAKSTATUS: row.PETAKSTATUS,
            };
          })
        ),
      };

      return res({
        status: 200,
        message: "Parking data fetched successfully",
        data,
      });
    } catch (error) {
      console.error("❌ Error fetching parking data:", error.message);
      return res({
        status: 500,
        error: `Internal server error ${error.message}`,
      });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  });

  // DELETE THIS SECTION IF IT MAKING THE ERROR
  socket.on("getPetakUsed", async (res) => {
    let conn;
    try {
      conn = await OracleDB.getConnection();
      console.log("📊 Connected to Oracle DB for getPetakUsed");

      const now = new Date();
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(now.getDate() - 7);

      const weekBeforeStart = new Date(now);
      weekBeforeStart.setDate(now.getDate() - 14);

      const todayStr = now.toISOString().split("T")[0];
      const lastWeekStr = lastWeekStart.toISOString().split("T")[0];
      const weekBeforeStr = weekBeforeStart.toISOString().split("T")[0];

      // PETAK Used in the last 7 days (BUYDATE + PETAKDIGIT = 0)
      const lastWeek = await conn.execute(
        `SELECT COUNT(*) AS COUNT FROM PETAK
        WHERE TO_NUMBER(PETAKDIGIT) = 0
        AND BUYTIME BETWEEN TO_TIMESTAMP(:start, 'YYYY-MM-DD HH24:MI:SS') 
        AND TO_TIMESTAMP(:end, 'YYYY-MM-DD HH24:MI:SS')`,
        [`${lastWeekStr} 00:00:00`, `${todayStr} 23:59:59`]
      );

      const previousWeek = await conn.execute(
        `SELECT COUNT(*) AS COUNT FROM PETAK
        WHERE TO_NUMBER(PETAKDIGIT) = 0
        AND BUYTIME BETWEEN TO_TIMESTAMP(:start, 'YYYY-MM-DD HH24:MI:SS') 
        AND TO_TIMESTAMP(:end, 'YYYY-MM-DD HH24:MI:SS')`,
        [`${weekBeforeStr} 00:00:00`, `${lastWeekStr} 23:59:59`]
      );

      const usedLastWeek = lastWeek.rows[0].COUNT || 0;
      const usedPreviousWeek = previousWeek.rows[0].COUNT || 0;
      const percentChange = usedPreviousWeek === 0
        ? 100
        : ((usedLastWeek - usedPreviousWeek) / usedPreviousWeek) * 100;

      return res({
        status: 200,
        data: {
          used: usedLastWeek,
          percentChange: percentChange.toFixed(2),
        },
      });
    } catch (error) {
      console.error("❌ getPetakUsed error:", error.message);
      return res({
        status: 500,
        error: error.message,
      });
    } finally {
      if (conn) await conn.close();
    }
  });
}
