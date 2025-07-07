import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as LocalAuthentication from "expo-local-authentication";

const LoginScreen = ({ navigation }) => {
  useEffect(() => {
    const loadStoredCredentials = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        const storedPassword = await AsyncStorage.getItem("password");

        if (storedUsername) {
          handleUsernameChange(storedUsername); // triggers operator toggle logic
          setPassword(storedPassword || ""); // directly set password
        }
      } catch (error) {
        console.error("Error loading stored credentials:", error);
      }
    };

    loadStoredCredentials();
  }, []);

  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);

  const handleUsernameChange = (text) => {
    const lowered = text.toLowerCase();
    setUsername(text);
  };

  const handleLogin = async () => {
    console.log("[Login] Login button pressed");

    if (!username || !password) {
      console.log("[Login] Missing username or password");
      Alert.alert("Missing Fields", "Please enter both username and password.");
      return;
    }

    try {
      console.log("[Login] Sending login request with:", {
        username,
        password,
      });

      await axios
        .post("http://192.168.102.55:3001/login", {
          username,
          password,
        })
        .then(async (res) => {
          console.log("[Login] Response received:", res.data);

          const {
            userID,
            username: resUsername,
            message,
            role,
            token,
          } = res.data;

          // Save everything in AsyncStorage
          await AsyncStorage.setItem("userID", userID);
          console.log("[AsyncStorage] userID saved:", userID);

          await AsyncStorage.setItem("username", resUsername);
          console.log("[AsyncStorage] username saved:", resUsername);

          await AsyncStorage.setItem("token", token);
          console.log("[AsyncStorage] token saved:", token);

          await AsyncStorage.setItem("password", password);
          console.log("[AsyncStorage] password saved");

          // Save full object if needed (optional)
          await AsyncStorage.setItem("userData", JSON.stringify(res.data));
          console.log("[AsyncStorage] full userData saved");

          login(role, { userID, username, role, token });
          console.log("[Login] Context login triggered");

          Alert.alert("Success", message, [
            {
              text: "OK",
            },
          ]);
        });
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Login failed";
      console.log("[Login] Error during login:", errorMessage);
      Alert.alert("Login Failed", errorMessage);
    }
  };

  const togglePasswordVisibility = () => setSecureText(!secureText);

  const handleFingerprintLogin = async () => {
    console.log("[Fingerprint] Login attempt");

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      console.log("[Fingerprint] Hardware available:", hasHardware);

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      console.log("[Fingerprint] Fingerprint enrolled:", isEnrolled);

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Unavailable",
          "Fingerprint authentication is not available."
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate with fingerprint",
      });

      console.log("[Fingerprint] Authentication result:", result);

      if (!result.success) {
        console.log("[Fingerprint] Authentication failed");
        Alert.alert("Failed", "Fingerprint authentication failed.");
        return;
      }

      // Load stored credentials
      const storedUsername = await AsyncStorage.getItem("username");
      const storedPassword = await AsyncStorage.getItem("password");

      console.log("[AsyncStorage] Retrieved username:", storedUsername);
      console.log(
        "[AsyncStorage] Retrieved password:",
        storedPassword ? "••••••••" : "Not found"
      );

      if (!storedUsername || !storedPassword) {
        Alert.alert("Error", "No saved login credentials found.");
        return;
      }

      console.log(
        "[Fingerprint] Authenticated. Logging in with stored credentials"
      );

      const response = await axios.post("http://192.168.102.55:3001/login", {
        username: storedUsername,
        password: storedPassword,
      });

      console.log("[Fingerprint] Login response:", response.data);

      const { token, message, userID, username: resUsername } = response.data;

      const isOperatorUser = storedUsername.toLowerCase().includes("operator");
      const role = isOperatorUser ? "operator" : "customer";
      console.log("[Fingerprint] User role:", role);

      // Store all relevant values in AsyncStorage
      await AsyncStorage.setItem("token", token);
      console.log("[AsyncStorage] Token saved:", token);

      await AsyncStorage.setItem("userID", userID);
      console.log("[AsyncStorage] UserID saved:", userID);

      await AsyncStorage.setItem("username", resUsername);
      console.log("[AsyncStorage] Username saved:", resUsername);

      await AsyncStorage.setItem("password", storedPassword);
      console.log("[AsyncStorage] Password saved");

      await AsyncStorage.setItem("userData", JSON.stringify(response.data));
      console.log("[AsyncStorage] Full userData saved");

      login(role, { username: resUsername });
      console.log("[Fingerprint] Context login triggered");

      Alert.alert("Success", message, [
        {
          text: "OK",
          onPress: () => {
            console.log("[Fingerprint] Navigating to CustomerTabs -> Home");
            navigation.replace("CustomerTabs", { screen: "Home" });
          },
        },
      ]);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || err.message || "Login failed";
      console.error("[Fingerprint] Login error:", errorMessage);
      Alert.alert("Login Failed", errorMessage);
    }
  };

  const handleFaceRecognitionLogin = () => {
    console.log("Face recognition login pressed");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require("../assets/b984c4dcf6e3893d59d7027b6c4d05c02525baad.png")}
        style={styles.Logoimage}
      />

      <TextInput
        style={styles.input}
        value={username}
        onChangeText={handleUsernameChange}
        placeholder="Enter username"
        placeholderTextColor="#aaa"
        autoCapitalize="none"
      />

      <View style={styles.inputContainerpassword}>
        <TextInput
          style={styles.inputpassword}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          placeholderTextColor="#aaa"
          secureTextEntry={secureText}
        />
        <TouchableOpacity
          style={styles.eyeIconpassword}
          onPress={togglePasswordVisibility}
        >
          <Ionicons
            name={secureText ? "eye-off" : "eye"}
            size={24}
            color="#aaa"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.forgetpasswordlable}>Forgot Your Password?</Text>

      <View style={styles.iconRow}>
        <TouchableOpacity style={styles.flexButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleFingerprintLogin}
          style={styles.iconButton}
        >
          <MaterialCommunityIcons name="fingerprint" size={40} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleFaceRecognitionLogin}
          style={styles.iconButton}
        >
          <Ionicons name="scan" size={40} color="black" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.replace("SignUp")}>
        <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace("OTP")}>
        <Text style={styles.signUpText}>I have an OTP Code</Text>
      </TouchableOpacity>

      <View style={styles.hubungisokongancard}>
        <Ionicons
          name="call"
          size={40}
          color="#0B477B"
          style={styles.hubungisokonganicon}
        />
        <Text style={styles.hubungisokongantext}>Hubungi Sokongan</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#d5f5ff",
    padding: 20,
  },
  Logoimage: {
    width: "80%",
    height: 180,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#000",
  },
  inputContainerpassword: {
    position: "relative",
    marginBottom: 15,
  },
  inputpassword: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    color: "#000",
    paddingRight: 45,
  },
  eyeIconpassword: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2e7d32",
  },
  forgetpasswordlable: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0B477B",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpText: {
    color: "#0B477B",
    textAlign: "center",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  hubungisokongancard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    width: "100%",
    alignSelf: "center",
    borderRadius: 10,
    marginTop: 80,
  },
  hubungisokonganicon: {
    marginRight: 15,
  },
  hubungisokongantext: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 20,
  },
  iconButton: {
    padding: 10,
    marginBottom: 10,
  },
  flexButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#0B477B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
});

export default LoginScreen;
