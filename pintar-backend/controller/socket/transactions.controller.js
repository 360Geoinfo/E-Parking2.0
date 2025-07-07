import OracleDB from "oracledb";

export default function ({ socket, io, jwt, bcrypt, uuidv4 }) {
  socket.on("getLatestTransaction", async ({ userID }, res) => {
    console.log("[Socket] getLatestTransaction called with userID:", userID);
    if (!userID) {
      console.error("User ID is required");
      return res({ status: 400, error: "User ID is required" });
    }
    let conn;
    try {
      conn = await OracleDB.getConnection();
      console.log("Connected to Oracle DB for getLatestTransaction");
      const result = await conn.execute(
        `SELECT IDTRANSACTION, USERNAME, PAYMENTMETHOD, BUYDATE, BUYTIME, PAYMENTAMOUNT, PETAKDIGIT
             FROM PETAK
             WHERE USERID = :userID
             ORDER BY BUYDATE DESC, BUYTIME DESC
             FETCH FIRST 1 ROWS ONLY`,
        [userID],
        { outFormat: OracleDB.OUT_FORMAT_OBJECT } // return result as array of objects
      );
      if (result.rows.length === 0) {
        console.warn("No transactions found for user:", userID);
        return res({ status: 404, error: "No transactions found" });
      }
      console.log("Fetched latest transaction data:", result.rows[0]);
      return res({ status: 200, data: result.rows[0] });
    } catch (err) {
      console.error("[getLatestTransaction] DB error:", err.message);
      return res({
        status: 500,
        error: "Database error",
        details: err.message,
      });
    } finally {
      if (conn) await conn.close();
    }
  });
  socket.on("getreceiptparking", async ({ IDTransaction }, res) => {
    console.log(
      "[Socket] getreceiptparking called with IDTransaction:",
      IDTransaction
    );

    if (!IDTransaction) {
      console.error("IDTransaction is required");
      return res({ status: 400, error: "IDTransaction is required" });
    }

    let conn;

    try {
      conn = await OracleDB.getConnection();
      console.log("Connected to Oracle DB for getreceiptparking");

      const result = await conn.execute(
        `SELECT IDTRANSACTION, USERNAME, PAYMENTMETHOD, BUYDATE, BUYTIME, PAYMENTAMOUNT, PETAKDIGIT
                 FROM PETAK
                 WHERE IDTRANSACTION = :idTransaction`,
        [IDTransaction],
        { outFormat: OracleDB.OUT_FORMAT_OBJECT } // return result as array of objects
      );

      if (result.rows.length === 0) {
        console.warn("No records found for transaction:", IDTransaction);
        return res({ status: 404, error: "Receipt not found" });
      }

      console.log("Fetched receipt data:", result.rows[0]);
      return res({ status: 200, data: result.rows[0] });
    } catch (err) {
      console.error("[getreceiptparking] DB error:", err.message);
      return res({
        status: 500,
        error: "Database error",
        details: err.message,
      });
    } finally {
      if (conn) await conn.close();
    }
  });
  socket.on("payParking", async ({ parkingID, operatorID }, res) => {
    console.log("[Socket] payParking called with:", { parkingID, operatorID });
    if (!parkingID || !operatorID) {
      console.error("Parking ID and Operator ID are required");
      return res({
        status: 400,
        error: "Parking ID and Operator ID are required",
      });
    }
    let conn;
    try {
      conn = await OracleDB.getConnection();
      const payResponse = await conn.execute(
        "UPDATE PAYMENT_TO_OPERATOR SET OPERATOR_ID = :operatorID, STATUS = :status WHERE OUTDOORID = :parkingID",
        {
          status: "Paid",
          parkingID,
          operatorID,
        },
        { autoCommit: true }
      );

      if (payResponse.rowsAffected === 0) {
        console.error("❌ Failed to update payment status");
        return res({
          status: 404,
          error: "Payment not found or already processed",
        });
      }

      const updateParking = await conn.execute(
        "UPDATE OUTDOORPARKING SET PETAKSTATUS = :status WHERE OUTDOORID = :parkingID",
        {
          status: "Active",
          parkingID,
        },
        { autoCommit: true }
      );

      if (updateParking.rowsAffected === 0) {
        console.error("❌ Failed to update parking status");
      }
      io.to("operator_" + operatorID).emit("paymentStatusUpdated");

      console.log("✅ Payment status updated successfully");
      return res({ status: 200, message: "Payment processed successfully" });
    } catch (error) {
      console.error("❌ Error connecting to Oracle DB:", error.message);
      return res({
        status: 500,
        message: `Internal server error: ${error.message}`,
      });
    }
  });
}
