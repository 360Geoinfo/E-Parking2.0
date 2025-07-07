import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import dayjs from "dayjs";
import "dayjs/locale/ms"; // Malay/Brunei
import { useFocusEffect } from "@react-navigation/native";

export default function Attendance({ onClockin, onClockOut }) {
  const {
    user,
    zone,
    setUserZone,
    setOperatorAttendanceData,
    attendanceData,
    SERVER_API,
  } = useAuth();
  const [currentTime, setCurrentTime] = useState(dayjs());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Get last clock out data from server
  const fetchLastClockOut = async () => {
    const res = await axios.post(`${SERVER_API}/attendance`, {
      userID: user.userID,
      zone,
    });
    console.log("Fetched attendance data:", res.data);

    const clockinRaw = res.data.clockin;
    const clockoutRaw = res.data.clockout;
    const lastClockOutRaw = res.data.lastClockOut;

    const parseFormat = "DD-MMM-YY hh.mm.ss.SSSSSS A Z"; // Oracle format pattern (we'll adjust)

    const clockinTime = clockinRaw ? dayjs(clockinRaw) : null;
    const clockoutTime = clockoutRaw ? dayjs(clockoutRaw) : null;
    const lastClockOutTime = lastClockOutRaw ? dayjs(lastClockOutRaw) : null;

    if (!clockoutTime) {
      setOperatorAttendanceData({
        id: res.data.id,
        clockin: clockinTime,
        clockout: clockoutTime,
        lastClockOut: null,
        zone: res.data.zone || zone,
      });
      setUserZone(res.data.zone || zone);
    } else {
      setOperatorAttendanceData({
        id: res.data.id,
        clockin: clockinTime,
        clockout: clockoutTime,
        lastClockOut: lastClockOutTime,
        zone: res.data.zone || zone,
      });
    }
  };

  const handleClockIn = async () => {
    console.log("Clocking in for user:", user.userID, "at zone:", zone);

    const response = await axios.post(`${SERVER_API}/clockin`, {
      userID: user.userID,
      zone,
    });
    if (response.status !== 200) {
      Alert.alert("Ralat", "Gagal melakukan Clock In. Sila cuba lagi.");
      return;
    }
    console.log("fething Last Clock Out after clocking in");

    fetchLastClockOut(); // update after clocking in
    Alert.alert("Berjaya", "Anda telah berjaya melakukan Clock In.", [
      {
        text: "OK",
        onPress: () => {
          if (onClockin) onClockin(); // Call the callback if provided
        },
      },
    ]);
  };

  const handleClockOut = async () => {
    console.log("Clocking out for user:", user.userID, "at zone:", zone);

    const response = await axios.post(`${SERVER_API}/clockout`, {
      id: attendanceData.id,
    });
    if (response.status !== 200) {
      Alert.alert("Ralat", "Gagal melakukan Clock Out. Sila cuba lagi.");
      return;
    }
    setOperatorAttendanceData((prevData) => ({
      ...prevData,
      clockout: dayjs(), // set current time as clockout
      lastClockOut: dayjs(), // update last clock out to current time
    }));
    console.log("fething Last Clock Out after clocking out");
    fetchLastClockOut(); // update after clocking out
    Alert.alert("Berjaya", "Anda telah berjaya melakukan Clock Out.", [
      {
        text: "OK",
        onPress: async () => {
          if (onClockOut) {
            setUserZone(null); // reset zone after clocking out
            onClockOut();
          }
        },
      },
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      console.log("Attendance screen focused, fetching last clock out data");
      fetchLastClockOut();
    }, [])
  );
  useEffect(() => {
    console.log("Attendance data updated:", attendanceData);
  }, [attendanceData]);

  return (
    <>
      <TouchableOpacity
        style={styles.locationContainer}
        onPress={() => {
          if (!attendanceData.clockin) {
            setUserZone(null);
            setOperatorAttendanceData((prevData) => ({
              ...prevData,
              zone: null,
            }));
          } else {
            Alert.alert(
              "Zone Tidak Boleh Diubah",
              "Anda telah melakukan Clock In. Sila Clock Out dahulu sebelum mengubah zon."
            );
          }
        }}
      >
        <FontAwesome name="map-marker" size={16} color="#007AFF" />
        <Text style={styles.zoneText}>Zon {zone}</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            alignItems: "center",
            width: "40%",
            borderColor: "#ccc",
            borderWidth: 1,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text>Clock In</Text>
          <Text style={styles.timeText}>
            {attendanceData.clockin
              ? attendanceData.clockin.locale("ms").format("hh:mm A")
              : "--:--"}
          </Text>
        </View>
        <View
          style={{
            alignItems: "center",
            width: "40%",
            borderColor: "#ccc",
            borderWidth: 1,
            paddingVertical: 10,
            borderRadius: 10,
          }}
        >
          <Text>Clock out</Text>
          <Text style={styles.timeText}>
            {attendanceData.clockout
              ? attendanceData.clockout.locale("ms").format("hh:mm A")
              : "--:--"}
          </Text>
        </View>
      </View>
      <Text style={styles.dateText}>
        {currentTime.locale("ms").format("dddd, D MMMM YYYY")}
      </Text>

      <TouchableOpacity
        style={
          !attendanceData.clockin && attendanceData.zone
            ? styles.buttonClockIn
            : styles.buttonClockOut
        }
        onPress={
          !attendanceData.clockin && attendanceData.zone
            ? handleClockIn
            : handleClockOut
        }
      >
        <FontAwesome name="clock-o" size={20} color="#fff" />
        <Text style={styles.buttonText}>
          {" "}
          {!attendanceData.clockin && attendanceData.zone
            ? "Clock In"
            : "Clock Out"}
        </Text>
      </TouchableOpacity>

      {attendanceData.lastClockOut && (
        <Text style={styles.lastClockOutText}>
          Terakhir Clock Out:{" "}
          {attendanceData.lastClockOut
            .locale("ms")
            .format("dddd, D MMMM YYYY, hh:mm A")}
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: "center",
    gap: 10,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  zoneText: {
    marginLeft: 5,
    color: "#007AFF",
    fontWeight: "600",
    textDecorationLine: "underline",
    fontSize: 16,
  },
  timeText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 14,
    color: "#555",
  },
  buttonClockIn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "90%",
  },
  buttonClockOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc3545",
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "90%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  lastClockOutText: {
    marginTop: 10,
    fontSize: 12,
    color: "#888",
  },
});
