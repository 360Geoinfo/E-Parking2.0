import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext"; // 👈 import useAuth at the top
import axios from "axios";
import WelcomeOperators from "./WelcomeOperators";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import CurrentlyParking from "../../components/CurrentlyParking";

dayjs.extend(duration);

export default function OperatorHomeScreen() {
  const navigation = useNavigation();

  const inputRef = useRef();
  const { user, token, zone, attendanceData, SERVER_API } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([
    {
      id: "1",
      username: "JohnDoe",
      plate: "ABC123",
      dateTime: dayjs("2025/06/01T10:30 AM").format("YYYY-MM-DD HH:mm:ss"),
      duration: 2,
      place: "Parking Lot A",
      zone: "A",
      payment: {
        id: "PAY123456",
        amount: "5.00 BND",
        status: "Paid",
      },
      petakStatus: "Active",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSearchInput = (text) => {
    const formattedText = text.replace(/\s+/g, " ").trim(); // Normalize spaces
    if (formattedText.length > 10) {
      alert("Plate number should not exceed 10 characters.");
      return;
    }
    setSearchQuery(formattedText.toUpperCase());
  };

  const fetchSearchResults = async (plate) => {
    setLoading(true);
    const delay = new Promise((res) => setTimeout(res, 500)); // minimum delay
    try {
      console.log(
        "🔍 [Search] Fetching results for plate:",
        plate,
        "In Zone ",
        zone
      );
      const responsePromise = await axios.post(
        `${SERVER_API}/outdoorparkingByPlate`,
        { plate, zone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(
        "📦 [Response] Search results:",
        JSON.stringify(responsePromise.data, null, 2)
      );

      if (responsePromise.status !== 200) {
        Alert.alert("Ralat", "Gagal mendapatkan data. Sila cuba lagi.", [
          { text: "OK" },
        ]);
        return;
      }
      const [response] = await Promise.all([responsePromise, delay]);
      console.log(
        "📦 [Response] Search results:",
        JSON.stringify(response.data, null, 2)
      );
      const filtered = response.data.filter((user) =>
        user.plate.toLowerCase().includes(plate.toLowerCase())
      );
      // Arranged by Petak Status: UNPAID, ACTIVE, EXPIRED, CANCELLED AND SUMMON and by ascending dateTime
      filtered.sort((a, b) => {
        const statusOrder = {
          Unpaid: 1,
          Active: 2,
          Expired: 3,
          Cancelled: 4,
          Summon: 5,
        };

        const statusA = statusOrder[a.petakStatus] || 999;
        const statusB = statusOrder[b.petakStatus] || 999;

        // First sort by petakStatus
        if (statusA !== statusB) {
          return statusA - statusB;
        }

        // Then sort by dateTime (ascending)
        const dateA = new Date(a.dateTime).getTime();
        const dateB = new Date(b.dateTime).getTime();
        return dateA - dateB;
      });
      // Log the filtered results
      console.log(
        "📦 [Response] Search results:",
        JSON.stringify(filtered, null, 2)
      );

      setFilteredUsers(filtered);
    } catch (error) {
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSearchResults(searchQuery.trim());
      } else {
        setFilteredUsers([]);
      }
    }, 1000); // 1000ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      if (searchQuery.trim()) {
        fetchSearchResults(searchQuery.trim());
      } else {
        setFilteredUsers([]);
      }
    }, [searchQuery])
  );

  return (
    <View style={styles.container}>
      {/* Title Section */}
      {/* <View style={styles.titleContainer}>
        <Text style={styles.title}>Carian Kenderaan</Text>
      </View> */}

      {/* Combined Section */}
      <View style={styles.combinedSection}>
        {attendanceData.zone &&
        attendanceData.clockin &&
        !attendanceData.clockout ? (
          <>
            {/* Search Bar Section */}
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchBar}
                placeholder="Search License Plate"
                value={searchQuery}
                onChangeText={handleSearchInput}
                ref={inputRef}
              />
            </View>

            {/* Buttons Section */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.buttonCari}
                onPress={() => fetchSearchResults(searchQuery.trim())}
              >
                <Text style={styles.buttonTextCari}>Cari</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonKamera}
                onPress={() => navigation.navigate("LPR Camera")}
              >
                <Icon
                  name="camera"
                  size={20}
                  color="#fff"
                  style={styles.icon}
                />
                <Text style={styles.buttonTextKamera}>Kamera</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailsContainer}>
              {!searchQuery ? (
                <Text style={{ textAlign: "center", marginTop: 20 }}>
                  SANTAI SAJA, MASIH NADA ORANG PARKING
                </Text>
              ) : loading ? (
                <View style={{ alignItems: "center", marginTop: 20 }}>
                  <ActivityIndicator size="large" color="#0B477B" />
                  <Text style={{ marginTop: 10 }}>Mencari Ilham...</Text>
                </View>
              ) : filteredUsers.length === 0 ? (
                <Text style={{ textAlign: "center", marginTop: 20 }}>
                  NADA BUUUIIII. SKIBIDDI BAP BAP
                </Text>
              ) : (
                // <>
                //   <Text style={{ textAlign: "center", marginTop: 20 }}>
                //     {filteredUsers.length} Kenderaan Ditemui
                //   </Text>
                // </>
                filteredUsers.map((parking) => (
                  <>
                    <CurrentlyParking
                      parking={parking}
                      key={`${parking.id}`}
                      setQuery={setSearchQuery}
                      refresh={() => fetchSearchResults(searchQuery.trim())}
                    />
                  </>
                ))
              )}
            </ScrollView>
          </>
        ) : (
          <WelcomeOperators />
        )}
      </View>
    </View>
  );
}

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

  combinedSection: {
    paddingHorizontal: 20,
    flex: 1,
    padding: 25,
    backgroundColor: "#F0F8FF",
  },

  searchBarContainer: {
    marginTop: 15,
    marginBottom: 10,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },

  detailsContainer: {
    marginBottom: 20,
  },

  infoContainer: {
    marginBottom: 20,
  },

  searchBar: {
    height: 40,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
  },

  buttonCari: {
    flex: 1, // Makes buttons take equal width
    backgroundColor: "#F8D07A",
    paddingVertical: 10,
    marginHorizontal: 10, // Space between the buttons
    borderRadius: 5,
    alignItems: "center", // Center the text horizontally
    justifyContent: "center", // Center the text vertically
  },

  buttonTextCari: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },

  buttonKamera: {
    flex: 1, // Makes buttons take equal width
    flexDirection: "row", // Aligns the icon and text horizontally
    alignItems: "center",
    backgroundColor: "#0B477B",
    paddingVertical: 10,
    marginHorizontal: 10, // Space between the buttons
    borderRadius: 5,
    alignItems: "center", // Center the text horizontally
    justifyContent: "center", // Center the text vertically
  },

  icon: {
    marginRight: 10, // Adds space between the icon and text
  },

  buttonTextKamera: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  infoIcon: {
    width: 20, // ensures all icons align vertically
    marginRight: 8,
  },

  infoText: {
    fontSize: 14,
    color: "#000",
    flexShrink: 1,
  },

  card: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    padding: 10,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  plateText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  statusText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  cardBody: {
    paddingLeft: 5,
  },

  cardRow: {
    fontSize: 14,
    marginBottom: 4,
  },

  summonButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },

  summonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
