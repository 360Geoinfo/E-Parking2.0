import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import {
  Button,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import CurrentlyParking from "../../components/CurrentlyParking";

export default function LPRCamerav2() {
  const { zone, SERVER_API, token } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedPlate, setScannedPlate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTakenPicture, setIsTakenPicture] = useState(false);
  const [searchResult, setSearchResult] = useState({});
  const [isCooldown, setIsCooldown] = useState(false);

  const cameraRef = useRef(null);
  const debounceRef = useRef(null);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleSearchPlate = async (plate) => {
    if (!plate) return;
    setIsLoading(true);
    try {
      console.log(
        "🔍 [Search] Fetching results for plate:",
        plate,
        "Zone:",
        zone
      );
      const response = await axios.post(
        `${SERVER_API}/outdoorparkingByPlate`,
        { plate, zone },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200 && Array.isArray(response.data)) {
        setSearchResult(response.data[0]);
        console.log("Search Result:", response.data[0]);
      } else {
        console.warn("Unexpected response:", response);
        Alert.alert(
          "Error",
          "Failed to fetch parking information. Please try again."
        );
        setSearchResult({});
      }
    } catch (error) {
      console.error("Error fetching parking information:", error);
      Alert.alert(
        "Error",
        "Failed to fetch parking information. Please try again."
      );
      setSearchResult({});
    } finally {
      setIsLoading(false);
    }
  };

  const handleRescan = () => {
    setScannedPlate(null);
    setSearchResult({});
    setIsTakenPicture(false);
    setIsLoading(false);
    setIsCooldown(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const handleTakePicture = async () => {
    if (isCooldown || isLoading) return; // prevent during cooldown or loading

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsLoading(true);
    setIsTakenPicture(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
      });

      const response = await axios.post(
        `${SERVER_API}/sendImage`,
        { image: photo.base64, zone },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
        {
          timeout: 10000, // 10 seconds timeout
        }
      );

      if (response.status === 400) {
        Alert.alert("Error", "No plate detected. Please try again.");
        setScannedPlate(null);
        setSearchResult({});
        setIsTakenPicture(false);
      } else if (response.status === 200) {
        const { plate } = response.data;
        setScannedPlate(plate);
        await handleSearchPlate(plate);

        // Start cooldown
        setIsCooldown(true);
        debounceRef.current = setTimeout(() => {
          setIsCooldown(false);
        }, 5000);
      }
    } catch (error) {
      setScannedPlate(null);
      setSearchResult({});
      setIsTakenPicture(false);
      Alert.alert("Error", "Failed to process the image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        {/* Draggable Vertical Bar for Zoom */}
        <View style={{ position: "absolute", right: 10 }}>
          <TouchableOpacity
            style={{ padding: 10, bgColor: "#fff" }}
          ></TouchableOpacity>
        </View>

        <View style={styles.overlay}>
          <Text style={styles.message}>
            {scannedPlate
              ? `Nombor Plat: ${scannedPlate}`
              : "Sila berdiri 1-5 kaki dari kamera untuk mengimbas plat kenderaan."}
          </Text>

          {scannedPlate && searchResult?.plate === scannedPlate && (
            <CurrentlyParking
              parking={searchResult}
              setQuery={handleRescan}
              refresh={() => handleSearchPlate(scannedPlate)}
            />
          )}

          <TouchableOpacity
            style={[
              styles.button,
              (isLoading || isCooldown) && { backgroundColor: "#999" },
            ]}
            onPress={isTakenPicture ? handleRescan : handleTakePicture}
            disabled={isLoading || isCooldown}
          >
            <Ionicons
              name={isTakenPicture ? "refresh" : "scan-outline"}
              size={50}
              color="#fff"
            />
            <Text style={styles.buttonText}>
              {isCooldown
                ? "Please wait..."
                : isTakenPicture
                ? "Scan Again"
                : "Scan Plate"}
            </Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 16,
  },
  message: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  button: {
    padding: 20,
    backgroundColor: "#0B477B",
    borderRadius: 100,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 5,
  },
  resultBox: {
    backgroundColor: "#1E293B",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  resultText: {
    color: "#fff",
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
});
