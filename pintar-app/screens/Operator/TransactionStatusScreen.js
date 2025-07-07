// TransactionStatusScreen.js
import React, { useEffect, useState } from "react";
import * as Print from "expo-print";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "react-native-vector-icons";
import dayjs from "dayjs";

export default function TransactionStatusScreen({ route, navigation }) {
  const { payment, parking } = route.params;

  const getCost = (duration) => {
    return costs[duration] || "0.00 BND";
  };

  const handlePrint = async () => {
    const htmlContent = `
      <html>
        <body>
          <h1>Status Transaksi</h1>
          <p><strong>ID Tiket:</strong> ${paymentID}</p>
          <p><strong>Status:</strong> ${
            status === "success" ? "Berjaya" : "Gagal"
          }</p>
          <p><strong>No Plat:</strong> ${plateNumber}</p>
          <p><strong>Kenderaan:</strong> ${vehicleType} - ${carColor}</p>
          <p><strong>Zon:</strong> ${zone}</p>
          <p><strong>Tempoh:</strong> ${duration}</p>
          <p><strong>Waktu Mula:</strong> ${startTime}</p>
          <p><strong>Kos:</strong> ${getCost(duration)}</p>
          <p><em>Simpan resit ini sebagai bukti pembayaran.</em></p>
        </body>
      </html>
    `;
    try {
      await Print.printAsync({ html: htmlContent });
    } catch (err) {
      console.error("Print error:", err);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* <Text>{JSON.stringify({ payment, parking }, null, 2)}</Text> */}

      <View style={styles.mainSection}>
        <View style={styles.combinedSection}>
          <View style={styles.transactionSection}>
            {payment.status === "Confirmed" && (
              <View style={styles.approvalSection}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={80}
                  color="#4CAF50"
                />
                <Text style={styles.approvalText}>Bayaran Selesai</Text>
                <Text style={styles.ticketID}>
                  ID Tiket: {payment.paymentID}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.resitSection}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>
              {payment.status === "Confirmed"
                ? "Transaksi Berjaya!"
                : "Transaksi Gagal!"}
            </Text>
            <Image
              source={require("../../assets/Logo.png")} // Path to your logo image
              style={styles.logo}
            />
          </View>

          <View style={styles.resitsamanSection}>
            <View style={styles.detailsContainer}>
              <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Plate Lesen:</Text>
                <Text style={styles.detailText}>{parking.plate}</Text>
              </View>

              <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>ID Tiket:</Text>
                <Text style={styles.detailText}>{payment.paymentID}</Text>
              </View>

              <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Operator ID</Text>
                <Text style={styles.detailText}>{payment.operatorID}</Text>
              </View>

              <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Tarik & Masa</Text>
                <Text style={styles.detailText}>
                  {dayjs(parking.dateTime).format("DD/MM/YYYY h:mm A")}
                </Text>
              </View>

              <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Zone Letak Kerita</Text>
                <Text style={styles.detailText}>Zone {parking.zone}</Text>
              </View>

              <View style={styles.rowSection}>
                <Text style={styles.detailTitle}>Jumlah Bayaran</Text>
                <Text style={styles.detailText}>$ {(payment.amount/100).toFixed(2)}</Text>
              </View>

              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                  Simpan resit ini sebagai bukti pembayaran anda.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Kembali</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.summonbutton} onPress={handlePrint}>
            <MaterialCommunityIcons name="printer" size={24} color="#fff" />
            <Text style={styles.summonText}>Cetak Resit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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

  mainSection: {
    flex: 1,
    padding: 25,
    backgroundColor: "#F0F8FF",
    shadowColor: "#000", // Adds a subtle shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // For Android shadow effect
  },

  combinedSection: {
    paddingVertical: 25,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 10, // Rounded edges for a softer look
    shadowColor: "#000", // Adds a subtle shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // For Android shadow effect
    borderColor: "#E6E6E6",
  },

  transactionSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
    marginBottom: 20,
  },

  resitSection: {
    paddingVertical: 25,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 10, // Rounded edges for a softer look
    shadowColor: "#000", // Adds a subtle shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5, // For Android shadow effect
    borderColor: "#E6E6E6",
  },

  headerContainer: {
    marginBottom: 20,
    flexDirection: "row", // This makes it a row layout
    justifyContent: "space-between", // This aligns the elements within the row
    alignItems: "center", // This centers the items vertically
    width: "100%",
    borderBottomWidth: 2, // Adds a border at the bottom for the underline
    borderBottomColor: "#000", // Color of the underline
    paddingBottom: 5, // Padding below the text for spacing from the border
  },

  headerTitle: {
    paddingHorizontal: 20,
    fontSize: 26, // Increased font size for header
    fontWeight: "bold",
    color: "#2C3E50", // Darker color for better contrast
  },

  logo: {
    width: 100, // Adjust the size of the logo as needed
    height: 40, // Adjust the height accordingly
    marginRight: 10,
    resizeMode: "contain", // Ensures the logo fits within the provided size
  },

  resitsamanSection: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    marginBottom: 15,
  },

  detailsContainer: {
    marginBottom: 25, // Increased margin for spacing
  },

  rowSection: {
    marginBottom: 25, // Increased margin between sections
  },

  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  detailTitle: {
    fontSize: 16, // Slightly larger for emphasis
    color: "#666B71",
    marginBottom: 8, // Spacing before the text
  },

  detailText: {
    fontSize: 18,
    color: "#000000", // Darker text for better readability
    marginBottom: 12, // More spacing between details
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

  approvalSection: {
    alignItems: "center",
  },

  approvalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 10,
  },

  ticketID: {
    fontSize: 16,
    color: "#333",
    marginTop: 5,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },

  button: {
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    width: "48%", // Ensure both buttons are the same width
    alignItems: "center",
    justifyContent: "center", // Align text and icon in the center
    flexDirection: "row", // Align icon and text horizontally
    gap: 10, // Add some space between the icon and text
  },

  buttonText: {
    fontWeight: "bold",
  },

  summonbutton: {
    backgroundColor: "#0B477B",
    padding: 12,
    borderRadius: 8,
    width: "48%", // Ensure both buttons are the same width
    alignItems: "center",
    justifyContent: "center", // Align text and icon in the center
    flexDirection: "row", // Align icon and text horizontally
    gap: 10, // Add some space between the icon and text
  },

  summonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
