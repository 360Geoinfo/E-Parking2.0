import OracleDB from "oracledb";

export default function ({ socket, bcrypt }) {
  socket.on("getResetRequests", async (res) => {
    console.log("Handling getResetRequests event");

    let conn = await OracleDB.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM RESETREQUEST`,
        {},
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );

      if (result.rows.length === 0) {
        return res({
          status: 404,
          message: "No reset requests found",
        });
      }

      const data = await Promise.all(
        result.rows.map(async (row) => {
          const operator = await conn.execute(
            `SELECT * FROM OPERATORS WHERE USERID = :id`,
            { id: row.OPERATORID },
            { outFormat: OracleDB.OUT_FORMAT_OBJECT }
          );
          const { PASSWORD, CREATED_AT, UPDATED_AT, USERID, ...operatorData } =
            operator.rows[0]; // Exclude PASSWORD field
          return {
            ...row,
            ...operatorData,
          };
        })
      );

      return res({
        status: 200,
        message: "Reset requests retrieved successfully",
        data,
      });
    } catch (error) {
      console.error("Error handling getResetRequests:", error);
      return res({
        status: 500,
        message: `Internal Server Error", error: ${error.message}`,
      });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  });

  socket.on("approveResetRequest", async ({ operatorId }, res) => {
    if (!operatorId) {
      console.log("❌ Operator ID is required");
      return res({
        status: 400,
        message: "Operator ID is required",
      });
    }
    let conn = await OracleDB.getConnection();
    try {
      console.log(`Approving reset request for Operator ID: ${operatorId}`);

      const checkRequest = await conn.execute(
        `SELECT * FROM RESETREQUEST WHERE OPERATORID = :operatorId`,
        { operatorId },
        { outFormat: OracleDB.OUT_FORMAT_OBJECT }
      );
      if (checkRequest.rows.length === 0) {
        return res({
          status: 404,
          message: "Reset request not found",
        });
      }
      const isApproved = checkRequest.rows[0].STATUS === "APPROVED";
      if (isApproved) {
        return res({
          status: 200,
          message: "Reset request already approved",
        });
      }
      const result = await conn.execute(
        `UPDATE RESETREQUEST SET STATUS = 'APPROVED', SUPERADMINID = :superAdminId WHERE OPERATORID = :operatorId`,
        { operatorId, superAdminId: "Testing SuperAdmin" },
        { autoCommit: true }
      );

      console.log(`Update result: ${JSON.stringify(result)}`);

      if (result.rowsAffected === 0) {
        return res({
          status: 404,
          message: "Reset request not found or already approved",
        });
      }
      const saltRounds = 10;
      const password = "Pintar@123";
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const updatePasswordResult = await conn.execute(
        "UPDATE OPERATORS SET PASSWORD = :hashedPassword WHERE USERID = :operatorId",
        [hashedPassword, operatorId],
        { autoCommit: true }
      );
      if (updatePasswordResult.rowsAffected === 0) {
        return res({
          status: 404,
          message: "Operator not found for the reset request",
        });
      }
      return res({
        status: 200,
        message: "Reset request approved successfully",
      });
    } catch (error) {
      console.error("Error approving reset request:", error);
      return res({
        status: 500,
        message: `Internal Server Error: ${error.message}`,
      });
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  });
}
