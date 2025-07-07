router.post("/verify-otp", async (req, res) => {
  const { userID, otp } = req.body;

  if (!userID || !otp) {
    return res.status(400).json({ message: "Missing userID or OTP." });
  }

  try {
    let conn = await OracleDB.getConnection();

    const result = await conn.execute(
      `SELECT OTP_CODE, OTP_EXPIRY FROM PUBLICUSER WHERE USERID = :userID`,
      { userID }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const [dbOtp, dbExpiry] = result.rows[0];

    // Check OTP and expiry
    if (dbOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Check expiry
    const now = new Date();
    if (dbExpiry < now) {
      return res.status(400).json({ message: "OTP expired." });
    }

    // OTP valid: clear OTP, mark user fully verified (if needed)
    await conn.execute(
      `UPDATE PUBLICUSER SET OTP_CODE = NULL, OTP_EXPIRY = NULL WHERE USERID = :userID`,
      { userID },
      { autoCommit: true }
    );

    await conn.close();

    res.json({ message: "OTP verified successfully." });
  } catch (err) {
    console.error("OTP verification failed:", err);
    res.status(500).json({ message: "Server error during OTP verification." });
  }
});
