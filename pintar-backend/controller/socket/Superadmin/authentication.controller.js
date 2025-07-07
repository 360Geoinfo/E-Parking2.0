import OracleDB from "oracledb";

export default function ({ socket, io, bcrypt, uuidv4 }) {
  socket.on("connection2", (socket) => {
    console.log("A user connected");
  });

  socket.on(
    "insertNewOperator2",
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

  socket.on("operatorList2", async (res) => {
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
}
