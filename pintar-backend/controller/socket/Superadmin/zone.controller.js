import OracleDB from "oracledb";

export default function ({ socket, io }) {
  socket.on("saveZoneAreas", async (data, res) => {
    if (!Array.isArray(data) || data.length === 0) {
      return res({ status: 400, message: "Invalid or empty data" });
    }

    let conn;
    try {
      conn = await OracleDB.getConnection();

      // Use a transaction for all inserts/updates
      await conn.execute("BEGIN NULL; END;"); // Just to ensure connection is ready

      for (const area of data) {
        const { zoneId, areaId, areaName, center, angle, vectors } = area;

        if (!zoneId || !areaName || !center || !vectors) {
          return res({
            status: 400,
            message: "Missing required fields in data",
          });
        }

        const query = areaId
          ? `UPDATE ZONEAREAS 
             SET AREA_NAME = :areaName, CENTER = :center, ANGLE = :angle, VECTORS = :vectors 
             WHERE ID = :areaId`
          : `INSERT INTO ZONEAREAS (ZONEID, AREA_NAME, CENTER, ANGLE, VECTORS) 
             VALUES (:zoneId, :areaName, :center, :angle, :vectors)`;

        const bindParams = areaId
          ? {
              areaName,
              center: JSON.stringify(center),
              angle,
              vectors: JSON.stringify(vectors),
              areaId,
            }
          : {
              zoneId,
              areaName,
              center: JSON.stringify(center),
              angle,
              vectors: JSON.stringify(vectors),
            };

        const result = await conn.execute(query, bindParams, {
          autoCommit: true, // commit once after all updates
        });

        if (result.rowsAffected === 0) {
          return res({
            status: 400,
            message: "No rows affected for area: " + areaName,
          });
        }
      }

      await conn.commit(); // commit all at once
      return res({ status: 200, message: "Zone areas saved successfully" });
    } catch (error) {
      console.error("❌ Error saving zone areas:", error.message);
      return res({
        status: 500,
        message: `Internal server error: ${error.message}`,
      });
    } finally {
      if (conn) {
        try {
          await conn.commit(); // Ensure all changes are committed
          await conn.close();
        } catch (closeError) {
          console.error("Error closing connection:", closeError.message);
        }
      }
    }
  });
}
