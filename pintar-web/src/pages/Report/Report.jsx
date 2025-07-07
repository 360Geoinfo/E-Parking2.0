import React, { useState } from "react";
import "./Report.css";

// Import the 4 report components
import RevenueReport from "./Revenue-Report/RevenueReport.jsx";
import FineReport from "./Fine-Report/FineReport.jsx";
import SeasonParkingReport from "./Season-Parking-Report/SeasonParkingReport.jsx";
import UtilizationReport from "./Utilization-Report/UtilizationReport.jsx";

const currentDate = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export default function Report() {
  const [activeTab, setActiveTab] = useState("revenue");

  const renderTab = () => {
    switch (activeTab) {
      case "revenue":
        return <RevenueReport />;
      case "fine":
        return <FineReport />;
      case "season":
        return <SeasonParkingReport />;
      case "utilization":
        return <UtilizationReport />;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    // You can replace this with actual logout logic
    localStorage.clear(); // example cleanup
    window.location.href = "/"; // redirect to login page
  };

  return (
    <>
      {/* Tabs */}
      <div className="tab-nav">
        <button
          className={activeTab === "revenue" ? "active" : ""}
          onClick={() => setActiveTab("revenue")}
        >
          Revenue Report
        </button>
        <button
          className={activeTab === "utilization" ? "active" : ""}
          onClick={() => setActiveTab("utilization")}
        >
          Utilization Report
        </button>
        <button
          className={activeTab === "fine" ? "active" : ""}
          onClick={() => setActiveTab("fine")}
        >
          Fine Report
        </button>
        <button
          className={activeTab === "season" ? "active" : ""}
          onClick={() => setActiveTab("season")}
        >
          Season Parking Report
        </button>
      </div>

      {/* Render selected tab content */}
      <div className="report-content">{renderTab()}</div>
    </>
  );
}
