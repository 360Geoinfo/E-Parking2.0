import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const SignUpScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toggleOperator, setToggleOperator] = useState(false);
  const { SERVER_API } = useAuth();

  const handleSignUp = async () => {
    console.log("📥 [handleSignUp] Starting registration process");

    // Validation: Empty fields
    if (!username || !phonenumber || !email || !password || !confirmPassword) {
      console.log("❌ [Validation] Missing required fields:", {
        username,
        phonenumber,
        email,
        password,
        confirmPassword,
      });
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    // Validation: Password match
    if (password !== confirmPassword) {
      console.log("❌ [Validation] Passwords do not match:", {
        password,
        confirmPassword,
      });
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      // Preparing POST request
      console.log("📤 [Request] Sending POST request to:", SERVER_API);
      const requestData = {
        username,
        phonenumber,
        email,
        password,
        isOperator: toggleOperator, // Include operator status
      };
      console.log("📦 [Request] Payload:", requestData);

      // Perform API call
      const response = await axios.post(`${SERVER_API}/register`, requestData);

      // Extract response data
      const { token, message } = response.data;
      console.log("✅ [Response] Registration successful. Message:", message);
      console.log("🔑 [Response] Received token:", token);

      // Store user data in AsyncStorage one by one with logs
      await AsyncStorage.setItem("token", token);
      console.log("✅ [Storage] Token saved:", token);

      await AsyncStorage.setItem("username", username);
      console.log("✅ [Storage] Username saved:", username);

      await AsyncStorage.setItem("phonenumber", phonenumber);
      console.log("✅ [Storage] Phone number saved:", phonenumber);

      await AsyncStorage.setItem("email", email);
      console.log("✅ [Storage] Email saved:", email);

      await AsyncStorage.setItem("password", password); // ⚠️ Only for dev/debug
      console.log(
        "✅ [Storage] Password saved (⚠️ insecure for production):",
        password
      );

      console.log(
        "💾 [Storage] All user details successfully stored in AsyncStorage"
      );

      // Navigate on success
      Alert.alert("Success", message, [
        {
          text: "OK",
          onPress: () => {
            console.log("📲 [Navigation] Redirecting to Login screen");
            navigation.navigate(toggleOperator ? "Login" : "OTP");
          },
        },
      ]);
    } catch (err) {
      console.log("❌ [Error] Registration failed");
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      console.log("🔍 [Error Details]", {
        status: err.response?.status,
        data: err.response?.data,
        message: errorMessage,
      });
      Alert.alert("Error", errorMessage);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Daftar Akaun</Text>
        <Text style={styles.label}>
          Setiap pendaftaran e-mel baharu yang berjaya akan diberikan 1 petak
          percuma.
        </Text>

        <TouchableOpacity onPress={() => setToggleOperator(!toggleOperator)}>
          <Text style={styles.label}>
            {toggleOperator ? "Tutup" : "Buka"} Pendaftaran Pengendali
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          style={styles.input}
          placeholder="Nombor Telefon"
          value={phonenumber}
          onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ""))}
          keyboardType="phone-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="E-mel"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Kata Laluan"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Pengesahan Kata Laluan"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Text style={styles.terms}>
          Dengan meneruskan pendaftaran akaun, anda bersetuju dengan Terma dan
          Syarat Privasi.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Daftar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace("Login")}>
          <Text style={styles.loginText}>Sudah ada akaun? Log Masuk</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#d5f5ff",
    padding: 20,
    paddingTop: 80,
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0B477B",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0B477B",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  terms: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0B477B",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0B477B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginText: {
    color: "#0B477B",
    textAlign: "center",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default SignUpScreen;
