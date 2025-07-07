import { useSocket } from "@/context/socket";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";

const ChangePassword = ({ CardWrapper }) => {
  const { operatorData, socket } = useSocket();
  const [credentials, setCredentials] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  useEffect(() => {
    if (!operatorData) {
      setError("No operator data found");
    }
  }, [operatorData]);

  const handleChangePassword = () => {
    const { oldPassword, newPassword, confirmPassword } = credentials;
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    socket.emit(
      "changeOperatorPassword",
      {
        operatorID: operatorData.USER,
        oldPassword,
        newPassword,
      },
      (response) => {
        if (response.status === 200) {
          console.log("Password changed successfully");
        } else {
          setError(response.message || "Failed to change password");
        }
      }
    );
  };
  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              padding: 20,
              justifyContent: "flex-start",
            }}
            keyboardShouldPersistTaps="handled"
          >
            <CardWrapper>
              <Text style={{ fontSize: 20, marginBottom: 20 }}>
                Change Password
              </Text>

              {/* Old Password */}
              <Text style={{ marginBottom: 10 }}>Old Password:</Text>
              <TextInput
                placeholder="Enter old password"
                secureTextEntry
                style={inputStyle}
                onChangeText={(text) =>
                  setCredentials({ ...credentials, oldPassword: text })
                }
              />

              {/* New Password */}
              <Text style={{ marginBottom: 10 }}>New Password:</Text>
              <TextInput
                placeholder="Enter new password"
                secureTextEntry
                style={inputStyle}
                onChangeText={(text) =>
                  setCredentials({ ...credentials, newPassword: text })
                }
              />

              {/* Confirm Password */}
              <Text style={{ marginBottom: 10 }}>Confirm New Password:</Text>
              <TextInput
                placeholder="Confirm new password"
                secureTextEntry
                style={inputStyle}
                onChangeText={(text) =>
                  setCredentials({ ...credentials, confirmPassword: text })
                }
              />

              {/* Error Message */}
              {error ? (
                <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: "#2567ea",
                  padding: 15,
                  borderRadius: 5,
                  alignItems: "center",
                }}
                onPress={() => {
                  console.log("Change Password:", credentials);
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16 }}>
                  Change Password
                </Text>
              </TouchableOpacity>
            </CardWrapper>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </>
  );
};

const inputStyle = {
  width: "100%",
  padding: 10,
  backgroundColor: "#f0f0f0",
  borderRadius: 5,
  marginBottom: 10,
};

export default ChangePassword;
