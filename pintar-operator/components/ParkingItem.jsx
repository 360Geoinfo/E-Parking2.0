import { useSocket } from "@/context/socket";
import { MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ParkingItem = ({ parking, debug = false, withZoneData = false }) => {
  if (debug) {
    return (
      <SafeAreaView>
        <Text>{JSON.stringify(parking, null, 2)}</Text>
      </SafeAreaView>
    );
  }
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState();
  const { socket, operatorData } = useSocket();
  const [isMoreThanDuration, setIsMoreThanDuration] = useState(false);
  const [isMoreThanExtendedDuration, setIsMoreThanExtendedDuration] =
    useState(false);

  useEffect(() => {
    if (parking?.PETAKSTATUS === "Exit") {
      const startTime = dayjs(parking.STARTDATETIME);
      const storedEndTime = dayjs(parking.ENDDATETIME);
      const endTime = startTime.add(parking.DURATION, "hour");
      const extendedEndTime = endTime.add(10, "minute");
      if (!startTime.isValid() || !storedEndTime.isValid()) {
        setTimeLeft("Invalid start or end time");
        return;
      }
      setIsMoreThanDuration(endTime.diff(dayjs(parking.ENDDATETIME)) < 0);
      setIsMoreThanExtendedDuration(
        extendedEndTime.diff(dayjs(parking.ENDDATETIME)) < 0
      );
    }
  }, [parking.PETAKSTATUS, parking.DURATION]);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const startTime = dayjs(parking.STARTDATETIME);

        if (!startTime.isValid()) {
          setTimeLeft("Invalid start time");
          return;
        }

        const endTime = dayjs(parking.STARTDATETIME).add(
          parking.DURATION,
          "hour"
        );

        const diffMs = endTime.diff(dayjs());
        const diffExtendedMs = endTime.add(10, "minute").diff(dayjs());

        if (diffMs <= 0) {
          setTimeLeft("Expired");
        } else {
          if (!isNaN(diffMs)) {
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const minutes = Math.floor(
              (diffMs % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
          }
        }
      } catch (error) {
        setTimeLeft("Error");
      }
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [parking.STARTDATETIME, parking.DURATION]);

  const handleExtendNow = () => {
    Alert.prompt("Extend Parking Duration", "Enter new duration in hours:", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: (duration) => {
          socket.emit(
            "extendParkingDuration",
            {
              outdoorId: parking.OUTDOORID,
              operatorId: operatorData?.USERID,
              duration: parseInt(duration, 10),
            },
            (response) => {
              if (response.status === 200) {
                Alert.alert(
                  "Extension Successful",
                  "The parking duration has been extended."
                );
                router.reload();
              } else {
                Alert.alert(
                  "Extension Failed",
                  response.message || "Please try again."
                );
              }
            }
          );
        },
      },
    ]);
  };
  const handleFineNow = () => {
    socket.emit(
      "fineParking",
      {
        outdoorId: parking.OUTDOORID,
        operatorId: operatorData?.USERID,
      },
      (response) => {
        if (response.status === 200) {
          Alert.alert("Fine Successful", "The parking fine has been issued.");
        } else {
          Alert.alert("Fine Failed", response.message || "Please try again.");
        }
      }
    );
  };

  const actions = {
    ACTIVE: {
      buttons: [
        {
          text: "EXTEND",
          onPress: handleExtendNow,
          style: { backgroundColor: "#2567ea" },
        },
      ],
      statusStyle: { border: "#16A34A", bg: "#F0FDF4", text: "#16A34A" },
    },
    EXPIRED: {
      buttons: [
        {
          text: "EXTEND",
          onPress: handleExtendNow,
          style: { backgroundColor: "#2567ea" },
        },
      ],
      statusStyle: { border: "#9A39BA", bg: "#FEE2E2", text: "#DC2626" },
    },
    EXIT: {
      buttons: isMoreThanExtendedDuration
        ? [
            {
              text: "FINE",
              onPress: handleFineNow,
              style: { backgroundColor: "#FFBB00" },
            },
          ]
        : [],
      statusStyle: {
        border: "#AAAAAA",
        bg: "#F5F5F5",
        text: "#AAAAAA",
      },
    },
  };

  return (
    <View
      style={{
        backgroundColor: "#aaa",
        borderRadius: 10,
        minHeight: 200,
        overflow: "hidden",
        marginVertical: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          backgroundColor:
            actions[parking.PETAKSTATUS.toUpperCase()]?.statusStyle.bg,
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderColor:
            actions[parking.PETAKSTATUS.toUpperCase()]?.statusStyle.border,
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 20 }}>
          {parking.VEHICLE?.PLATLICENSE}
        </Text>
        <Text
          style={{
            color: actions[parking.PETAKSTATUS.toUpperCase()]?.statusStyle.text,
            fontWeight: "bold",
            fontSize: 20,
          }}
        >
          {parking.PETAKSTATUS}
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          backgroundColor: "#fff",
          paddingVertical: 10,
          width: "100%",
          flexGrow: 1,
        }}
      >
        <View
          style={{
            flexDirection: "column",
            justifyContent: "space-between",
            marginVertical: 10,
            paddingLeft: 20,
            flexGrow: 1,
            gap: 10,
          }}
        >
          <View
            style={{ flexDirection: "row", gap: 16, alignContent: "center" }}
          >
            <MaterialIcons name="access-time" size={24} />
            <View style={{ flexDirection: "column" }}>
              <Text style={{ fontSize: 12, color: "#888" }}>Masa Tamat</Text>
              <Text style={{ fontSize: 14, fontWeight: "medium" }}>
                {parking.ENDDATETIME
                  ? dayjs(parking.ENDDATETIME).format("DD/MM/YYYY H:mm A")
                  : "On Going"}
              </Text>
            </View>
          </View>
          <View
            style={{ flexDirection: "row", gap: 16, alignContent: "center" }}
          >
            <MaterialIcons name="event" size={24} />
            <View style={{ flexDirection: "column" }}>
              <Text style={{ fontSize: 12, color: "#888" }}>
                Tarikh & Masa Masuk
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "medium" }}>
                {dayjs(parking.STARTDATETIME).format("DD/MM/YYYY H:mm A")}
              </Text>
            </View>
          </View>
          {withZoneData && (
            <View
              style={{ flexDirection: "row", gap: 16, alignContent: "center" }}
            >
              <MaterialIcons name="pin-drop" size={24} />
              <View style={{ flexDirection: "column" }}>
                <Text style={{ fontSize: 12, color: "#888" }}>Zone</Text>
                <Text style={{ fontSize: 14, fontWeight: "medium" }}>
                  {parking?.ZONE?.CODE || "N/A"} -{" "}
                  {parking?.ZONE?.NAME || "N/A"}
                </Text>
              </View>
            </View>
          )}
        </View>
        <View
          style={{
            flexGrow: 1,
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <TouchableOpacity
            style={{
              flexGrow: 1,
              padding: 10,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
            onPress={() =>
              setTimeout(() => {
                router.push({
                  pathname: `/(tabs)/(home)/detail/${parking.OUTDOORID}`,
                  params: { outdoorId: parking.OUTDOORID },
                });
              }, 1000)
            }
          >
            <Text style={{ color: "#2567ea", fontWeight: "bold" }}>
              View Details
            </Text>
            <MaterialIcons name="chevron-right" color="#2567ea" size={20} />
          </TouchableOpacity>
          <Text
            style={{
              color: timeLeft === "Expired" ? "red" : "green",
              paddingRight: 20,
            }}
          >
            {timeLeft === "Expired"
              ? ""
              : ["Summon", "Cancelled", "Exit"].includes(parking.PETAKSTATUS)
              ? ""
              : `Time Left: ${timeLeft}`}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "center", flexDirection: "row" }}>
        {actions[parking.PETAKSTATUS.toUpperCase()]?.buttons?.map(
          (action, index) => (
            <TouchableOpacity
              key={index}
              style={{
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#ccc",
                backgroundColor: action.style?.backgroundColor || "#2567ea",
                padding: 16,
                width: `${Math.floor(
                  100 /
                    actions[parking.PETAKSTATUS.toUpperCase()]?.buttons?.length
                )}%`,
              }}
              onPress={action.onPress}
            >
              <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 16 }}>
                {action.text}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
      {/* <Text>{JSON.stringify(parking, null, 2)}</Text> */}
    </View>
  );
};

export default ParkingItem;
