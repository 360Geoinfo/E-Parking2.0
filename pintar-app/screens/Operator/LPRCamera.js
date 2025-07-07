import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import {
  Button,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { Buffer } from "buffer";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import CurrentlyParking from "../../components/CurrentlyParking";

export default function LPRCamera() {
  const { zone, SERVER_API, token } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);
  const [isScanned, setIsScanned] = useState(false);
  const [scannedPlate, setScannedPlate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

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

  const handleSearchPlateLicense = async (plate) => {
    if (!plate) return;

    setIsSearching(true);
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

      if (response.status !== 200 || !Array.isArray(response.data)) {
        console.warn("Unexpected response:", response);
        setSearchResult(null);
        return;
      }

      const matched = response.data.find(
        (user) => user.plate.toLowerCase() === plate.toLowerCase()
      );

      if (matched) {
        console.log("✅ Exact match found:", matched);
        setSearchResult(matched);
      } else {
        console.log("❌ No exact match found.");
        setSearchResult(null);
      }
    } catch (error) {
      console.error("❗ Error searching plate license:", error);
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBarcodeScanned = (barcode) => {
    if (isScanned || isLoading) return;

    setIsLoading(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      try {
        const raw = barcode?.data;
        console.log("Raw Barcode:", raw);

        let decoded = raw;
        if (/^[A-Za-z0-9+/=]+$/.test(raw)) {
          try {
            decoded = Buffer.from(raw, "base64").toString("utf-8");
          } catch (e) {
            console.log("Base64 decode failed, using raw");
          }
        }

        setScannedData(decoded);
        const plate = decoded.slice(0, 300).split("|")[1];
        console.log("🚀 Decoded plate:", plate);
        setScannedPlate(plate);
        setIsScanned(true);

        // Start search immediately with decoded plate
        handleSearchPlateLicense(plate);

        // Allow rescan after 5 seconds
        setTimeout(() => {
          setIsScanned(false);
        }, 5000);
      } catch (err) {
        console.error("Failed to handle barcode:", err);
      } finally {
        setIsLoading(false);
      }
    }, 400); // 400ms debounce
  };

  const handleRescan = () => {
    setScannedData(null);
    setScannedPlate(null);
    setSearchResult(null);
    setIsScanned(false);
    setIsLoading(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  return (
    <View style={styles.container}>
      <CameraView
        barcodeScannerSettings={{
          barcodeTypes: ["pdf417"],
        }}
        onBarcodeScanned={handleBarcodeScanned}
        style={styles.camera}
        facing="back"
      >
        {scannedPlate && (
          <View
            style={{
              position: "absolute",
              top: 100,
              left: 20,
              right: 20,
              height: 200,
              backgroundColor: "#fff",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 12,
              paddingVertical: 12,
            }}
          >
            {isSearching ? (
              <>
                <ActivityIndicator size="large" color="#000" />
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  Searching in Database for Plate License...
                </Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  Search Result:
                </Text>
                {searchResult ? (
                  <CurrentlyParking user={searchResult} />
                ) : (
                  <Text>No result found</Text>
                )}
              </>
            )}
          </View>
        )}

        <View style={styles.overlay}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <Text style={styles.message}>
              {scannedData ? scannedPlate : "Scan the Road Tax barcode Sticker"}
            </Text>
          )}
          {scannedData && (
            <Button
              title="Rescan"
              onPress={handleRescan}
              color="#fff"
              disabled={isLoading}
            />
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
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
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});
