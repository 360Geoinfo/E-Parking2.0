import React, { useEffect, useState } from "react";
import { FaSearch, FaPlus, FaList, FaBell } from "react-icons/fa";
import { NewOperator, OperatorList, ResetRequest } from "../../components";
import { useSocket } from "../../../context/socket";
import "./Operator.css";

export default function Operator() {
  const { socket, zoneList } = useSocket();

  const [searchTerm, setSearchTerm] = useState("");
  const [showNewOperatorModal, setShowNewOperatorModal] = useState(false);
  const [showOperatorList, setShowOperatorList] = useState(false);
  const [showResetRequest, setShowResetRequest] = useState(false);
  const [resetRequestData, setResetRequestData] = useState([]);
  const [resetRequestCount, setResetRequestCount] = useState(0);

  const [attendanceData, setAttendanceData] = useState({});
  const [filteredOperators, setFilteredOperators] = useState([]);
  const [showZoneData, setShowZoneData] = useState(null);

  const [onDutyOperators, setOnDutyOperators] = useState(0);
  const [offDutyOperators, setOffDutyOperators] = useState(0);
  const [totalOperators, setTotalOperators] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.emit("fetchAllAttendance", (res) => {
      if (res.status === 200) {
        setAttendanceData(res.data);
        setFilteredOperators(Object.values(res.data));
        setOnDutyOperators(
          Object.values(res.data).filter((op) => op.STATUS === "On Duty").length
        );
        setOffDutyOperators(
          Object.values(res.data).filter((op) => op.STATUS === "Off Duty")
            .length
        );
        setTotalOperators(Object.keys(res.data).length);
      }
    });

    socket.emit("getResetRequests", (res) => {
      if (res.status === 200) {
        setResetRequestData(res.data);
        setResetRequestCount(res.data.length);
      }
    });
  }, [socket, zoneList]);

  useEffect(() => {
    if (!socket) return;
    socket.on("operatorLoggedIn", (res) => {
      if (res.status === 200) {
        setAttendanceData((prev) => ({
          ...prev,
          [res.USERID]: {
            ...prev[res.USERID],
            USERNAME: res.USERNAME,
            LOGINDATE: res.LOGINDATE || "-",
            LOGOUTDATE: res.LOGOUTDATE || "-",
            ZONE: zoneList.find((z) => z.ID === res.ZONE_ID),
            TRANSACTIONS_ACCEPTED: res.TRANSACTIONS_ACCEPTED,
            FINES_ISSUED: res.FINES,
            STATUS: res.STATUS,
          },
        }));
        setFilteredOperators((prev) => ({
          ...prev,
          [res.USERID]: {
            USERID: res.USERID,
            USERNAME: res.USERNAME,
            LOGINDATE: res.LOGINDATE || "-",
            LOGOUTDATE: res.LOGOUTDATE || "-",
            ZONE: zoneList.find((z) => z.ID === res.ZONE_ID),
            TRANSACTIONS_ACCEPTED: res.TRANSACTIONS_ACCEPTED,
            FINES_ISSUED: res.FINES,
            STATUS: res.STATUS,
          },
        }));
        setOnDutyOperators((prev) => prev + 1);
        setOffDutyOperators((prev) => prev - 1);
      }
    });

    socket.on("operatorLoggedOut", (res) => {
      if (res.status === 200) {
        setAttendanceData((prev) => ({
          ...prev,
          [res.USERID]: {
            ...prev[res.USERID],
            LOGOUTDATE: res.LOGOUTDATE || "-",
            STATUS: res.STATUS,
          },
        }));
        setOnDutyOperators((prev) => prev - 1);
        setOffDutyOperators((prev) => prev + 1);
      }
    });

    return () => {
      socket.off("operatorLoggedIn");
      socket.off("operatorLoggedOut");
    };
  }, [socket, zoneList]);

  const handleSearchTerm = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (!value) {
      setFilteredOperators(Object.values(attendanceData));
      return;
    }
    const filtered = Object.values(attendanceData).filter((op) =>
      op.USERNAME.toLowerCase().includes(value)
    );
    setFilteredOperators(filtered);
  };

  return (
    <>
      {showNewOperatorModal && (
        <NewOperator onClose={() => setShowNewOperatorModal(false)} />
      )}
      {showOperatorList && (
        <OperatorList onClose={() => setShowOperatorList(false)} />
      )}
      {showResetRequest && (
        <ResetRequest
          data={resetRequestData}
          onClose={() => setShowResetRequest(false)}
        />
      )}

      {/* Stats */}
      <div className="cards-row">
        <div className="card">
          <h3>Total Operators</h3>
          <p>{totalOperators}</p>
          <span className="card-subtext">Across all zones</span>
        </div>
        <div className="card">
          <h3>On Duty</h3>
          <p>{onDutyOperators}</p>
          <span className="card-subtext">Currently working</span>
        </div>
        <div className="card">
          <h3>Off Duty</h3>
          <p>{offDutyOperators}</p>
          <span className="card-subtext">Break or inactive</span>
        </div>
      </div>

      {/* Search and Buttons */}
      <div className="data-section">
        <span className="interactives-holder">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by Operator Name..."
              value={searchTerm}
              onChange={handleSearchTerm}
              className="search-input"
            />
            <FaSearch className="search-icon" />
          </div>
        </span>
        <span className="operator-actions">
          <span
            className="add-icon"
            onClick={() => setShowNewOperatorModal(true)}
          >
            <FaPlus />
          </span>
          <span
            className="icon-button"
            title="View Operator List"
            onClick={() => setShowOperatorList(true)}
          >
            <FaList size={20} />
          </span>
          <span
            className="icon-button"
            title="View Reset Requests"
            onClick={() => setShowResetRequest(true)}
            style={{ position: "relative" }}
          >
            <FaBell size={20} />
            {resetRequestCount > 0 && (
              <span className="notification-badge">{resetRequestCount}</span>
            )}
          </span>
        </span>
      </div>

      {/* Operator Table */}
      <div className="operator-table">
        <div className="operator-table-header">
          <span>No</span>
          <span>Operator ID</span>
          <span>Operator Name</span>
          <span>Login Date</span>
          <span>Logout Date</span>
          <span>Zone</span>
          <span>Transactions</span>
          <span>Fines</span>
          <span>Status</span>
        </div>

        {filteredOperators?.map((op, index) => (
          <div key={op.USERID || index} className="operator-table-row">
            <span>{index + 1}</span>
            <span>{op.USERID}</span>
            <span>{op.USERNAME}</span>
            <span>{op.LOGINDATE}</span>
            <span>{op.LOGOUTDATE || "-"}</span>
            <span
              onMouseEnter={() => setShowZoneData(op.USERID)}
              onMouseLeave={() => setShowZoneData(null)}
              className="relative"
            >
              {op.ZONE?.CODE || "-"}
              {showZoneData === op.USERID && (
                <div className="zone-popup">
                  <p>Zone Name: {op.ZONE?.NAME}</p>
                </div>
              )}
            </span>
            <span>{op.TRANSACTIONS_ACCEPTED || 0}</span>
            <span>{op.FINES_ISSUED || 0}</span>
            <span>
              <span
                className={`status-badge ${
                  op.STATUS === "On Duty" ? "on-duty" : "off-duty"
                }`}
              >
                {op.STATUS || "-"}
              </span>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
