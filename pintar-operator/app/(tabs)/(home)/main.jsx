import AddParkingForm from "@/components/addParking";
import FineParking from "@/components/FineParking";
import ParkingItem from "@/components/ParkingItem";
import Searchbar from "@/components/Searchbar";
import { useSocket } from "@/context/socket";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { socket, attendanceData, zoneList } = useSocket();
  const [query, setQuery] = useState("");
  const [currentlyParking, setCurrentlyParking] = useState([]);
  const [filteredParking, setFilteredParking] = useState(currentlyParking);
  const [showMenu, setShowMenu] = useState(false);
  const [addParkingShow, setAddParkingShow] = useState(false);
  const [fineParkingShow, setFineParkingShow] = useState(false);
  const [menuAnim] = useState(new Animated.Value(0)); // 0 = hidden, 1 = visible
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const floatings = [
    {
      icon: "camera-alt",
      onPress: () => {
        setShowMenu(false);
        return router.push("/lprCamera");
      },
    },
    {
      icon: "attach-money",
      onPress: () => {
        setShowMenu(false);
        setFineParkingShow(true);
      },
    },
    {
      icon: "add",
      onPress: () => {
        setShowMenu(false);
        setAddParkingShow(true);
      },
    },
  ];

  const displayZone = (zoneID) => {
    const zone = zoneList.find((z) => z.ID == zoneID); // loose equality to support both string and number

    return zone;
  };

  const handleRefresh = async () => {
    setLoading(true);
    socket.emit(
      "parkingData",
      { zoneCode: displayZone(attendanceData?.[0]?.ZONE_ID)?.CODE },
      async ({ status, message, data }) => {
        console.log("🚗 Parking data received:", { status, message, data });
        if (status === 200) {
          console.log("🚗 Sorted parking data:", JSON.stringify(data, null, 2));

          setFilteredParking(data);
          setCurrentlyParking(data);
        } else if (status === 404) {
          setFilteredParking([]);
          setCurrentlyParking([]);
        }
      }
    );
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleSearchPlate = (text) => {
    setQuery(text.toUpperCase());
    setIsSearching(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (text.length >= 2) {
      const filtered = currentlyParking.filter((item) =>
        item.PLATLICENSE?.toUpperCase().includes(text.toUpperCase())
      );
      setFilteredParking(filtered);
    } else {
      setFilteredParking(currentlyParking); // fallback to all
    }

    debounceRef.current = setTimeout(() => {
      setIsSearching(false);
    }, 1500);
  };

  useFocusEffect(
    useCallback(() => {
      if (!attendanceData || !attendanceData?.[0]?.ZONE_ID) return; // ✅ prevent null access
      console.log("attendanceData:", attendanceData[0]);

      try {
        console.log(
          "🔄 Fetching parking data for zone:",
          displayZone(attendanceData?.[0]?.ZONE_ID)?.CODE
        );

        socket.emit(
          "parkingData",
          { zoneCode: displayZone(attendanceData?.[0]?.ZONE_ID)?.CODE },
          async ({ status, message, data }) => {
            console.log("🚗 Parking data received:", { status, message, data });
            if (status === 200) {
              setFilteredParking(data);
              setCurrentlyParking(data);
            } else if (status === 404) {
              setFilteredParking([]);
              setCurrentlyParking([]);
            }
          }
        );
      } catch (error) {
        Alert.alert("Error", "Failed to fetch parking data. Please refresh.");
      }
    }, [attendanceData, socket])
  );

  useEffect(() => {
    Animated.spring(menuAnim, {
      toValue: showMenu ? 1 : 0,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [showMenu]);

  useEffect(() => {
    const handleFined = () => {
      console.log("🚨 Parking fined, reloading...");
      router.reload(); // or any custom refresh logic
    };
    // const handleFetchParkingData = async ({ outdoorId }) => {
    //   console.log("🔄 Fetching parking data for outdoorId:", outdoorId);

    //   socket.emit(
    //     "fetchAParkingData",
    //     {
    //       outdoorId,
    //     },
    //     (response) => {
    //       if (response.status === 200) {
    //         const data = response.data;
    //         console.log("🚗 Parking data fetched:", data);
    //         setFilteredParking((prev) =>
    //           prev.map((item) =>
    //             item.OUTDOORID === data.OUTDOORID ? data : item
    //           )
    //         );
    //       }
    //     }
    //   );
    // };

    socket.on("parkingFined", handleFined);
    socket.on("paymentStatusUpdated", handleFined);
    socket.on("parkingExited", handleFined);
    socket.on("parkingExitedLate", handleFined);
    socket.on("parkingDurationExtended", handleFined);

    return () => {
      socket.off("parkingFined", handleFined);
      socket.off("paymentStatusUpdated", handleFined);
      socket.off("parkingExited", handleFined);
      socket.off("parkingExitedLate", handleFined);
      socket.off("parkingDurationExtended", handleFined);
    };
  }, [socket]);

  // PETAKSTATUS ORDER : ACTIVE, UNPAID, EXPIRED, SUMMON, CANCELLED, EXIT

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 60, // to avoid overlap with search bar
        backgroundColor: "#f0f8ff",
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {addParkingShow && (
        // Overlay for Add Parking
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100,
            padding: 20,
          }}
        >
          <AddParkingForm onClose={() => setAddParkingShow(false)} />
        </View>
      )}
      {fineParkingShow && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100,
            padding: 20,
          }}
        >
          <FineParking onClose={() => setFineParkingShow(false)} />
        </View>
      )}
      <View
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          padding: 10,
          zIndex: 1000,
        }}
      >
        <Searchbar query={query} setQuery={handleSearchPlate} />
        <TouchableOpacity onPress={handleRefresh}>
          <MaterialIcons
            name="refresh"
            size={24}
            color="#2567ea"
            // onPress={handleRefresh}
          />
        </TouchableOpacity>
      </View>

      {/* List of Currently Parking */}
      <Text style={{ fontSize: 25, fontWeight: "bold", padding: 20 }}>
        Currently Parking in{" "}
        <Text style={{ color: "#2567ea" }}>
          Zone {displayZone(attendanceData?.[0]?.ZONE_ID)?.CODE}
        </Text>
      </Text>
      <ScrollView
        style={{
          width: "100%",
          paddingHorizontal: 20,
          flexDirection: "column",
          gap: 10,
        }}
      >
        {loading ? (
          <View
            style={{
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, color: "#888", padding: 20 }}>
              Loading...
            </Text>
          </View>
        ) : !isSearching ? (
          filteredParking.length > 0 ? (
            filteredParking.map((parking) => (
              <ParkingItem key={parking.OUTDOORID} parking={parking} />
            ))
          ) : (
            <View
              style={{
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 18, color: "#888", padding: 20 }}>
                {query
                  ? `No parking found for "${query}". Try searching with a different plate.`
                  : `No parking data available.`}
              </Text>
            </View>
          )
        ) : (
          <View
            style={{
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, color: "#888", padding: 20 }}>
              Searching...
            </Text>
          </View>
        )}
      </ScrollView>
      <View
        style={{
          position: "absolute",
          bottom: 100,
          right: 20,
          alignItems: "center",
          flexDirection: "column-reverse",
        }}
      >
        {/* Item 1 */}
        <Animated.View
          style={{
            transform: [
              {
                scale: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
              {
                translateY: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 1], // from 30px lower to original
                }),
              },
            ],
            marginBottom: 10,
          }}
        >
          {floatings.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: "#2567ea",
                borderRadius: 50,
                width: 56,
                height: 56,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: index === floatings.length - 1 ? 0 : 10,
              }}
              onPress={item.onPress}
            >
              <MaterialIcons name={item.icon} size={24} color="white" />
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>

      {/* Plus button Bottom Right */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#2567ea",
          borderRadius: 50,
          width: 56,
          height: 56,
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={() => setShowMenu(!showMenu)}
      >
        <Text style={{ color: "white", fontSize: 24 }}>
          <MaterialIcons name={showMenu ? "close" : "menu"} size={40} />
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
