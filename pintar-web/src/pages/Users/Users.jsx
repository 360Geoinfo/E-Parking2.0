import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useSocket } from "../../../context/socket"; // Adjust the path if needed
import "./Users.css";

export default function Users() {
  const { socket } = useSocket();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.emit("fetchAllUsers", (res) => {
      if (res.status === 200) {
        setUsers(res.data);
        setFilteredUsers(res.data);
        setActiveUsers(
          res.data.filter((user) => user.LOGINSTATUS === "LOG IN").length
        );
      } else {
        console.error("❌ Failed to fetch users:", res.message);
      }
    });
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on("newUserLogin", (res) => {
      if (res.status === 200) {
        setActiveUsers((prev) => prev + 1);
        setFilteredUsers((prev) =>
          prev.map((user) =>
            user.USERID === res.USERID
              ? { ...user, LOGINSTATUS: "LOG IN" }
              : user
          )
        );
      }
    });

    socket.on("userLoggedOut", (res) => {
      if (res.status === 200) {
        setActiveUsers((prev) => prev - 1);
        setFilteredUsers((prev) =>
          prev.map((user) =>
            user.USERID === res.USERID
              ? { ...user, LOGINSTATUS: "LOG OUT" }
              : user
          )
        );
      }
    });

    socket.on("petakTopUp", (res) => {
      if (res.status === 200) {
        setUsers((prev) =>
          prev.map((user) =>
            user.USERID === res.USERID ? { ...user, PETAK: res.PETAK } : user
          )
        );
        setFilteredUsers((prev) =>
          prev.map((user) =>
            user.USERID === res.USERID ? { ...user, PETAK: res.PETAK } : user
          )
        );
        console.log("Petak top-up successful:", res.message);
      }
    });

    socket.on("petakDeduct", (res) => {
      if (res.status === 200) {
        setUsers((prev) =>
          prev.map((user) =>
            user.USERID === res.USERID ? { ...user, PETAK: res.PETAK } : user
          )
        );
        setFilteredUsers((prev) =>
          prev.map((user) =>
            user.USERID === res.USERID ? { ...user, PETAK: res.PETAK } : user
          )
        );
        console.log("Petak deduction successful:", res.message);
      }
    });
    return () => {
      socket.off("newUserLogin");
      socket.off("userLoggedOut");
      socket.off("petakTopUp");
      socket.off("petakDeduct");
    };
  }, [socket]);

  const handleSearch = (e) => {
    if (!e.target.value) {
      setFilteredUsers(users);
    }
    setSearchTerm(e.target.value);
    const filteredUsers = users?.filter((user) => {
      const searchValue = e.target.value.toLowerCase();
      return (
        user.USERID.toString().includes(searchValue) ||
        user.VEHICLE.find((v) => v.toLowerCase().includes(searchValue)) ||
        user.USERNAME.toLowerCase().includes(searchValue)
      );
    });
    setFilteredUsers(filteredUsers);
  };

  const handleDelete = (userId) => {
    // Example socket delete event
    socket.emit("deleteUser", { userId }, (res) => {
      if (res.status === 200) {
        setUsers((prev) => prev.filter((u) => u.USERID !== userId));
      } else {
        console.error("❌ Failed to delete user:", res.message);
      }
    });
  };

  return (
    <>
      <div className="cards">
        <div className="card total-users">
          <h3>Total Registered Users</h3>
          <p>{users.length}</p>
          <span className="card-subtext">Registered in the system</span>
        </div>
        <div className="card active-users">
          <h3>Active Users</h3>
          <p>150</p>
          <span className="card-subtext">Logged in this month</span>
        </div>
        <div className="card login-today">
          <h3>Users Logged In Today</h3>
          <p>{activeUsers}</p>
          <span className="card-subtext">Activity from today</span>
        </div>
      </div>

      <div className="data-section flex flex-col gap-10">
        <div className="search-bar">
          <input
            type="text"
            placeholder="User ID or Plate License..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <FaSearch className="search-icon" />
        </div>
        {/* <pre className="ml-100 text-wrap w-screen">
          {JSON.stringify(users[0], null, 2)}
        </pre> */}
        <table className="user-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>User</th>
              <th>Petak Quota</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <tr key={user.USERID}>
                  <td>{index + 1}</td>
                  <td>
                    <span className="flex items-center justify-start gap-2">
                      <span
                        className={`inline-block h-2 w-2 rounded-full transition-colors ${
                          user.LOGINSTATUS === "LOG IN"
                            ? "bg-green-400 animate-pulse"
                            : "bg-gray-300"
                        }`}
                      />
                      <p>
                        {user.USERNAME}
                        {user.SEASONAL?.length > 0 ? `(Seasonal Member)` : ""}
                      </p>
                    </span>
                  </td>
                  <td>{user.PETAK?.PETAKDIGIT || "-"}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(user.USERID)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
