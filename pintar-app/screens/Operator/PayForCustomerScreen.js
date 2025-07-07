import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import * as Print from "expo-print";
import dayjs from "dayjs";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const costs = {
  1: "5.00 BND",
  2: "10.00 BND",
  3: "15.00 BND",
  4: "20.00 BND",
};

const PayForCustomerScreen = () => {
  const { user, attendanceData, zone, SERVER_API, token } = useAuth();
  const [details, setDetails] = useState({
    plateNumber: "",
    vehicleType: "",
    carModel: "",
    carColor: "",
    startDateTime: dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss").toString(),
    duration: "",
    zone: zone,
    vehicleId: null,
    parkingId: null,
  });
  const navigation = useNavigation();

  const handleSubmit = async () => {
    const response = await axios.post(
      `${SERVER_API}/addnewvehicle`,
      {
        PlateLicense: details.plateNumber,
        VehicleTypes: details.vehicleType,
        VehicleModel: details.carModel,
        VehicleColor: details.carColor,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    switch (response.status) {
      case 201:
        console.log("Response Status:", response.status);
        details.vehicleId = response.data.vehicleID; // Assuming the response contains vehicleID
        const response2 = await axios.post(
          `${SERVER_API}/outdoorparking`,
          {
            userID: "MANUAL",
            Vehicleid: details.vehicleId,
            PlatLicense: details.plateNumber,
            Duration: details.duration,
            location: "ZON " + details.zone,
            zone: details.zone,
            IDTransaction: null, // Assuming no transaction ID for manual entry
            operatorID: user.userID,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response2.status === 201) {
          details.parkingId = response2.data.parkingID; // Assuming the response contains parkingID
          console.log("Outdoor parking inserted successfully:", response2.data);
          Alert.alert("Berjaya", "Nombor plat berjaya didaftarkan.", [
            {
              text: "OK",
              onPress: () => navigation.navigate("Resit Pembayaran", { parkingID: details.parkingId, vehicleID: details.vehicleId }),
            }, // Call print function
          ]);
        }
        break;
      case 409:
        console.error("Failed to insert plate license:", response.status);
        Alert.alert("Ralat", "Gagal memasukkan nombor plat. Sila cuba lagi.", [
          { text: "OK" },
        ]);
        return null;
      default:
        console.error("Unexpected response status:", response.status);
        Alert.alert(
          "Ralat",
          "Terdapat ralat semasa memasukkan nombor plat. Sila cuba lagi.",
          [{ text: "OK" }]
        );
        return null;
    }
  };

  const handlePrint = async () => {
    const htmlContent = `
      <html>
        <body>
          <h1>Receipt</h1>
          <p><strong>Plate Number:</strong> ${details.plateNumber}</p>
          <p><strong>Vehicle Type:</strong> ${details.vehicleType}</p>
          <p><strong>Model:</strong> ${details.carModel}</p>
          <p><strong>Color:</strong> ${details.carColor}</p>
          <p><strong>Zone:</strong> ${details.zone}</p>
          <p><strong>Duration:</strong> ${details.duration}</p>
          <p><strong>Start Date:</strong> ${details.startDateTime}</p>
          <p><strong>Cost:</strong> ${getCost(details.duration)}</p>
        </body>
      </html>
    `;

    try {
      await Print.printAsync({
        html: htmlContent,
      });
    } catch (err) {
      console.error("Print error:", err);
    }
  };
  // <KeyboardAvoidingView
  //   behavior="padding"
  //   keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
  // >
  // </KeyboardAvoidingView>
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
    >
      {/* Title Section */}
      {/* <View style={styles.titleContainer}>
        <Text style={styles.title}>Pembayaran</Text>
      </View> */}

      <View style={styles.mainSection}>
        <View style={styles.combinedSection}>
          <View style={styles.pembayaranSection}>
            <Text style={[styles.header, { textAlign: "center" }]}>
              Pendaftaran Manual Pelanggan Zon {details.zone}
            </Text>
            <Text style={styles.subheader}>
              Manual Register untuk pelanggan Zon {details.zone} yang tidak
              mempunyai aplikasi
            </Text>
          </View>
          <View style={styles.pembayaranSection}>
            <Text style={styles.label}>Nombor Plat Lesen</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan Nombor Plat"
              placeholderTextColor="#999"
              value={details.plateNumber}
              onChangeText={(text) =>
                setDetails({
                  ...details,
                  plateNumber: text.toUpperCase().trim(),
                })
              }
            />
          </View>

          <View style={styles.pembayaranSection}>
            <Text style={styles.label}>Jenis Kenderaan</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={details.vehicleType}
                onValueChange={(itemValue) =>
                  setDetails({ ...details, vehicleType: itemValue })
                }
              >
                <Picker.Item label="Pilih Jenis Kenderaan" value="" />
                <Picker.Item label="Kereta" value="kereta" />
                <Picker.Item label="Motosikal" value="motosikal" />
                <Picker.Item label="Van" value="van" />
              </Picker>
            </View>
          </View>

          <View style={styles.pembayaranSection}>
            <Text style={styles.label}>Model Kereta</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Toyota Vios"
              placeholderTextColor="#999"
              value={details.carModel}
              onChangeText={(text) =>
                setDetails({ ...details, carModel: text.toUpperCase() })
              }
            />
          </View>

          <View style={styles.pembayaranSection}>
            <Text style={styles.label}>Warna Kereta</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Merah"
              placeholderTextColor="#999"
              value={details.carColor}
              onChangeText={(text) =>
                setDetails({ ...details, carColor: text.toUpperCase() })
              }
            />
          </View>

          <View style={styles.pembayaranSection}>
            <Text style={styles.label}>Tempoh Masa Letak Kereta</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={details.duration}
                onValueChange={(itemValue) =>
                  setDetails({ ...details, duration: itemValue })
                }
              >
                <Picker.Item label="Pilih Tempoh Masa" value="" />
                {Object.keys(costs).map((key) => (
                  <Picker.Item
                    key={`hour_${key}`}
                    label={`${key} jam`}
                    value={key}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default PayForCustomerScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center", // centers when few fields
    backgroundColor: "#F0F8FF",
    paddingVertical: 20,
  },

  titleContainer: {
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
    color: "#ffffff", // Change text color to white
  },

  mainSection: {
    flex: 1,
    paddingHorizontal: 25,
    backgroundColor: "#F0F8FF",
  },

  combinedSection: {
    flex: 1,
    paddingVertical: 25,
    backgroundColor: "#FFFFFF",
    borderRadius: 10, // Rounded edges for a softer look
    shadowColor: "#000", // Adds a subtle shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // For Android shadow effect
    borderColor: "#E6E6E6",
    gap: 20,
  },

  pembayaranSection: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    gap: 10,
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0B477B",
  },
  subheader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#aaa",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderColor: "#ccc",
    borderWidth: 1,
    color: "#000",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0B477B",
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  submitButton: {
    backgroundColor: "#F8D07A",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  receipt: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginTop: 30,
    padding: 20,
    borderColor: "#0B477B",
    borderWidth: 1,
  },
  receiptHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0B477B",
    textAlign: "center",
  },
  receiptItem: {
    fontSize: 16,
    color: "#333",
  },
  printButton: {
    backgroundColor: "#0B477B",
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  printButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  zoneText: {
    fontSize: 16,
    color: "#000",
    padding: 12,
  },
});
