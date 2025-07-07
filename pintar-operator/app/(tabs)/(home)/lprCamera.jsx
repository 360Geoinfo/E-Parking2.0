import ParkingItem from "@/components/ParkingItem";
import { useSocket } from "@/context/socket";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Swiper from "react-native-swiper";

const { width } = Dimensions.get("window");

export default function LPRCamerav2() {
  const router = useRouter();
  const { attendanceData, socket, zoneList } = useSocket();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedPlate, setScannedPlate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isTakenPicture, setIsTakenPicture] = useState(false);
  const [searchResult, setSearchResult] = useState({});
  const [isCooldown, setIsCooldown] = useState(false);
  const [zoom, setZoom] = useState(0.5);

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
  const displayZone = (zoneID) => {
    const zone = zoneList.find((z) => z.ID == zoneID); // loose equality to support both string and number

    return zone;
  };

  const statusOrder = {
    ACTIVE: 1,
    UNPAID: 2,
    EXPIRED: 3,
    SUMMON: 4,
    CANCELLED: 5,
    EXIT: 6,
  };

  const handleSearchPlate = async (plate) => {
    if (!plate) return;
    setIsSearching(true);
    try {
      socket.emit(
        "searchParkedPlate",
        { plate, zone: displayZone(attendanceData?.[0]?.ZONE_ID)?.CODE },
        (response) => {
          if (response.status === 200) {
            response.data.sort((a, b) => {
              const statusA = statusOrder[a.PETAKSTATUS?.toUpperCase()] ?? 99;
              const statusB = statusOrder[b.PETAKSTATUS?.toUpperCase()] ?? 99;

              if (statusA !== statusB) return statusA - statusB;

              const dateA = new Date(a.STARTDATETIME);
              const dateB = new Date(b.STARTDATETIME);

              return dateB - dateA; // 🔁 Newest first
            });

            setSearchResult(response.data);
          } else {
            setSearchResult({});
          }
          setIsSearching(false);
        }
      );
    } catch (error) {
      Alert.alert(
        "Error",
        `Failed to fetch parking information. ${error.message}`
      );
      setSearchResult({});
      setIsSearching(false);
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
    if (isCooldown || isLoading) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    setIsLoading(true);
    setIsTakenPicture(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: true,
      });

      socket.emit("extractPlate", photo.base64, (response) => {
        if (response.status === 200) {
          setIsLoading(false);
          const plate = response.data.plate;
          setScannedPlate(plate);

          setIsCooldown(true);
          debounceRef.current = setTimeout(() => {
            setIsCooldown(false);
          }, 5000);

          // 🔥 FIX: move the handleSearchPlate inside the callback, and also move setIsLoading(false) AFTER search completes
          handleSearchPlate(plate);
        } else {
          Alert.alert("Error", "Failed to extract plate from image.");
          setIsLoading(false);
        }
      });
    } catch (error) {
      Alert.alert("Error", "Failed to process the image. Please try again.");
      setScannedPlate(null);
      setSearchResult({});
      setIsTakenPicture(false);
      setIsLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        ref={cameraRef}
        onCameraReady={() => setZoom(0.5)}
        zoom={zoom}
        autofocus="on"
        ratio="1:1"
      />
      <TouchableOpacity
        style={{
          position: "absolute",
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          top: 10,
          left: 10,
        }}
        onPress={() => router.back()}
      >
        <MaterialIcons name="chevron-left" size={20} color="#fff" />
        <Text style={{ color: "#fff", fontSize: 20 }}>Back</Text>
      </TouchableOpacity>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {scannedPlate && (
        <View style={styles.overlay1}>
          {searchResult?.length > 0 ? (
            <Swiper
              loop={false}
              showsPagination={true}
              index={0}
              style={{ height: 350 }}
              dotStyle={{ backgroundColor: "#ccc" }}
              activeDotStyle={{ backgroundColor: "#2567ea" }}
            >
              {searchResult.map((item, index) => (
                <View
                  key={item.OUTDOORID || index}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingBottom: 40,
                  }}
                >
                  <ParkingItem
                    debug={false}
                    parking={item}
                    withZoneData={true}
                  />
                </View>
              ))}
            </Swiper>
          ) : (
            <Text style={{ textAlign: "center", color: "#888" }}>
              No results found
            </Text>
          )}
        </View>
      )}

      {Object.keys(searchResult).length === 0 && (
        <View style={styles.frameBoxContainer}>
          <View style={styles.frameBox} />
        </View>
      )}

      <View style={styles.overlay}>
        {(scannedPlate || isLoading || searchResult?.plate) && (
          <>
            <Text style={styles.message}>
              {isLoading
                ? "Sedang memuatkan maklumat parkir..."
                : scannedPlate
                ? `Nombor Plat: ${scannedPlate}`
                : "Sila berdiri 1-5 kaki dari kamera untuk mengimbas plat kenderaan."}
            </Text>
          </>
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
            size={60}
            color="#fff"
          />
        </TouchableOpacity>
        <Text style={styles.buttonText}>
          {isCooldown
            ? "Sila tunggu..."
            : isTakenPicture
            ? "Imbas Semula"
            : "Imbas"}
        </Text>
      </View>
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

  overlay1: {
    position: "absolute",
    bottom: 230,
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
    textAlign: "center",
    color: "#fff",
  },
  button: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#0B477B",
    borderRadius: 100,
  },
  buttonText: {
    textAlign: "center",
    fontSize: 16,
    color: "#fff",
    width: 100,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  frameBoxContainer: {
    width: "100%",
    height: "100%",
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  frameBox: {
    width: 300, // Adjust size as needed
    height: 200, // 1:1 ratio
    borderWidth: 2,
    borderColor: "#00FF00",
    borderStyle: "dashed",
  },
});
