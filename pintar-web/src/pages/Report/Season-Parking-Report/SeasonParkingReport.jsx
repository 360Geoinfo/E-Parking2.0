import React, { useState, useMemo } from 'react';
import './SeasonParkingReport.css';
import { FiSearch } from 'react-icons/fi';

export default function SeasonParkingReport() {
  const summary = {
    totalMembers: 120,
    newMembers: 18,
    expiredMembers: 7,
    totalPaid: 105,
  };

  const [searchTerm, setSearchTerm] = useState('');

  const seasonData = [
    {
      memberId: 'SP001',
      userId: 'U102',
      plate: 'ABC1234',
      start: '2025-06-01 08:00',
      end: '2025-12-01 08:00',
      purchase: '2025-05-25 14:32',
      validity: 180,
      price: 120,
      petakAvailable: 80,
      status: 'Paid',
    },
    {
      memberId: 'SP002',
      userId: 'U108',
      plate: 'XYZ5678',
      start: '2025-06-15 09:00',
      end: '2025-12-15 09:00',
      purchase: '2025-06-10 16:05',
      validity: 180,
      price: 140,
      petakAvailable: 65,
      status: 'Unpaid',
    },
    {
      memberId: 'SP003',
      userId: 'U115',
      plate: 'DEF3456',
      start: '2025-05-01 10:00',
      end: '2025-11-01 10:00',
      purchase: '2025-04-25 13:00',
      validity: 180,
      price: 100,
      petakAvailable: 50,
      status: 'Paid',
    },
  ];

  // Filtered data based on search input
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return seasonData.filter(
      ({ memberId, userId, plate }) =>
        memberId.toLowerCase().includes(term) ||
        userId.toLowerCase().includes(term) ||
        plate.toLowerCase().includes(term)
    );
  }, [searchTerm, seasonData]);

  return (
    <div className="season-report">
      {/* Section 1: Summary Boxes */}
      <section className="summary-section">
        <div className="summary-card sky">
          <h4>Total Season Members</h4>
          <p>{summary.totalMembers}</p>
        </div>
        <div className="summary-card green">
          <h4>Total New Members</h4>
          <p>{summary.newMembers}</p>
        </div>
        <div className="summary-card red">
          <h4>Total Expired Members</h4>
          <p>{summary.expiredMembers}</p>
        </div>
        <div className="summary-card gold">
          <h4>Total Paid</h4>
          <p>{summary.totalPaid}</p>
        </div>
      </section>

      {/* Section 2: Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by ID or plate..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <FiSearch className="search-icon" />
      </div>

      {/* Section 3: Table */}
      <section className="table-section">
        <h3>📋 Season Parking Report</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Season Member ID</th>
                <th>User ID</th>
                <th>Plate License</th>
                <th>Start Date & Time</th>
                <th>End Date & Time</th>
                <th>Purchase Date & Time</th>
                <th>Validity (Days)</th>
                <th>Price (PETAK)</th>
                <th>PETAK Available</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={index} className={item.status === 'Paid' ? 'row-paid' : 'row-unpaid'}>
                    <td>{item.memberId}</td>
                    <td>{item.userId}</td>
                    <td>{item.plate}</td>
                    <td>{item.start}</td>
                    <td>{item.end}</td>
                    <td>{item.purchase}</td>
                    <td>{item.validity}</td>
                    <td>{item.price}</td>
                    <td>{item.petakAvailable}</td>
                    <td className={item.status === 'Paid' ? 'status-paid' : 'status-unpaid'}>
                      {item.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '1rem' }}>
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
