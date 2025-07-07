import OracleDB from "oracledb";

const getZoneAreas = async (zone) => {
  if (!zone) return null;
  let conn;
  try {
    conn = await OracleDB.getConnection();
    const result = await conn.execute(
      `SELECT * FROM ZONEAREAS WHERE ZONEID = :zoneId`,
      [zone.ID],
      {
        outFormat: OracleDB.OUT_FORMAT_OBJECT,
      }
    );
    return result.rows;
  } catch (error) {
    console.error("❌ Error fetching zone areas:", error.message);
    return null;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
};

export default function ({ io, socket }) {
  socket.on("getZone", async (res) => {
    console.log("[SOCKET] getZone called");
    let conn;
    try {
      conn = await OracleDB.getConnection();
      console.log("✅ Connected to Oracle DB for fetchZone");
      const result = await conn.execute(`SELECT * FROM ZONES`, [], {
        outFormat: OracleDB.OUT_FORMAT_OBJECT,
      });

      if (result.rows.length === 0) {
        console.log("⚠️ No zones found");
        return res({ status: 404, message: "No zones found" });
      }

      const zones = await Promise.all(
        result.rows.map(async (row) => {
          const areas = await getZoneAreas(row);
          return {
            ID: row.ID,
            CODE: row.CODE,
            NAME: row.NAME,
            TYPE: row.TYPE,
            ZONEAREAS: areas,
          };
        })
      );

      console.log("✅ Zones fetched successfully:", zones);
      return res({ status: 200, data: zones });
    } catch (error) {
      console.error("❌ Error fetching zones:", error.message);
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
}
