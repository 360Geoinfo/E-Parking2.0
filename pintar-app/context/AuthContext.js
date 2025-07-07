import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { io } from "socket.io-client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const SERVER_API = "https://temp_db_360.byjae.dev";
  const socketRef = useRef(null);
  socketRef.current = io(SERVER_API, {
    transports: ["websocket"],
    reconnection: true,
  });
  // const SERVER_API = "http://192.168.102.55:3001";
  const [userRole, setUserRole] = useState(null); // 'customer' or 'operator'
  const [user, setUser] = useState(null); // holds user info like username
  const [zone, setZone] = useState(null); // holds zone info if needed
  const [token, setToken] = useState(null); // holds auth token if needed
  const [attendanceData, setAttendanceData] = useState({
    id: null,
    clockin: null,
    clockout: null,
    lastClockOut: null,
    zone: zone || null,
  }); // holds attendance data

  const login = (role, userData) => {
    if (role !== "customer" && role !== "operator") {
      console.warn("Invalid role passed to login");
      return;
    }

    setUserRole(role);
    setUser(userData);

    if (role === "operator") {
      setZone(zone); // Assuming userData contains zone info for operators
    }

    // Optional: Save to local storage for persistence
    // localStorage.setItem('userRole', role);
    // localStorage.setItem('user', JSON.stringify(userData));
  };

  const setUserZone = async (zone) => {
    if (!zone) {
      await AsyncStorage.removeItem("zone");
      setZone(null);
      return;
    }
    await AsyncStorage.setItem("zone", zone);
    setZone(zone);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("userRole");
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("userData");
    await AsyncStorage.removeItem("zone");
    await AsyncStorage.removeItem("attendanceData");

    setUserRole(null);
    setUser(null);
    setToken(null);
    setZone(null);
    setAttendanceData({
      id: null,
      clockin: null,
      clockout: null,
      lastClockOut: null,
      zone: null,
    });

    // Optional: Clear local storage
    // localStorage.removeItem('userRole');
    // localStorage.removeItem('user');
  };

  const setOperatorAttendanceData = async (attendanceData) => {
    await AsyncStorage.setItem(
      "attendanceData",
      JSON.stringify(attendanceData)
    );
    setAttendanceData(attendanceData);
  };
  const loadAll = async () => {
    const storedZone = await AsyncStorage.getItem("zone");
    const storedRole = await AsyncStorage.getItem("userRole");
    const storedUser = await AsyncStorage.getItem("user");
    const storedToken = await AsyncStorage.getItem("token");
    // const storedAttendanceData = await AsyncStorage.getItem("attendanceData");
    console.log("Loading from local storage:", {
      storedZone,
      storedRole,
      storedUser,
      storedToken,
      // storedAttendanceData,
    });

    if (storedZone) {
      setZone(storedZone);
    }
    if (storedRole) {
      setUserRole(storedRole);
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedToken) {
      setToken(storedToken);
    }
    fetchZoneList(); // Fetch zone list on load
    // if (storedAttendanceData) {
    //   setAttendanceData(JSON.parse(storedAttendanceData));
    // }
  };

  useEffect(() => {
    loadAll();
  }, [navigator]);

  // Optional: Auto-load from local storage on mount
  // useEffect(() => {
  //   const storedRole = localStorage.getItem('userRole');
  //   const storedUser = JSON.parse(localStorage.getItem('user'));
  //   if (storedRole && storedUser) {
  //     setUserRole(storedRole);
  //     setUser(storedUser);
  //   }
  // }, []);
  //   1	A	Lorong PGGMB	04-JUN-25 01.22.38.939000000 PM	04-JUN-25 01.22.38.939000000 PM
  // 2	B	Jalan Pemancha	04-JUN-25 01.22.38.954000000 PM	04-JUN-25 01.22.38.954000000 PM
  // 3	C	Jalan Cator, Lorong Panggung Bolkiah, Sepanjang Jalan Kianggeh	04-JUN-25 01.22.38.958000000 PM	04-JUN-25 01.22.38.958000000 PM
  // 4	D	Jalan McArthur	04-JUN-25 01.22.38.962000000 PM	04-JUN-25 01.22.38.962000000 PM
  // 5	E	Jalan Roberts	04-JUN-25 01.22.38.967000000 PM	04-JUN-25 01.22.38.967000000 PM
  // 6	F	Jalan Elizabeth II	04-JUN-25 01.22.38.972000000 PM	04-JUN-25 01.22.38.972000000 PM
  const backupZones = [
    { id: 1, code: "A", name: "Lorong PGGMB" },
    { id: 2, code: "B", name: "Jalan Pemancha" },
    {
      id: 3,
      code: "C",
      name: "Jalan Cator, Lorong Panggung Bolkiah, Sepanjang Jalan Kianggeh",
    },
    { id: 4, code: "D", name: "Jalan McArthur" },
    { id: 5, code: "E", name: "Jalan Roberts" },
    { id: 6, code: "F", name: "Jalan Elizabeth II" },
  ];

  return (
    <AuthContext.Provider
      value={{
        userRole,
        user,
        zone,
        token,
        attendanceData,
        SERVER_API,
        socket: socketRef.current,
        backupZones,
        setUserZone,
        login,
        logout,
        setOperatorAttendanceData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
