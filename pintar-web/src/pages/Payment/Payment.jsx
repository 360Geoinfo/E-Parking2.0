import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import "./Payment.css";

const currentDate = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const paymentData = [
  {
    no: 1,
    transactionId: "TXN123456",
    id: "U001",
    userType: "User",
    plateLicense: "ABC-1234",
    dateTime: "2025-06-01 14:30",
    duration: "2 hours",
    pricePetak: "$10",
    leftoverPetak: "0",
    type: "Hourly",
    paymentType: "PINTAR App",
    paymentStatus: "Completed",
  },
  {
    no: 2,
    transactionId: "TXN123457",
    id: "O007",
    userType: "Operator",
    plateLicense: "XYZ-9876",
    dateTime: "2025-06-01 16:00",
    duration: "1 day",
    pricePetak: "$50",
    leftoverPetak: "1",
    type: "Daily",
    paymentType: "Cash",
    paymentStatus: "Pending",
  },
  {
    no: 3,
    transactionId: "TXN123458",
    id: "U002",
    userType: "User",
    plateLicense: "DEF-5678",
    dateTime: "2025-06-02 09:00",
    duration: "Monthly",
    pricePetak: "$300",
    leftoverPetak: "10",
    type: "Monthly",
    paymentType: "PINTAR App",
    paymentStatus: "Failed",
  },
];

export default function Payment() {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter paymentData based on searchTerm matching id or plateLicense (case-insensitive)
  const filteredPayments = paymentData.filter(
    ({ id, plateLicense }) =>
      id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plateLicense.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    // You can replace this with actual logout logic
    localStorage.clear(); // example cleanup
    window.location.href = "/"; // redirect to login page
  };

  return (
    <>
      {/* Cards row */}
      <div className="cards-row">
        <div className="card">
          <h3>Total Payments</h3>
          <p>$15,300</p>
          <span className="card-subtext">Received this month</span>
        </div>
        <div className="card">
          <h3>Pending Payments</h3>
          <p>12</p>
          <span className="card-subtext">To be processed</span>
        </div>
        <div className="card">
          <h3>Failed Payments</h3>
          <p>3</p>
          <span className="card-subtext">Issues reported</span>
        </div>
      </div>

      {/* Data section */}
      <div className="data-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="User ID or Plate License..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <FaSearch className="search-icon" />
        </div>

        <table className="payment-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Transaction ID</th>
              <th>ID</th>
              <th>User Type</th>
              <th>Plate License</th>
              <th>Date &amp; Time</th>
              <th>Duration</th>
              <th>Price (PETAK)</th>
              <th>Leftover PETAK</th>
              <th>Type</th>
              <th>Payment Type</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((item) => (
              <tr key={item.transactionId}>
                <td>{item.no}</td>
                <td>{item.transactionId}</td>
                <td>{item.id}</td>
                <td>{item.userType}</td>
                <td>{item.plateLicense}</td>
                <td>{item.dateTime}</td>
                <td>{item.duration}</td>
                <td>{item.pricePetak}</td>
                <td>{item.leftoverPetak}</td>
                <td>{item.type}</td>
                <td>{item.paymentType}</td>
                <td>{item.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
