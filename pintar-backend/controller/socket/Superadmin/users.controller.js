import OracleDB from "oracledb";

const fetchVehicleData = async (field, identifier, conn) => {
  const query = `SELECT * FROM VEHICLEDETAIL WHERE ${field} = :identifier`;
  const result = await conn.execute(query, [identifier], {
    outFormat: OracleDB.OUT_FORMAT_OBJECT,
  });
  return result.rows;
};

const fetchPetakData = async (field, identifier, conn) => {
  const query = `SELECT * FROM PETAK WHERE ${field} = :identifier `;
  const result = await conn.execute(query, [identifier], {
    outFormat: OracleDB.OUT_FORMAT_OBJECT,
  });
  return result.rows[result.rows.length - 1] || []; // Return the last row if exists
};

// const fetchLastTransaction = async (field, identifier, conn) => {
//   const query = `SELECT * FROM TRANSACTIONS WHERE ${field} = :identifier ORDER BY TRANSACTION_ID DESC FETCH FIRST 1 ROWS ONLY`;
//   const result = await conn.execute(query, [identifier], {
//     outFormat: OracleDB.OUT_FORMAT_OBJECT,
//   });
//   return result.rows;
// };

const fetchSeasonalData = async (field, identifier, conn) => {
  const query = `SELECT * FROM SEASONAL WHERE ${field} = :identifier`;
  const result = await conn.execute(query, [identifier], {
    outFormat: OracleDB.OUT_FORMAT_OBJECT,
  });
  return result.rows;
};

export default function ({ socket, io }) {
  socket.on("fetchAllUsers", async (res) => {
    let conn = await OracleDB.getConnection();
    try {
      const { rows } = await conn.execute(
        "SELECT * FROM PUBLICUSER",
        {},
        {
          outFormat: OracleDB.OUT_FORMAT_OBJECT,
        }
      );
      if (rows.length === 0) {
        return res({
          status: 400,
          message: "No Users Found",
        });
      }
      const outData = await Promise.all(
        rows.map(async (user) => {
          const { PASSWORD, ...d } = user; // Exclude PASSWORD field
          const vehicleData = await fetchVehicleData("USERID", d.USERID, conn);
          const vehicleDataTrimmed = vehicleData.map((v) => {
            const { USERID, ...rest } = v; // Exclude USERID from vehicle data
            return rest;
          });
          const petakData = await fetchPetakData("USERID", d.USERID, conn);
          const seasonalData = await fetchSeasonalData(
            "USERID",
            d.USERID,
            conn
          );
          const seasonalDataTrimmed = seasonalData.map((s) => {
            const { USERID, ...rest } = s; // Exclude USERID from seasonal data
            return rest;
          });

          d.VEHICLES = vehicleDataTrimmed;
          d.PETAK = petakData;
          d.LAST_TRANSACTION = null;
          d.SEASONAL = seasonalDataTrimmed;
          return d;
        })
      );
      return res({
        status: 200,
        message: "Users Found",
        data: outData,
      });
    } catch (error) {
      console.error("Internal Server Error: ", error.message);
      return res({
        status: 500,
        message: error.message || "An error occurred while fetching users",
      });
    } finally {
      if (conn) await conn.close();
    }
  });
}
