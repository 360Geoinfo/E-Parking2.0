import { useSocket } from "@/context/socket";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ResetPasswordScreen({
  showResetPassword,
  setShowResetPassword,
}) {
  const { requireReset, setRequireReset, resetPassword, requestResetPassword } =
    useSocket();
  const [newCredentials, setNewCredentials] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState([]);
  const handleCredentialsChange = (field, value) => {
    setError([]); // Clear error on input change
    setNewCredentials((prev) => ({ ...prev, [field]: value }));
  };
  const handleResetPassword = async () => {
    const { email, password, confirmPassword } = newCredentials;

    // First-time login confirmation
    if (requireReset) {
      // Clear any previous error
      setError([]);

      // Check if both fields are filled
      if (!password || !confirmPassword) {
        setError((prev) => [...prev, "Please fill in both fields."]);
      }

      // Validate password length
      if (password.length < 8) {
        setError((prev) => [
          ...prev,
          "Password must be at least 8 characters long.",
        ]);
      }

      // Validate match
      if (password !== confirmPassword) {
        setError((prev) => [...prev, "Passwords do not match."]);
      }
      // If there are any errors, do not proceed
      if (error.length > 0) {
        return;
      }
      Alert.alert(
        "First Time Login",
        "By continuing, you agree to reset your password. If you forget your password, please contact the administrator during your shift. By clicking OK, you confirm your understanding.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: async () => {
              setRequireReset(false); // Clear the requireReset flag
              await resetPassword(newCredentials);
            },
          },
        ]
      );
    } else {
      setError([]); // Clear errors before proceeding
      if (!newCredentials.email) {
        setError((prev) => [...prev, "Email is required for password reset."]);
        return; // Exit if email is not provided
      }

      if (error.length > 0) {
        return; // Exit if there are any errors
      }
      await requestResetPassword(newCredentials.email);
      setShowResetPassword(false); // Hide reset password screen
    }
  };

  return (
    <View
      style={{
        width: "100%",
        gap: 12,
      }}
    >
      {requireReset && (
        <Text style={{ fontSize: 18, marginBottom: 12, textAlign: "center" }}>
          {`We require you to reset your credentials before proceeding.`}
        </Text>
      )}

      {!requireReset ? (
        <>
          <Text style={{ fontSize: 18, marginBottom: 12, textAlign: "center" }}>
            {`Please enter your Email and new password below.`}
          </Text>
          <TextInput
            placeholder="Email"
            style={{
              width: 300,
              marginBottom: 12,
              backgroundColor: "#f0f0f0",
              padding: 10,
              borderRadius: 5,
              fontSize: 20,
            }}
            placeholderTextColor={"#888"}
            onChangeText={(text) => handleCredentialsChange("email", text)}
          />
        </>
      ) : (
        <>
          <TextInput
            placeholder="Password"
            style={{
              width: 300,
              marginBottom: 12,
              backgroundColor: "#f0f0f0",
              padding: 10,
              borderRadius: 5,
              fontSize: 20,
            }}
            placeholderTextColor={"#888"}
            secureTextEntry
            onChangeText={(text) => handleCredentialsChange("password", text)}
          />
          <TextInput
            placeholder="Confirm Password"
            style={{
              width: 300,
              marginBottom: 12,
              backgroundColor: "#f0f0f0",
              padding: 10,
              borderRadius: 5,
              fontSize: 20,
            }}
            placeholderTextColor={"#888"}
            secureTextEntry
            onChangeText={(text) =>
              handleCredentialsChange("confirmPassword", text)
            }
          />
        </>
      )}

      {error.length > 0 && (
        <View style={{ marginTop: 10, width: "100%" }}>
          {error.map((errMsg, index) => (
            <Text key={index} style={{ color: "red" }}>
              {errMsg}
            </Text>
          ))}
        </View>
      )}
      <View
        style={{
          width: "100%",
          gap: 10,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#2567ea",
            padding: 15,
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
          }}
          onPress={handleResetPassword}
        >
          <Text
            style={{
              color: "#ffffff",
              fontSize: 16,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {requireReset ? "Reset Password" : "Request Reset Password"}
          </Text>
        </TouchableOpacity>
        {showResetPassword && (
          <TouchableOpacity
            style={{
              backgroundColor: "#ce4452",
              padding: 15,
              borderRadius: 5,
              alignItems: "center",
              justifyContent: "center",
              flexGrow: 1,
            }}
            onPress={() => setShowResetPassword(false)}
          >
            <Text
              style={{
                color: "#ffffff",
                fontSize: 16,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
