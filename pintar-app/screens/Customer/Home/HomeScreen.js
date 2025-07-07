import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import MapView from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";

import { Picker } from "@react-native-picker/picker";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

import { JalanMcArthurPolygon } from "./JalanMcArthur";
import { JalanPemanchaPolygon } from "./JalanPemancha";
import { JalanElizabethDuaPolygon } from "./JalanElizabethDua";
import { JalanCatorPolygon } from "./JalanCator";
import { JalanPanggungPolygon } from "./JalanPanggung";
import { JalanKianggehPolygon } from "./JalanKianggeh";
import { LorongSwastapggmbPolygon } from "./LorongSwastapggmb";
import { JalanKianggehLapauAtasPolygon } from "./JalanKianggehLapauAtas";
import { JalanRobertsPolygon } from "./JalanRoberts";

const { height } = Dimensions.get("window");

// Utility: Rotate coordinate around a center by given angle
const rotateCoordinate = (point, center, angle) => {
  const rad = (Math.PI / 180) * angle;
  const lat = point.latitude - center.latitude;
  const lon = point.longitude - center.longitude;
  const rotatedLat = lat * Math.cos(rad) - lon * Math.sin(rad);
  const rotatedLon = lat * Math.sin(rad) + lon * Math.cos(rad);
  return {
    latitude: rotatedLat + center.latitude,
    longitude: rotatedLon + center.longitude,
  };
};

// Stateless Map Component
const MapComponent = ({ onParkingPress, userRegion, mapRef }) => {
  const center1 = { latitude: 4.887051, longitude: 114.942906 };
  const coords1 = [
    {
      latitude: center1.latitude + 0.0002,
      longitude: center1.longitude - 0.0009,
    },
    {
      latitude: center1.latitude + 0.0002,
      longitude: center1.longitude + 0.001,
    },
    {
      latitude: center1.latitude - 0.00002,
      longitude: center1.longitude + 0.001,
    },
    {
      latitude: center1.latitude - 0.00002,
      longitude: center1.longitude - 0.0009,
    },
  ];

  const center2 = { latitude: 4.888892, longitude: 114.943447 };
  const rawCoords2 = [
    {
      latitude: center2.latitude + 0.0001,
      longitude: center2.longitude - 0.0006,
    },
    {
      latitude: center2.latitude + 0.0001,
      longitude: center2.longitude + 0.0006,
    },
    {
      latitude: center2.latitude - 0.00002,
      longitude: center2.longitude + 0.0006,
    },
    {
      latitude: center2.latitude - 0.00002,
      longitude: center2.longitude - 0.0006,
    },
  ];
  const coords2 = rawCoords2.map((coord) =>
    rotateCoordinate(coord, center2, -10)
  );

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      region={userRegion}
      showsUserLocation={true}
      mapType="hybrid"
    >
      <JalanMcArthurPolygon onParkingPress={onParkingPress} />
      <JalanPemanchaPolygon onParkingPress={onParkingPress} />
      <JalanElizabethDuaPolygon onParkingPress={onParkingPress} />
      <JalanCatorPolygon onParkingPress={onParkingPress} />
      <JalanPanggungPolygon onParkingPress={onParkingPress} />
      <JalanKianggehPolygon onParkingPress={onParkingPress} />
      <LorongSwastapggmbPolygon onParkingPress={onParkingPress} />
      <JalanKianggehLapauAtasPolygon onParkingPress={onParkingPress} />
      <JalanRobertsPolygon onParkingPress={onParkingPress} />
    </MapView>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const mapRef = useRef(null);

  const [showForm, setShowForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState();
  const [locationInput, setLocationInput] = useState("");
  const [vehicleInput, setVehicleInput] = useState("");
  const [durationInput, setDurationInput] = useState("");

  const [receipt, setReceipt] = useState(null);

  //fetching Petak -------------------------------------------------------------------------------
  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const transactionID = await AsyncStorage.getItem("latestTransactionID");
        const token = await AsyncStorage.getItem("token");

        if (!transactionID || !token) {
          console.error("Transaction ID or token missing");
          return;
        }

        const response = await axios.post(
          "http://192.168.102.55:3001/getreceiptparking",

          { IDTransaction: transactionID },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("✅ Receipt fetched:", response.data);
        setReceipt(response.data);
      } catch (error) {
        console.error(
          "❌ Error fetching receipt:",
          error.response?.data || error.message
        );
      }
    };

    fetchReceipt();
  }, []);
  //fetching Petak -------------------------------------------------------------------------------

  //dropdown Fetching ------------------------------------------------------------------
  const [plateOptions, setPlateOptions] = useState([]);
  const [selectedPlate, setSelectedPlate] = useState("");
  const [selectedVehicleID, setSelectedVehicleID] = useState("");

  useEffect(() => {
    const fetchPlateLicenses = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userid = await AsyncStorage.getItem("userID");

        if (!token || !userid) {
          Alert.alert(
            "Error",
            "Token or user ID not found. Please log in again."
          );
          return;
        }

        const response = await fetch(
          "http://192.168.102.55:3001/getplatlicense",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userid }),
          }
        );

        const data = await response.json();

        if (response.ok && Array.isArray(data.plateList)) {
          setPlateOptions(data.plateList);

          // Optional: auto-select first plate and vehicle ID
          if (data.plateList.length > 0) {
            setSelectedPlate(data.plateList[0].plateLicense);
            setSelectedVehicleID(data.plateList[0].vehicleID);

            // Optionally store in AsyncStorage
            await AsyncStorage.setItem(
              "vehicleID",
              data.plateList[0].vehicleID
            );
          }
        } else {
          Alert.alert("Error", data.message || "Gagal memuat nombor plat.");
        }
      } catch (error) {
        console.error("Error fetching plates:", error);
        Alert.alert("Ralat", "Gagal berhubung dengan pelayan.");
      }
    };

    fetchPlateLicenses();
  }, []);
  //dropdown Fetching ------------------------------------------------------------------

  //Parking Outdoor function ------------------------------------------------------------------
  const handleLetakKereta = async () => {
    console.log("Validation Check:", {
      selectedVehicleID,
      selectedPlate,
      durationInput,
      locationInput,
    });

    try {
      const token = await AsyncStorage.getItem("token");
      const userID = await AsyncStorage.getItem("userID");
      const IDTransaction = await AsyncStorage.getItem("latestTransactionID"); // ✅ ADD THIS LINE

      if (!token || !userID || !IDTransaction) {
        Alert.alert("Authentication Error", "Please log in again.");
        return;
      }

      if (
        !selectedVehicleID ||
        !selectedPlate ||
        !durationInput ||
        !locationInput
      ) {
        Alert.alert("Validation Error", "All fields must be selected.");
        return;
      }

      const payload = {
        userID,
        Vehicleid: selectedVehicleID,
        PlatLicense: selectedPlate,
        Duration: durationInput,
        location: locationInput,
        IDTransaction, // ✅ INCLUDE IN PAYLOAD
      };

      console.log("🚀 Submitting parking data:", payload);

      await AsyncStorage.setItem("vehicleID", selectedVehicleID);
      console.log("📦 vehicleID stored in AsyncStorage:", selectedVehicleID);

      const response = await fetch(
        "http://192.168.102.55:3001/outdoorparking",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Parking success:", data);

        // Store the payload in AsyncStorage and log it
        await AsyncStorage.setItem(
          "lastOutdoorParkingPayload",
          JSON.stringify(payload)
        );
        console.log("📝 Payload stored in AsyncStorage:", payload);

        Alert.alert(
          "Success",
          `Kenderaan berjaya diletakkan.\n${data.petakUpdate}`,
          [
            {
              text: "OK",
              onPress: () =>
                navigation.replace("CustomerTabs", { screen: "Active" }),
            },
          ]
        );
        handleClose(); // optional
      } else {
        console.error("❌ Parking error:", data.message);
        Alert.alert("Server Error", data.message || "Failed to letak kereta.");
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
      Alert.alert("Network Error", "Failed to connect to server.");
    }
  };
  //Parking Outdoor function ------------------------------------------------------------------

  const [userRegion, setUserRegion] = useState({
    latitude: 4.889459,
    longitude: 114.942354,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  });

  useEffect(() => {
    const getLocationOnce = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          const { latitude, longitude } = location.coords;

          setUserRegion({
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        } catch (error) {
          console.error("Error getting location:", error);
          // fallback to default region
        }
      } else {
        console.warn("Location permission not granted");
        // fallback to default region
      }
    };

    getLocationOnce();
  }, []);

  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting("Selamat Pagi");
      else if (hour >= 12 && hour < 18) setGreeting("Selamat Petang");
      else setGreeting("Selamat Malam");
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  //Check If vehicle existed, if not existed it will navigate to kenderaan ================
  const handleParkingPress = async (locationName) => {
    try {
      console.log("🔹 Parking location pressed:", locationName);

      const token = await AsyncStorage.getItem("token");
      const userid = await AsyncStorage.getItem("userID");
      const username = await AsyncStorage.getItem("username");

      console.log("🔹 Retrieved from AsyncStorage:", {
        token,
        userid,
        username,
      });

      const response = await fetch(
        "http://192.168.102.55:3001/getplatelicense",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userid,
            username,
            function: "get plate license",
          }),
        }
      );

      const data = await response.json();
      const plate = data?.PLATLICENSE;

      console.log("🔹 API response data:", data);
      console.log("🔹 Extracted plate license:", plate);

      if (plate && plate.trim() !== "") {
        console.log("✅ Plate license exists. Showing form...");
        setSelectedLocation(locationName);
        setLocationInput(locationName);
        setShowForm(true);
      } else {
        console.log(
          "❌ Plate license is null/empty. Navigating to Kenderaan..."
        );
        navigation.navigate("Kenderaan");
      }
    } catch (error) {
      console.error("❌ Plate license check failed:", error);
      Alert.alert("Error", "Unable to check plate license.");
    }
  };
  //Check If vehicle existed, if not existed it will navigate to kenderaan ================

  const handleClose = () => {
    setShowForm(false);
    setLocationInput("");
    setVehicleInput("");
    setDurationInput("");
    setSelectedLocation(null);
  };

  const handleLocationButtonPress = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Please enable location services.");
      return;
    }

    const isServicesEnabled = await Location.hasServicesEnabledAsync();
    if (!isServicesEnabled) {
      Alert.alert(
        "GPS Disabled",
        "Please turn on location services in settings."
      );
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 3000, // timeout in milliseconds
      });

      const { latitude, longitude } = location.coords;

      const animatedRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      if (mapRef.current) {
        mapRef.current.animateToRegion(animatedRegion, 1000);
      }
    } catch (error) {
      console.error("Location fetch error:", error);
      Alert.alert("Error", "Failed to get location within time limit.");
    }
  };

  const handleParkingArea = () => {
    const region = {
      latitude: 4.889459,
      longitude: 114.942354,
      latitudeDelta: 0.008,
      longitudeDelta: 0.008,
    };

    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  //const handleSubmit = () => {
  //Alert.alert(
  //'Maklumat Disimpan',
  //`📍 Lokasi: ${locationInput}\n🚗 Kenderaan: ${vehicleInput}\n⏱️ Tempoh: ${durationInput}`
  //);
  //handleClose();
  //};

  return (
    <View style={styles.container}>
      <MapComponent
        onParkingPress={handleParkingPress}
        userRegion={userRegion}
        mapRef={mapRef}
      />

      <View style={styles.topheader}>
        <Text style={styles.titleheader}>PINTAR Smart Parking</Text>
      </View>

      <View style={styles.secondtopheader}>
        <Text style={styles.secondheader}>{greeting}</Text>
        {receipt && (
          <Text style={styles.secondheader}>{receipt.PETAKDIGIT} Petak</Text>
        )}
      </View>

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleLocationButtonPress}
        >
          <MaterialIcons name="my-location" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.floatingButtonContainer2}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleParkingArea}
        >
          <MaterialIcons name="place" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {showForm && selectedLocation && (
        <View style={styles.popupCard}>
          <Text style={styles.popupTitle}>Letak Kenderaan</Text>

          <Text>Lokasi:</Text>
          <TextInput
            style={styles.input}
            value={locationInput}
            onChangeText={setLocationInput}
            placeholder="Lokasi"
            editable={false} // <-- This makes it read-only
          />

          <Text>Vehicle ID: It will be hidden</Text>
          <TextInput
            style={styles.input}
            value={selectedVehicleID}
            placeholder="Vehicle ID"
            editable={false}
          />

          <Text>Pilih Kenderaan</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedPlate}
              onValueChange={(itemValue) => {
                setSelectedPlate(itemValue);

                const selected = plateOptions.find(
                  (p) => p.plateLicense === itemValue
                );
                if (selected) {
                  setSelectedVehicleID(selected.vehicleID);
                  AsyncStorage.setItem("vehicleID", selected.vehicleID); // optional
                }
              }}
              style={styles.picker}
              //mode="dropdown" // ✅ iOS defaults to "dialog", set to "dropdown" for Android-like experience
            >
              {plateOptions.map((item, index) => (
                <Picker.Item
                  key={index}
                  label={item.plateLicense}
                  value={item.plateLicense}
                />
              ))}
            </Picker>
          </View>

          <Text>Tempoh Masa:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={durationInput}
              onValueChange={(itemValue) => setDurationInput(itemValue)}
              style={styles.picker}
              //mode="dropdown"
            >
              <Picker.Item label="Pilih Tempoh" value="" enabled={false} />
              <Picker.Item label="1 Jam" value="1" />
              <Picker.Item label="2 Jam" value="2" />
              <Picker.Item label="3 Jam" value="3" />
              <Picker.Item label="4 Jam" value="4" />
              <Picker.Item label="5 Jam" value="5" />
              <Picker.Item label="6 Jam" value="6" />
              <Picker.Item label="7 Jam" value="7" />
              <Picker.Item label="8 Jam" value="8" />
              <Picker.Item label="9 Jam" value="9" />
              <Picker.Item label="10 Jam" value="10" />
            </Picker>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleLetakKereta}
          >
            <Text style={{ color: "#fff" }}>Letak Kereta Sini</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={{ color: "#fff" }}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B477B",
  },
  topheader: {
    width: "100%",
    backgroundColor: "#0B477B",
    paddingVertical: 12,
    alignItems: "center",
    zIndex: 10,
  },
  titleheader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
  },
  secondtopheader: {
    width: "100%",
    backgroundColor: "#0B477B",
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "flex-start",
    marginBottom: 10,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secondheader: {
    fontSize: 14,
    color: "#fff",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  floatingButtonContainer: {
    position: "absolute",
    top: 160,
    right: 20,
    zIndex: 2,
  },
  floatingButtonContainer2: {
    position: "absolute",
    top: 160,
    left: 20,
    zIndex: 2,
  },
  floatingButton: {
    backgroundColor: "#0B477B",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  popupCard: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 10,
    zIndex: 3,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: "#0B477B",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: "#999",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginVertical: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    ...Platform.select({
      ios: {
        height: 150, // ✅ Needed to show the spinning wheel properly
        justifyContent: "center",
      },
      android: {
        height: 50,
      },
    }),
  },

  picker: {
    width: "100%",
    ...Platform.select({
      ios: {
        height: 150, // ✅ Helps the spinning picker display correctly
      },
      android: {
        height: 50,
      },
    }),
  },
});
