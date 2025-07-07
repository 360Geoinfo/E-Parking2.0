import { useSocket } from "@/context/socket";
import { MaterialIcons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  Alert,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen({ setShowResetPassword }) {
  const { login } = useSocket();
  const [credentials, setCredentials] = useState({
    user: "",
    password: "",
  });
  const getStoredCredentials = async () => {
    try {
      const raw = await SecureStore.getItemAsync("credentials");
      if (raw) {
        return JSON.parse(raw); // should contain { username, password }
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const handleLogin = async () => {
    if (credentials.user && credentials.password) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(credentials.user)) {
        login({
          username: credentials.user,
          password: credentials.password,
        });
      } else {
        login({
          email: credentials.user,
          password: credentials.password,
        });
      }
    } else {
      alert("Please enter both email and password.");
    }
  };
  const handleBiometricLogin = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const supportedTypes =
      await LocalAuthentication.supportedAuthenticationTypesAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || supportedTypes.length === 0 || !isEnrolled) {
      Alert.alert(
        "Biometric Error",
        "Biometric authentication is not available."
      );
      6;
      return;
    }

    const isIOS = Platform.OS === "ios";
    const isAndroid = Platform.OS === "android";

    // Biometric Type Constants (Android returns both)
    const BIOMETRIC_TYPE = LocalAuthentication.AuthenticationType;
    const hasFace = supportedTypes.includes(BIOMETRIC_TYPE.FACIAL_RECOGNITION);
    const hasFingerprint = supportedTypes.includes(BIOMETRIC_TYPE.FINGERPRINT);

    // iOS: Face ID only
    if (isIOS && !hasFace) {
      Alert.alert(
        "Face ID Not Available",
        "Your device does not support Face ID."
      );
      return;
    }

    // Android: Prioritize face, fallback to fingerprint
    if (isAndroid && !hasFace && !hasFingerprint) {
      Alert.alert("Biometric Error", "No supported biometric types available.");
      return;
    }

    // Authenticate
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: hasFace
        ? "Login with Face Recognition"
        : "Login with Fingerprint",
      fallbackLabel: hasFingerprint ? "Use Fingerprint" : "Enter Password",
      cancelLabel: "Cancel",
      disableDeviceFallback: false, // disables fallback to pin/pattern (Android)
    });

    if (result.success) {
      const creds = await getStoredCredentials();

      if (creds?.username && creds?.password) {
        login({
          username: creds.username,
          password: creds.password,
        });
      } else {
        Alert.alert("Missing Credentials", "Please login manually first.");
      }
    } else {
      Alert.alert(
        "Auth Failed",
        result.error || "Biometric authentication failed."
      );
    }
  };

  const handleCredentialsChange = (field, value) => {
    setCredentials((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  return (
    <View
      style={{
        width: "100%",
        gap: 12,
      }}
    >
      <TextInput
        placeholder="Email or Username"
        style={{
          width: 300,
          marginBottom: 12,
          backgroundColor: "#f0f0f0",
          padding: 10,
          borderRadius: 5,
          fontSize: 20,
        }}
        keyboardType="email-address"
        placeholderTextColor={"#888"}
        onChangeText={(text) => handleCredentialsChange("user", text)}
      />
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
          onPress={handleLogin}
        >
          <Text
            style={{
              color: "#ffffff",
              fontSize: 20,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Login
          </Text>
        </TouchableOpacity>
        {!["ios", "web"].includes(Platform.OS) && (
          <TouchableOpacity
            style={{
              backgroundColor: "#f0f0f0",
              borderRadius: 5,
              alignItems: "center",
              justifyContent: "center",
              width: 50,
              height: 50,
            }}
            onPress={handleBiometricLogin}
          >
            {/* FingerPrint */}
            <MaterialIcons name="fingerprint" size={30} color="#2567ea" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={{
            backgroundColor: "#f0f0f0",
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
            width: 50,
            height: 50,
          }}
          onPress={handleBiometricLogin}
        >
          {/* Face */}
          <MaterialIcons name="tag-faces" size={30} color="#2567ea" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={{ alignItems: "flex-start", marginLeft: 10 }}
        onPress={() =>
          Alert.alert(
            "Reset Password",
            "You Will be redirected to the reset password screen shortly.",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "OK",
                onPress: () => {
                  setTimeout(() => {
                    setShowResetPassword(true);
                  }, 1500); // 1.5 sec delay before redirect
                },
              },
            ]
          )
        }
      >
        <Text style={{ color: "#2567ea", fontSize: 16 }}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
}
