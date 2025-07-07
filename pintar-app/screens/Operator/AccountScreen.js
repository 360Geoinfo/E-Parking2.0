import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "react-native-vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const AccountScreen = () => {
  const { user, SERVER_API } = useAuth();
  const navigation = useNavigation();

  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [section, setSection] = useState("account"); // account | password
  const [emailInput, setEmailInput] = useState("");

  const fetchAccount = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${SERVER_API}/operatorAccount`, {
        operatorId: user.userID,
      });

      if (response.status === 200) {
        setUserData(response.data);
        setCredentials({
          currentPassword: response.data.password || "",
          newPassword: "",
          confirmPassword: "",
        });
        setEmailInput(response.data.email || "");
      } else {
        console.error("Failed to fetch account data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching account data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFirstTimeUpdatePassword = async () => {
    const { newPassword, confirmPassword } = credentials;

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirm password do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${SERVER_API}/updateOperatorPassword`,
        {
          operatorId: user.userID,
          newPassword: newPassword,
        }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Password updated successfully.");
        setUserData((prevData) => ({
          ...prevData,
          password: newPassword,
          firstTime: 0,
        }));
        setCredentials({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to update password."
        );
      }
    } catch (error) {
      console.error("Error updating password:", error);
      Alert.alert(
        "Error",
        error.response?.data.message || "Failed to update password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${SERVER_API}/updateOperatorEmail`, {
        operatorId: user.userID,
        newEmail: email,
      });

      if (response.status === 200) {
        Alert.alert("Success", "Email updated successfully.");
        setUserData((prev) => ({ ...prev, email }));
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to update email."
        );
      }
    } catch (error) {
      console.error("Email update error:", error);
      Alert.alert(
        "Error",
        error.response?.data.message || "Error updating email."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderAccountSection = () => {
    const isFirstTime = userData.firstTime !== 0;

    return (
      <View style={styles.detailSection}>
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.label}>Operator ID:</Text>
          <TextInput
            style={styles.input}
            value={userData?.operatorId || user?.userID || "N/A"}
            editable={false}
          />
          <Text style={styles.label}>Username:</Text>
          <TextInput
            style={styles.input}
            value={userData?.username || "N/A"}
            editable={false}
          />
        </View>
        {isFirstTime && (
          <Text style={styles.label}>
            Please update your password to continue:
          </Text>
        )}

        {!userData?.password && (
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            secureTextEntry={true}
            value={credentials.currentPassword}
            onChangeText={(text) =>
              setCredentials((prev) => ({ ...prev, currentPassword: text }))
            }
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry={true}
          value={credentials.newPassword}
          onChangeText={(text) =>
            setCredentials((prev) => ({ ...prev, newPassword: text }))
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          secureTextEntry={true}
          value={credentials.confirmPassword}
          onChangeText={(text) =>
            setCredentials((prev) => ({ ...prev, confirmPassword: text }))
          }
        />

        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleFirstTimeUpdatePassword}
        >
          <Text style={styles.updateButtonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmailSection = () => (
    <View style={styles.detailSection}>
      <Text style={styles.label}>Email Address:</Text>
      <TextInput
        style={styles.input}
        value={emailInput}
        onChangeText={setEmailInput}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateEmail}>
        <Text style={styles.updateButtonText}>Update Email</Text>
      </TouchableOpacity>
    </View>
  );

  const sections = {
    account: renderAccountSection(),
    password: (
      <View style={styles.detailSection}>
        <Text style={styles.label}>Operator Phone:</Text>
        <TextInput
          style={styles.input}
          value={userData?.phone || ""}
          editable={false}
        />
      </View>
    ),
    email: renderEmailSection(),
  };

  useEffect(() => {
    fetchAccount();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchAccount();
    }, [])
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View style={styles.backgroundSection}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              style={styles.redesignedBackButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#0B477B" />
              <Text style={styles.redesignedBackText}>Back</Text>
            </TouchableOpacity>
          </View>

          {/* Toggle Tabs */}
          <View style={styles.tabRow}>
            {["account", "password", "email"].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => setSection(item)}
                style={[styles.tabButton, section === item && styles.activeTab]}
              >
                <Text
                  style={[
                    styles.tabText,
                    section === item && styles.activeTabText,
                  ]}
                >
                  {item === "account"
                    ? "Account"
                    : item === "password"
                    ? "Phone Info"
                    : "Email Info"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.combinedSection}>{sections[section]}</View>
        </View>
      )}
    </View>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8FF",
    padding: 20,
  },
  backgroundSection: {
    flex: 1,
    padding: 25,
    backgroundColor: "#F0F8FF",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  combinedSection: {
    paddingVertical: 25,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderColor: "#E6E6E6",
  },
  detailSection: {
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 15,
    fontSize: 16,
    color: "#666",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  backButtonContainer: { alignItems: "flex-start", marginBottom: 20 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderColor: "#E6E6E6",
    borderWidth: 1,
  },
  backText: { marginLeft: 5, fontWeight: "bold", fontSize: 16 },
  updateButton: {
    backgroundColor: "#0B477B",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tabRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  activeTab: {
    backgroundColor: "#0B477B",
  },
  tabText: {
    color: "#333",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  backButtonContainer: {
    alignItems: "flex-start",
    marginBottom: 20,
  },

  redesignedBackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF4FC",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  redesignedBackText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#0B477B",
    fontWeight: "600",
  },
});
