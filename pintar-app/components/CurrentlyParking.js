import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const statusColorCode = {
  Active: { border: "#16A34A", bg: "#F0FDF4", text: "#16A34A" },
  Expired: { border: "#9A39BA", bg: "#FEE2E2", text: "#DC2626" },
  Unpaid: { border: "#FFBB00", bg: "#FEF3C7", text: "#DC2626" },
  Exit: { border: "#8C8C8C", bg: "#F5F5F5", text: "#AFAFAF" },
  Summon: { border: "#DC2626", bg: "#FEE2E2", text: "#DC2626" },
  Cancelled: { border: "#8C8C8C", bg: "#F5F5F5", text: "#AFAFAF" },
};

const CurrentlyParking = ({ parking, setQuery, refresh }) => {
  const navigation = useNavigation(); // Assuming useNavigation is imported from react-navigation
  const { user, token, SERVER_API } = useAuth(); // Assuming useAuth is imported from context
  const [timeLeftMap, setTimeLeftMap] = useState(null);
  const [timeLeftLabel, setTimeLeftLabel] = useState(null);

  const renderStatus = (status) => {
    switch (status) {
      case "Active":
        return "Aktif";
      case "Expired":
        return "Tamat Tempoh";
      case "Unpaid":
        return "Belum Membuat Pembayaran";
      case "Exit":
        return "Sudah Keluar";
      case "Summon":
        return "Saman Telah Dikeluarkan";
      case "Cancelled":
        return "Dibatalkan";
      default:
        return status;
    }
  };

  handleReset = async () => {
    setQuery();
  };

  const renderButtons = (status) => {
    switch (status) {
      case "Active":
        return (
          <>
            <TouchableOpacity
              style={styles.exitButton}
              onPress={() => handleExitCar(parking)}
            >
              <Text style={styles.exitText}>Sudah Keluar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewReceiptButton}
              onPress={() =>
                navigation.navigate("OperatorTabs", {
                  screen: "Pembayaran",
                  params: {
                    screen: "Transaction Status",
                    params: {
                      parking: {
                        parkingID: parking.id,
                        vehicleID: parking.vehicleID,
                        plate: parking.plate,
                        dateTime: parking.dateTime,
                        duration: parking.duration,
                        place: parking.place,
                        zone: parking.zone,
                        petakStatus: parking.petakStatus,
                      },
                      payment: parking.payment,
                    },
                  },
                })
              }
            >
              <Text style={styles.viewReceiptText}>Lihat Resit</Text>
            </TouchableOpacity>
          </>
        );
      case "Expired":
        return (
          <>
            <TouchableOpacity
              style={styles.exitButton}
              onPress={() => handleExitCar(parking)}
            >
              <Text style={styles.exitText}>Sudah Keluar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.summonButton}
              onPress={() => handleFineClick(parking)}
            >
              <Text style={styles.summonText}>Keluarkan Saman</Text>
            </TouchableOpacity>
          </>
        );
      case "Unpaid":
        return (
          <>
            <TouchableOpacity
              style={styles.makePaymentButton}
              onPress={() =>
                navigation.navigate("OperatorTabs", {
                  screen: "Pembayaran",
                  params: {
                    screen: "Resit Pembayaran",
                    params: {
                      parkingID: parking.id,
                      vehicleID: parking.vehicleID,
                    },
                  },
                })
              }
            >
              <Text style={styles.makePaymentText}>Buat Pembayaran</Text>
            </TouchableOpacity>
          </>
        );
      case "Exit":
        return (
          <>
            <TouchableOpacity
              style={styles.viewReceiptButton}
              onPress={() =>
                navigation.navigate("OperatorTabs", {
                  screen: "Pembayaran",
                  params: {
                    screen: "Resit Pembayaran",
                    params: {
                      parkingID: parking.id,
                      vehicleID: parking.vehicleID,
                    },
                  },
                })
              }
            >
              <Text style={styles.viewReceiptText}>Lihat Resit</Text>
            </TouchableOpacity>
          </>
        );
      case "Summon":
        return <></>;
      case "Cancelled":
        return (
          <>
            <TouchableOpacity
              style={styles.viewReceiptButton}
              onPress={() =>
                navigation.navigate("OperatorTabs", {
                  screen: "Pembayaran",
                  params: {
                    screen: "Resit Pembayaran",
                    params: {
                      parkingID: parking.id,
                      vehicleID: parking.vehicleID,
                    },
                  },
                })
              }
            >
              <Text style={styles.viewReceiptText}>Lihat Resit</Text>
            </TouchableOpacity>
          </>
        );
      default:
        return <></>;
    }
  };

  const handleExitCar = async (parking) => {
    // Handle exit car logic here
    console.log("Car exited for parking:", parking);

    try {
      const response = await axios.post(
        `${SERVER_API}/exitOutdoorParkingByOperator`,
        { operatorID: user.userID, outdoorID: parking.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status !== 200) {
        Alert.alert("Ralat", "Gagal mengeluarkan kenderaan. Sila cuba lagi.", [
          { text: "OK" },
        ]);
      } else {
        Alert.alert("Berjaya", "Kenderaan telah dikeluarkan.", [
          {
            text: "OK",
            onPress: () => refresh(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error handling exit car:", error);
      Alert.alert("Error", "Failed to exit car. Please try again.");
    }
  };

  const handleFineClick = async (parking) => {
    console.log("Fine issued for parking:", parking);
    try {
      const response = await axios.post(`${SERVER_API}/fineOutdoorParking`, {
        operatorId: user.userID,
        outdoorId: parking.id,
      });
      if (response.status === 201) {
        Alert.alert("Success", "Fine issued successfully.", [
          { text: "OK", onPress: () => refresh() },
        ]);
      } else {
        Alert.alert("Error", "Failed to issue fine. Please try again.");
      }
    } catch (error) {
      console.error("Error issuing fine:", error.message);
      Alert.alert("Error", "Failed to issue fine. Please try again.");
    }
  };

  useEffect(() => {
    if (!["Exit", "Summon", "Cancelled"].includes(parking.petakStatus)) {
      const interval = setInterval(() => {
        const now = dayjs();
        const end = dayjs(parking.dateTime)
          .add(parking.duration, "hour")
          .add(10, "minute"); // Adding 10 minutes buffer
        const diff = end.diff(now);

        const durationObj = dayjs.duration(diff);
        const hours =
          Math.floor(durationObj.asHours()) < 0
            ? -1 * Math.floor(durationObj.asHours())
            : Math.floor(durationObj.asHours());
        const minutes =
          durationObj.minutes() < 0
            ? -1 * durationObj.minutes()
            : durationObj.minutes();
        const seconds =
          durationObj.seconds() < 0
            ? -1 * durationObj.seconds()
            : durationObj.seconds();

        setTimeLeftMap(`${hours}h ${minutes}m ${seconds}s`);
        setTimeLeftLabel(
          durationObj.seconds() < 0 ? "Masa Lebih" : "Baki Masa"
        );
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeftMap(
        dayjs(parking.endTime).format("h:mm A, dddd, DD MMMM YYYY")
      );
      setTimeLeftLabel("Masa Tamat");
    }
  }, [parking]);

  return (
    <View
      key={parking.id}
      style={[
        styles.card,
        {
          borderColor: statusColorCode[parking.petakStatus]?.border || "#000",
          backgroundColor: statusColorCode[parking.petakStatus]?.bg || "#fff",
        },
      ]}
    >
      {/* <Text>{JSON.stringify(parking, null, 2)}</Text> */}
      <View style={styles.cardHeader}>
        <Text style={styles.plateText}>{parking.plate}</Text>
        <Text
          style={[
            styles.statusText,
            {
              color: statusColorCode[parking.petakStatus]?.text || "#000",
            },
          ]}
        >
          {renderStatus(parking.petakStatus)}
        </Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Icon name="calendar" size={16} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Masa Mula{" "}
            {dayjs(parking.dateTime).format("h:mm A, dddd, DD MMMM YYYY")}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="clock-o" size={16} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            {timeLeftLabel}: {timeLeftMap || "Calculating..."}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="map-marker" size={16} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Zone {parking.zone} ({parking.place})
          </Text>
        </View>
        <View style={styles.buttonsRow}>
          {renderButtons(parking.petakStatus)}
        </View>
      </View>
    </View>
  );
};

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
    width: "100%", // Ensures the row takes full width
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 10,
    width: "100%", // Ensures the row takes full width
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
    flex: 1,
    width: "100%",
    flexGrow: 1,
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
    flexGrow: 1, // Allows the button to take available space
  },
  summonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  exitButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
    flexGrow: 1, // Allows the button to take available space
  },
  exitText: {
    color: "#fff",
    fontWeight: "bold",
  },
  viewReceiptButton: {
    backgroundColor: "#0B477B",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
    flexGrow: 1, // Allows the button to take available space
  },
  viewReceiptText: {
    color: "#fff",
    fontWeight: "bold",
  },
  makePaymentButton: {
    backgroundColor: "#F8D07A",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
    flexGrow: 1, // Allows the button to take available space
  },
  makePaymentText: {
    color: "#000",
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
    flexGrow: 1, // Allows the button to take available space
  },
});

export default CurrentlyParking;
