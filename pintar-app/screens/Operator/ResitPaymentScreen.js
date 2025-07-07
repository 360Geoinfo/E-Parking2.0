import React, { useEffect, useState } from "react";
import * as Print from "expo-print";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "react-native-vector-icons";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";

export default function PaymentScreen({ route, navigation }) {
  const { user, token, SERVER_API } = useAuth();
  const { parkingID, vehicleID } = route.params || {};
  console.log({ parkingID, vehicleID });

  const [details, setDetails] = useState({
    plateNumber: "",
    vehicleType: "",
    carModel: "",
    carColor: "",
    zone: "",
    duration: "",
    startDateTime: "",
    exitDateTime: "",
    petakStatus: "",
  });
  const [payment, setPayment] = useState({
    id: "",
    outdoorID: "",
    amount: "",
    payment_date: "",
    payment_method: "",
    status: "",
    operatorID: "",
  });
  const fetchParkingDetailsResult = async () => {
    console.log(
      "Fetching parking details for:",
      JSON.stringify({ parkingID }, null, 2)
    );

    const parkingDetailsResult = await axios.post(
      `${SERVER_API}/outdoorparkingByIDandVID`,
      {
        outdoorID: parkingID,
        vehicleID,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log(
      "Parking details result:",
      JSON.stringify(parkingDetailsResult.data, null, 2)
    );

    if (parkingDetailsResult.status !== 200) {
      console.error("Failed to fetch parking details:", parkingDetailsResult);
      Alert.alert(
        "Error",
        "Failed to fetch parking details. Please try again."
      );
      return;
    }
    if (!parkingDetailsResult.data || parkingDetailsResult.data.length === 0) {
      console.warn("No parking details found for the given ID and Vehicle ID.");
      return;
    }
    console.log(
      "Parking details fetched successfully:",
      parkingDetailsResult.data
    );

    const parkingDetails = parkingDetailsResult.data[0];
    console.log("Fetched parking Payment details:", parkingDetails);

    const fetchPaymentDetailsResult = await axios.post(
      `${SERVER_API}/fetchPaymentsToOperatorByParkingID`,
      {
        parkingID,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (fetchPaymentDetailsResult.status !== 200) {
      console.error(
        "Failed to fetch payment details:",
        fetchPaymentDetailsResult
      );
      Alert.alert(
        "Error",
        "Failed to fetch payment details. Please try again."
      );
      return;
    }
    if (!fetchPaymentDetailsResult.data) {
      console.warn("No payment details found for the given Parking ID.");
      return;
    }
    const paymentDetails = fetchPaymentDetailsResult.data[0];
    if (!paymentDetails) {
      console.warn("No payment details found for the given Parking ID.");
      return;
    }

    setDetails({
      plateNumber: parkingDetails.plate,
      vehicleType: parkingDetails.vehicleType,
      carModel: parkingDetails.carModel,
      carColor: parkingDetails.carColor,
      zone: parkingDetails.zone,
      duration: parkingDetails.duration,
      startDateTime: parkingDetails.startDateTime,
      exitDateTime: parkingDetails.exitDateTime,
      petakStatus: parkingDetails.petakStatus,
    });
    setPayment(paymentDetails);
  };
  useEffect(() => {
    fetchParkingDetailsResult();
  }, [parkingID, vehicleID, token, SERVER_API]);
  const handlePrint = async () => {
    const htmlContent = `
      <!DOCTYPE html>
        <html lang="ms">
          <head>
            <meta charset="UTF-8" />
            <title>Resit Pembayaran</title>
            <style>
              body {
                font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                margin: 40px;
                background-color: #fff;
                color: #333;
              }

              .receipt-wrapper {
                max-width: 700px;
                margin: auto;
                padding: 30px;
                border: 1px solid #ccc;
                box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
              }

              .header {
                text-align: center;
                margin-bottom: 30px;
              }

              .header h1 {
                margin: 0;
                font-size: 26px;
                text-transform: uppercase;
                color: #222;
              }

              .section {
                margin-bottom: 20px;
              }

              .section-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 10px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
                color: #444;
              }

              .info-row {
                display: flex;
                justify-content: space-between;
                padding: 6px 0;
                font-size: 16px;
              }

              .info-label {
                font-weight: 500;
                width: 45%;
                color: #555;
              }

              .info-value {
                width: 50%;
                text-align: right;
              }

              .footer {
                text-align: center;
                font-style: italic;
                margin-top: 40px;
                font-size: 14px;
                color: #666;
              }

              @media print {
                body {
                  margin: 0;
                }

                .receipt-wrapper {
                  border: none;
                  box-shadow: none;
                }

                .footer {
                  margin-top: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="receipt-wrapper">
              <div class="header">
                <!-- Optional logo -->
                <!-- <img src="logo_url_here" alt="Company Logo" width="100" /> -->
                <h1>Resit Pembayaran</h1>
              </div>

              <div class="section">
                <div class="section-title">Maklumat Kenderaan</div>
                <div class="info-row">
                  <span class="info-label">No. Plat Kenderaan:</span>
                  <span class="info-value">${details.plateNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Jenis Kenderaan:</span>
                  <span class="info-value">${details.vehicleType}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Model:</span>
                  <span class="info-value">${details.carModel}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Warna:</span>
                  <span class="info-value">${details.carColor}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Zon Letak Kereta:</span>
                  <span class="info-value">${details.zone}</span>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Butiran Pembayaran</div>
                <div class="info-row">
                  <span class="info-label">Tempoh:</span>
                  <span class="info-value">${details.duration} Jam</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Waktu Mula:</span>
                  <span class="info-value">${details.startDateTime}</span>
                </div>
                ${
                  details.exitDateTime
                    ? `<div class="info-row">
                        <span class="info-label">Waktu Keluar:</span>
                        <span class="info-value">${details.exitDateTime}</span>
                      </div>`
                    : ""
                }
                <div class="info-row">
                  <span class="info-label">Jumlah Pembayaran:</span>
                  <span class="info-value">${(payment.amount / 100).toFixed(
                    2
                  )} BND</span>
                </div>
              </div>

              <div class="footer">
                Simpan resit ini sebagai bukti pembayaran yang sah.
              </div>
            </div>
          </body>
        </html>
    `;
    try {
      await Print.printAsync({ html: htmlContent });
    } catch (err) {
      console.error("Print error:", err);
    }
  };

  // Simulate transaction success or failure
  const handlePaymentConfirmation = async () => {
    const paymentResult = await axios.post(
      `${SERVER_API}/confirmOutdoorPayment`,
      {
        paymentID: payment.id,
        outdoorID: parkingID,
        operatorID: user.userID,
        vehicleID,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    console.log("Payment confirmation result:", paymentResult.data);
    if (paymentResult.status !== 200) {
      console.error("Failed to confirm payment:", paymentResult);
      Alert.alert("Error", "Failed to confirm payment. Please try again.");
      return;
    }
    Alert.alert("Success", "Payment confirmed successfully.", [
      {
        text: "OK",
        onPress: () => {
          setPayment(paymentResult.data);
          // console.log("Payment", payment, "Details:", details),
          setTimeout(() => {
            navigation.navigate("Transaction Status", {
              payment: {
                ...paymentResult.data,
                paymentID: paymentResult.data.id,
              },
              parking: {
                parkingID: details.parkingId,
                plate: details.plateNumber,
                vehicleType: details.vehicleType,
                carModel: details.carModel,
                carColor: details.carColor,
                zone: details.zone,
                duration: details.duration,
                startDateTime: details.startDateTime,
                petakStatus: details.petakStatus,
              },
            });
          }, 1000);
        },
      },
    ]);
  };

  const handleCancel = async () => {
    console.log(
      "Canceling parking with ID:",
      parkingID,
      "for vehicle ID:",
      vehicleID
    );
    try {
      const responseCancel = await axios.post(
        `${SERVER_API}/cancelOutdoorParking`,
        {
          outdoorID: parkingID,
          vehicleID,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Cancel response:", responseCancel.data);

      if (responseCancel.status !== 200) {
        console.error("Failed to cancel parking:", responseCancel);
        Alert.alert("Error", "Failed to cancel parking. Please try again.");
        return;
      }

      console.log("payment ID:", payment, "operatorID:", user);

      const responseCancelPayment = await axios.post(
        `${SERVER_API}/cancelOutdoorPayment`,
        {
          paymentID: payment.id,
          operatorID: user.userID,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Cancel payment response:", responseCancelPayment.data);
      if (responseCancelPayment.status !== 200) {
        console.error("Failed to cancel payment:", responseCancelPayment);
        Alert.alert("Error", "Failed to cancel payment. Please try again.");
        return;
      }

      Alert.alert("Success", "Parking cancelled successfully.", [
        { text: "OK", onPress: () => navigation.goBack(-1) },
      ]);
    } catch (error) {
      console.error("Error during cancellation:", error);
      Alert.alert("Error", "Failed to cancel parking. Please try again.");
    }
  };

  const handleCheckTimeout = () => {
    // Check if the payment has timed out
    const now = dayjs();
    const end = dayjs(details.startDateTime).add(10, "minute");
    if (now.isAfter(end)) {
      Alert.alert("Timeout", "Payment has timed out.");
      return true;
    }
    return false;
  };

  return (
    <ScrollView style={styles.container}>
      {/* <View style={styles.titleContainer}>
        <Text style={styles.title}>Resit Pembayaran</Text>
      </View> */}

      <View style={styles.backgroundSection}>
        <View style={styles.combinedSection}>
          <View style={styles.backButtonContainer}></View>

          <View style={styles.mainSection}>
            <View style={styles.headerContainer}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="caret-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                Butiran Pembayaran bagi Petak {details.parkingId}
              </Text>
            </View>
            <View style={styles.detailsContainer}>
              {/* Vehicle Section */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>Status Letak Kereta</Text>
                  <Text style={styles.value}>{details.petakStatus}</Text>
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>Status Pembayaran</Text>
                  <Text style={styles.value}>{payment.status}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <Icon
                  name="car"
                  size={24}
                  color="#1E5A96"
                  style={styles.icon}
                />
                <View>
                  <Text style={styles.label}>Kenderaan</Text>
                  <Text style={styles.value}>{details.plateNumber}</Text>
                  <Text style={styles.subtext}>
                    {details.vehicleType} · {details.carModel} ·{" "}
                    {details.carColor}
                  </Text>
                </View>
              </View>

              {/* Time Section */}
              <View style={styles.row}>
                <Icon
                  name="clock-o"
                  size={24}
                  color="#1E5A96"
                  style={styles.icon}
                />
                <View>
                  <Text style={styles.label}>Tarikh & Masa</Text>
                  <Text style={styles.value}>
                    {dayjs(details.startDateTime).format("YYYY-MM-DD h:mm A")}
                  </Text>
                  <Text style={styles.subtext}>
                    Tempoh: {details.duration} Jam
                  </Text>
                </View>
              </View>

              {/* Zone Section */}
              <View style={styles.row}>
                <Icon
                  name="map-marker"
                  size={24}
                  color="#1E5A96"
                  style={styles.icon}
                />
                <View>
                  <Text style={styles.label}>Zone Letak Kereta</Text>
                  <Text style={styles.value}>{details.zone}</Text>
                </View>
              </View>
            </View>

            {/* Separated Cost Section */}
            <View style={styles.costSection}>
              <View style={styles.rowCost}>
                <Text style={styles.labelCost}>Kos</Text>
                <Text style={styles.valueCost}>
                  {(payment.amount / 100).toFixed(2)} BND
                </Text>
              </View>
            </View>

            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Nota</Text>
              <Text style={styles.descriptionText}>
                Simpan resit ini sebagai bukti pembayaran anda.
              </Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            {["Cancelled", "Summoned", "Paid", "Exit", "Confirmed"].includes(
              details.petakStatus
            ) ? (
              <>
                <TouchableOpacity
                  style={styles.printButton}
                  onPress={handlePrint}
                >
                  <MaterialCommunityIcons
                    name="printer"
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.printText}>Cetak Resit</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  disabled={handleCheckTimeout ? false : true}
                >
                  <Text style={styles.buttonText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handlePaymentConfirmation}
                >
                  <Text style={styles.buttonText}>Sahkan Bayaran</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8FF",
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
    flex: 1,
    paddingVertical: 25,
    backgroundColor: "#F0F8FF",
  },

  backgroundSection: {
    flex: 1,
    padding: 25,
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

  mainSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },

  detailsContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    gap: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  icon: {
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  subtext: {
    fontSize: 14,
    color: "#555",
  },
  costSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
  },

  rowCost: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  labelCost: {
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 6,
    color: "#333",
  },

  valueCost: {
    fontSize: 16,
    color: "#555",
  },

  descriptionContainer: { marginTop: 20 },
  descriptionTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  descriptionText: { fontSize: 14, fontStyle: "italic" },

  summonButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
  },

  summonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  cancelButton: {
    backgroundColor: "#E6E6E6",
    padding: 12,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
    borderRadius: 10,
  },

  confirmButton: {
    backgroundColor: "#F8D07A",
    padding: 12,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
    borderRadius: 10,
  },

  buttonText: {
    color: "#000",
    fontWeight: "bold",
  },
  printButton: {
    backgroundColor: "#1E5A96",
    padding: 12,
    flex: 1,
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
  },
  printText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
});
