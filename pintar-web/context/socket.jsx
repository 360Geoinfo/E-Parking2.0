import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [superAdmin, setSuperAdmin] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [zoneList, setZonelist] = useState(null);

  const fetchZoneList = async () => {
    console.log("Fetching Zone List from Server...");

    socketRef.current.emit("getZone", (res) => {
      console.log("Zone List Response: ", res);

      if (res.status === 200) {
        setZonelist(res.data);
      }
    });
  };
  useEffect(() => {
    socketRef.current = io("https://server360.i-8ea.com", {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current.on("connect_error", (err) => {
      console.log("Socket Connection Error: ", err);

      alert(`Connection Error, ${JSON.stringify(err)}`);
    });

    const loadAllStoredData = async () => {
      setIsLoadingData(true);
      try {
        const storedSuperAdmin = localStorage.getItem("superAdmin");
        if (!zoneList) {
          fetchZoneList();
        }
      } catch (error) {
        alert("Failed to fetch Stored Data");
      } finally {
        setTimeout(() => {
          setIsLoadingData(false);
        }, 5000);
      }
    };

    loadAllStoredData();
  }, []);
  const leaveSuperAdminRoom = () => {
    if (socketRef.current && superAdmin?.USERID) {
      socketRef.current.emit(
        "leaveRoom",
        {
          room: `superadmin_${superAdmin.ID}`,
        },
        (res) => {
          console.log("super admin left the live notification room: ", res);
        }
      );
    }
  };

  const login = async (credentials) => {
    const { username, email, password } = credentials;

    socketRef.current.emit(
      "loginSuperAdmin",
      { username, email, password },
      async (res) => {
        if (res.status === 200) {
          setSuperAdmin(res.data);
          localStorage.setItem("superAdmin", JSON.stringify(res.data));
          alert("Successfully Logged in");
        } else {
          alert("Failed to Log in");
        }
      }
    );
  };

  const logout = async () => {
    socketRef.current.emit(
      "logoutSuperAdmin",
      {
        superAdminID: superAdmin.ID,
      },
      async (res) => {
        if (res.status === 200) {
          setSuperAdmin(null);
          leaveSuperAdminRoom();

          localStorage.removeItem("superAdmin");

          alert("SuccessfullyLogged Out");
        } else {
          alert("Failed to Log Out");
        }
      }
    );
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        superAdmin,
        login,
        logout,
        isLoadingData,
        zoneList,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

export { SocketProvider };
