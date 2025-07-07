// otpTemplate.js

export const emailOTPTemplate = (username, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
      <h2 style="color: #2c3e50;">Welcome to <span style="color: #3498db;">Pintar</span>, ${username}!</h2>
      
      <p>Thank you for registering with <strong>Pintar</strong>.</p>
      
      <p>Your One-Time Password (OTP) is:</p>

      <p>This OTP is valid for 5 minutes.</p>
      
      <div style="font-size: 24px; font-weight: bold; background-color: #ecf0f1; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 10px 0;">
        ${otp}
      </div>

      <p>Please use this code to complete your registration process.</p>

      <p>If you did not initiate this registration, please ignore this email.</p>
      
      <p style="margin-top: 30px;">Best regards,<br>Pintar Team</p>
    </div>
  `;
};
