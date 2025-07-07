import express from "express";
import OracleDB from "oracledb";

const router = express.Router();

router.post("/", async (req, res) => {
  const { VEHICLEID } = req.body;

  if (!VEHICLEID) {
    return res.status(400).json({ message: "Vehicle ID is required" });
  }

  try {
    const conn = await OracleDB.getConnection();

    await conn.execute(
      `DELETE FROM VEHICLEDETAIL WHERE VEHICLEID = :vehicleid`,
      [VEHICLEID],
      { autoCommit: true }
    );

    res.status(200).json({ message: "Delete successful" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
});

export default router;
