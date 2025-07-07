import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Attendance from "../../components/Attendance";
import ZoneSelection from "../../components/ZoneSelection";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingScreen = () => {
  const {
    logout,
    token,
    user,
    setAttendanceData,
    zone,
    setUserZone,
    SERVER_API,
  } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    console.log("Token before Logging Out:", token);
    const lastToken = token || (await AsyncStorage.getItem("token"));
    console.log("Last token used for logout:", lastToken);

    console.log("User logged out");
    // Replace with your actual API endpoint for logout
    const response = await axios.post(
      `${SERVER_API}/logout`,
      {
        role: "operator",
      },
      {
        headers: {
          Authorization: `Bearer ${lastToken}`,
        },
      }
    ); // Adjust the endpoint as needed

    if (response.status === 200) {
      logout(); // adjust to your login route name
    } else {
      console.error("Logout failed", response.data);
    }
  };

  const links = [
    {
      title: "Akaun",
      icon: require("../../assets/Akaun.png"),
      backgroundColor: "#0B477B",
      screen: "Keterangan Diri",
    },
    {
      title: "Sejarah Transaksi",
      icon: require("../../assets/Sejarah Transaksi.png"),
      backgroundColor: "#A22E3B",
      screen: "Sejarah Transaksi",
    },
    {
      title: "Saman Dikeluarkan",
      icon: require("../../assets/Saman Dikeluarkan.png"),
      backgroundColor: "#FCB22D",
      screen: "Saman Dikeluarkan",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* <View style={styles.titleContainer}>
        <Text style={styles.title}>Akaun</Text>
      </View> */}

      <View style={styles.mainSection}>
        <View style={styles.profileContainer}>
          <FontAwesome name="user-circle" size={60} color="#0B477B" />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.username}</Text>
            <Text style={styles.profileId}>UID {user.userID}</Text>
          </View>
        </View>

        <View style={styles.AttendanceCard}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>Attendance</Text>
          {!zone ? (
            <>
              <ZoneSelection
                setZone={(selectedZone) => {
                  setUserZone(selectedZone); // update context
                  setAttendanceData((prevData) => ({
                    ...prevData,
                    zone: selectedZone,
                  }));
                }}
              />
            </>
          ) : (
            <>
              <Attendance
                onClockIn={() => navigation.navigate("Carian Kenderaan")}
                onClockOut={() => navigation.navigate("Carian Kenderaan")}
              />
            </>
          )}
        </View>

        {/* <SettingsMenu navigation={navigation} /> */}

        <View style={styles.sectionContainer}>
          {links.map((link, index) => {
            // Add borderTop to all except the first, borderBottom to all except the last
            const separatorStyle = {};
            if (index !== 0) separatorStyle.borderTopWidth = 1;
            if (index !== links.length - 1)
              separatorStyle.borderBottomWidth = 1;
            if (index !== 0) separatorStyle.borderTopColor = "#eee";
            if (index !== links.length - 1)
              separatorStyle.borderBottomColor = "#eee";
            return (
              <TouchableOpacity
                key={index}
                style={[styles.row, separatorStyle]}
                onPress={() => navigation.navigate(link.screen)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: link.backgroundColor },
                  ]}
                >
                  <Image source={link.icon} style={styles.rowIcon} />
                </View>
                <Text style={styles.rowText}>{link.title}</Text>
                <Ionicons
                  name="chevron-forward-outline"
                  size={20}
                  color="#555"
                  style={styles.arrowIcon}
                />
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={[styles.logoutButton]} onPress={handleLogout}>
          <Text style={[styles.logoutButtonText]}>Log Keluar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B477B",
  },

  titleContainer: {
    padding: 20,
    marginBottom: 0, // No space at the bottom
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
    color: "#ffffff", // Change text color to white
  },

  mainSection: {
    flex: 1,
    padding: 25,
    backgroundColor: "#F0F8FF",
    shadowColor: "#000", // Adds a subtle shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // For Android shadow effect
    gap: 15, // Space between items
  },

  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    gap: 10,
  },

  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2e7d32",
  },

  profileId: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 4,
  },
  sectionContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 4,
    elevation: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#fff", // or your preferred base
  },

  iconContainer: {
    padding: 10,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  rowIcon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },

  rowText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },

  arrowIcon: {
    marginLeft: 10,
  },

  expandedContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#f9f9f9",
  },

  detailText: {
    fontSize: 14,
    color: "#555",
    paddingVertical: 4,
  },
  logoutButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A22E3B",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  AttendanceCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: "center",
    gap: 10,
  },
});
