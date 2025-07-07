import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSocket } from "../../../context/socket";
import "./Home.css";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

export default function Home() {
  const { socket } = useSocket();

  const [zoneData, setZoneData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [slotData, setSlotData] = useState([]);
  const [operatorZoneList, setOperatorZoneList] = useState([]);
  const [seasonMembers, setSeasonMembers] = useState(0);
  const [petakUsed, setPetakUsed] = useState(0);
  const [petakChange, setPetakChange] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.emit("getPetakUsed", (res) => {
      console.log("🐛 getPetakUsed", res);
      if (res.status === 200) {
        setPetakUsed(res.data.used);
        setPetakChange(res.data.percentChange);
      }
    });

    socket.emit("getSeasonMembers", (res) => {
      if (res.status === 200) setSeasonMembers(res.data);
    });

    socket.emit("getZoneFineStats", (res) => {
      if (res.status === 200) setZoneData(res.data);
    });

    socket.emit("getPaymentBreakdown", (res) => {
      if (res.status === 200) setPaymentData(res.data);
    });

    socket.emit("getSlotStatus", (res) => {
      if (res.status === 200) setSlotData(res.data);
    });

    socket.emit("fetchAllAttendance", (res) => {
      if (res.status === 200) {
        const attendance = Object.values(res.data);
        const simplified = attendance.map((op) => ({
          OPERATOR: op.USERNAME,
          ZONE: op.ZONE?.CODE || "-",
        }));
        setOperatorZoneList(simplified);
      }
    });
  }, [socket]);

  return (
    <>
      {/* Cards */}
      <div className="cards">
        <div className="card">
          <h3>PETAK Used</h3>
          <p>{petakUsed.toLocaleString()}</p>
          <span className="card-subtext">
            {petakChange >= 0 ? "+" : ""}
            {petakChange}% from last week
          </span>
        </div>
        <div className="card">
          <h3>Active Season Member</h3>
          <p>{seasonMembers}</p>
          <span className="card-subtext-member">From 1 May 2025</span>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart">
          <h3>Fine Statistics</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={zoneData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name }) => name}
                dataKey="value"
              >
                {zoneData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, auto)",
                  gap: "6px 20px",
                  justifyItems: "center",
                  marginTop: "10px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h3>Payment Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                dataKey="value"
              >
                {paymentData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h3>Parking Slots</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={slotData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                dataKey="value"
              >
                {slotData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Operator Table */}
      <div className="schedule">
        <h3>Operator List & Zone</h3>
        <div className="operator-table">
          <div className="operator-row operator-grid operator-table-header-home">
            <span>Zone / Department</span>
            <span>Operator Name</span>
          </div>
          {operatorZoneList.map((item, index) => (
            <div key={index} className="operator-row operator-grid">
              <span className="zone-name">{item.ZONE}</span>
              <span className="operator-name">{item.OPERATOR}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}