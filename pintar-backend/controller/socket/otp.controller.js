export default function ({ io, socket, otpHolder, dayjs }) {
  socket.on("verifyOTP", async ({ inputOTP, email }, res) => {
    const storedOtp = otpHolder[email];
    console.log("[Socket] verifyOTP called with email:", email);
    if (!storedOtp) {
      console.error("No OTP found for this email");
      return res({ status: 400, error: "No OTP found for this email" });
    }
    const { otp, expiresAt, type } = storedOtp;
    console.log(
      "Stored OTP:",
      otp,
      "Expires at:",
      new Date(expiresAt),
      "Type:",
      type
    );
    if (dayjs().isAfter(expiresAt)) {
      console.error("OTP has expired");
      delete otpHolder[email]; // Clean up expired OTP
      return res({ status: 400, error: "OTP has expired" });
    }
    if (inputOTP !== otp) {
      console.error("Invalid OTP");
      return res({ status: 400, error: "Invalid OTP" });
    }
    console.log("OTP verified successfully for email:", email);
    delete otpHolder[email]; // Clean up after successful verification
    if (type === "register") {
      // Handle registration logic here
      console.log("Registration successful for email:", email);
      return res({ status: 201, message: "Registration successful" });
    } else if (type === "forgotPassword") {
      // Handle forgot password logic here
      console.log("Password reset successful for email:", email);
      return res({ status: 202, message: "Password reset successful" });
    } else {
      console.error("Unknown OTP type:", type);
      return res({ status: 400, error: "Unknown OTP type" });
    }
  });

  socket.on("fetchOTP", async ({ email }, res) => {
    if (!email) {
      console.error("Email is required to check OTP");
      return res({ status: 400, message: "Email is required" });
    }
    try {
      console.log("[Socket] fetchOTP called with email:", email);
      const storedOtp = otpHolder[email];
      if (!storedOtp) {
        console.error("No OTP found for this email");
        return res({ status: 404, message: "No OTP found for this email" });
      }
      const { otp, expiresAt, type } = storedOtp;
      console.log("Stored OTP:", otp, "Expires at:", expiresAt, "Type:", type);
      if (dayjs().isAfter(expiresAt)) {
        console.error("OTP has expired");
        delete otpHolder[email]; // Clean up expired OTP
        return res({ status: 400, message: "OTP has expired" });
      }
      console.log("OTP fetched successfully for email:", email);
      return res({ status: 200, data: { otp, expiresAt, type } });
    } catch (error) {
      console.error("Error in fetchOTP:", error.message);
      return res({
        status: 500,
        message: `Internal Server Error ${error.message}`,
      });
    }
  });

  socket.on("renewOTP", async ({ email }, res) => {
    if (!email) {
      console.error("Email is required to renew OTP");
      return res({ status: 400, message: "Email is required" });
    }
    try {
      console.log("[Socket] renewOTP called with email:", email);
      const storedOtp = otpHolder[email];
      if (!storedOtp) {
        console.error("No OTP found for this email");
        return res({ status: 404, message: "No OTP found for this email" });
      }
      const { type } = storedOtp;
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = dayjs().add(5, "minute").toDate();
      otpHolder[email] = { otp: newOtp, expiresAt, type };
      console.log("OTP renewed successfully for email:", email);
      return res({ status: 200, data: { otp: newOtp, expiresAt, type } });
    } catch (error) {
      console.error("Error in renewOTP:", error.message);
      return res({
        status: 500,
        message: `Internal Server Error ${error.message}`,
      });
    }
  });
}
