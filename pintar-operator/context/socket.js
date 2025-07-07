// context/socket.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import "dayjs/locale/en"; // Ensure English is imported
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
import { io } from "socket.io-client";

dayjs.extend(utc);
dayjs.extend(timezone);

// Set locale (optional, default is en)
dayjs.locale("en");

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [operatorData, setOperatorData] = useState(null);
  const [requireReset, setRequireReset] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [zoneList, setZoneList] = useState([]);

  const router = useRouter();
  // Optionally set a default timezone for dayjs (not global)
  const getBruneiTime = (date = undefined) => {
    return dayjs(date).tz("Asia/Brunei");
  };
  const leaveOperatorRoom = () => {
    if (socketRef.current && operatorData?.USERID) {
      socketRef.current.emit(
        "leaveRoom",
        { room: `operator_${operatorData.ID}` },
        (res) => {
          console.log("Left operator room:", res);
        }
      );
    }
  };

  useEffect(() => {
    socketRef.current = io("https://server360.i-8ea.com", {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current.on("connect_error", (err) => {
      Alert.alert("Connection Error", err.message);
    });

    const loadStorage = async () => {
      try {
        const savedOperator = await AsyncStorage.getItem("operatorData");
        const savedAttendance = await AsyncStorage.getItem("attendanceData");
        if (savedOperator) setOperatorData(JSON.parse(savedOperator));
        if (savedAttendance) setAttendanceData(JSON.parse(savedAttendance));
      } finally {
        setLoading(false);
      }
    };

    loadStorage();

    return () => socketRef.current?.disconnect();
  }, []);
  useEffect(() => {
    if (!socketRef.current) return;
    if (zoneList.length === 0) {
      socketRef.current.emit("getZone", async (response) => {
        if (response.status === 200) {
          setZoneList(response.data.filter((zone) => zone.TYPE === "OUTDOOR"));
        } else {
          console.error("Failed to fetch zones:", response.message);
        }
      });
    }
  }, [zoneList]);

  const login = async (credentials) => {
    socketRef.current.emit("loginOperator", credentials, async (res) => {
      if (res.status === 200) {
        setOperatorData(res.data);
        setRequireReset(res.firstTime);
        await AsyncStorage.setItem("operatorData", JSON.stringify(res.data));
        await SecureStore.setItemAsync(
          "credentials",
          JSON.stringify(credentials)
        );
        Alert.alert("Login Successful");
      } else {
        Alert.alert("Login Failed", res.message);
      }
    });
  };

  const clockOut = async () => {
    if (!operatorData?.USERID) {
      Alert.alert("Error", "You must be logged in to clock out.");
      return;
    }
    setIsLoggingOut(true);
    socketRef.current.emit(
      "clockOut",
      {
        attendanceID: attendanceData?.[0]?.ID,
        operatorID: operatorData.USERID,
      },
      async (res) => {
        if (res.status === 200) {
          setAttendanceData(res.data || null);
          await AsyncStorage.setItem(
            "attendanceData",
            JSON.stringify(res.data)
          );
          Alert.alert(
            "Clock Out Successful",
            "You have clocked out successfully.",
            [
              {
                text: "OK",
                onPress: () => {
                  router.replace("/");
                  setIsLoggingOut(false);
                },
              },
            ]
          );
        } else {
          Alert.alert("Clock Out Failed", res.message);
        }
      }
    );
  };

  const logout = async () => {
    if (!operatorData?.USERID) return;
    setIsLoggingOut(true);
    if (!attendanceData?.[0]?.ID) {
      socketRef.current.emit(
        "logoutOperatorOnly",
        { operatorID: operatorData.USERID },
        async ({ status, message }) => {
          setIsLoggingOut(false);
          if (status === 200) {
            setOperatorData(null);
            await AsyncStorage.clear();
            leaveOperatorRoom();
          } else {
            return Alert.alert("Logout Failed", message);
          }
        }
      );
    } else {
      socketRef.current.emit(
        "logoutOperator",
        {
          attendanceID: attendanceData?.[0]?.ID,
          operatorID: operatorData.USERID,
        },
        async ({ status, message }) => {
          if (status === 200) {
            // Clear local state immediately
            setOperatorData(null);
            setAttendanceData(null);

            // Leave socket room
            leaveOperatorRoom();

            // Clear storage
            await AsyncStorage.clear();
            // Confirm logout after all
            return Alert.alert("Logout Successful", message, [
              {
                text: "OK",
                onPress: () => {
                  router.replace("/");
                  leaveOperatorRoom();
                  setIsLoggingOut(false);
                },
              },
            ]);
          } else {
            setIsLoggingOut(false);
            // await AsyncStorage.clear();
            // setAttendanceData(null);
            // setOperatorData(null);
            // leaveOperatorRoom();
            return Alert.alert("Logout Failed", message);
          }
        }
      );
    }
  };

  const handleZoneSelection = (zone) => {
    console.log("Selected Zone:", zone);
    console.log("Operator Data:", operatorData);
    if (!zone || !operatorData?.USERID) {
      Alert.alert(
        "Error",
        "Please select a valid zone and ensure you are logged in."
      );
      return;
    }
    socketRef.current.emit(
      "clockIn",
      { zone: zone.CODE, operatorID: operatorData.USERID },
      async (res) => {
        if (res.status === 200) {
          setAttendanceData(Array.isArray(res.data) ? res.data : [res.data]);
          await AsyncStorage.setItem(
            "attendanceData",
            JSON.stringify(res.data)
          );
          Alert.alert("Clock In Successful");
        } else {
          Alert.alert("Clock In Failed", res.message);
        }
      }
    );
  };

  const resetPassword = async ({ email, password }) => {
    if (!operatorData?.USERID) {
      Alert.alert("Error", "You must be logged in to reset your password.");
      return;
    }
    socketRef.current.emit(
      "resetPasswordOperator",
      { email, password, operatorID: operatorData.USERID },
      (res) => {
        if (res.status === 200) {
          Alert.alert("Password Reset Successful", res.message, [
            {
              text: "OK",
              onPress: () => {
                setRequireReset(false);
                setTimeout(() => {
                  router.replace("/");
                }, 1500);
              },
            },
          ]);
        } else {
          Alert.alert("Password Reset Failed", res.message);
        }
      }
    );
  };

  const requestResetPassword = async (email) => {
    if (!email) {
      Alert.alert("Error", "Email is required for password reset.");
      return;
    }
    socketRef.current.emit("requestResetPassword", { email }, (res) => {
      if (res.status === 200) {
        Alert.alert("Password Reset Requested", res.message);
      } else {
        Alert.alert("Password Reset Failed", res.message);
      }
    });
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        operatorData,
        attendanceData,
        loading,
        isLoggingOut,
        zoneList,
        requireReset,
        login,
        logout,
        handleZoneSelection,
        clockOut,
        setRequireReset,
        resetPassword,
        requestResetPassword,
        dayjs,
        getBruneiTime,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
