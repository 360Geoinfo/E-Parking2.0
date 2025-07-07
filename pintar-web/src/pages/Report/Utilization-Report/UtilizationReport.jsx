import React from 'react';
import './UtilizationReport.css';

export default function UtilizationReport() {
  // Sample data for PETAK Usage Report
  const usageReportData = [
    {
      date: '2025-06-01',
      used: 120,
      added: 10,
      left: 30,
      users: 85,
      duration: '2 hrs 15 mins',
    },
    {
      date: '2025-06-02',
      used: 135,
      added: 5,
      left: 25,
      users: 90,
      duration: '1 hr 45 mins',
    },
    // Add more entries here
  ];

  // Sample data for PETAK Usage by Zones
  const zoneUsageData = [
    {
      date: '2025-06-01',
      zone: 'A',
      used: 40,
      location: 'City Center',
    },
    {
      date: '2025-06-01',
      zone: 'B',
      used: 30,
      location: 'North Park',
    },
    {
      date: '2025-06-01',
      zone: 'C',
      used: 20,
      location: 'Tech Valley',
    },
    // Add more entries here
  ];

  return (
    <div className="utilization-report">
      {/* Section 1: Summary Boxes */}
      <section className="summary">
        <div className="summary-card">
          <h3>Parking Slot Currently Used</h3>
          <p>145</p>
        </div>
        <div className="summary-card">
          <h3>Total Utilized Percentage</h3>
          <p>72%</p>
        </div>
      </section>

      {/* Section 2: Table - PETAK Usage Report */}
      <section className="report-table">
        <h2>PETAK Usage Report</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>PETAK Used</th>
              <th>PETAK Added</th>
              <th>PETAK Left in System (EOB)</th>
              <th>Total Users</th>
              <th>Avg. Parking Duration</th>
            </tr>
          </thead>
          <tbody>
            {usageReportData.map((entry, index) => (
              <tr key={index}>
                <td>{entry.date}</td>
                <td>{entry.used}</td>
                <td>{entry.added}</td>
                <td>{entry.left}</td>
                <td>{entry.users}</td>
                <td>{entry.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Section 3: Table - PETAK Usage According to Zones */}
      <section className="report-table">
        <h2>PETAK Usage According to Zones</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Zone</th>
              <th>Petak Used</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {zoneUsageData.map((entry, index) => (
              <tr key={index}>
                <td>{entry.date}</td>
                <td>{entry.zone}</td>
                <td>{entry.used}</td>
                <td>{entry.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
