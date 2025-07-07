import React from 'react';
import './RevenueReport.css';

export default function RevenueReport() {
  return (
    <div className="revenue-report">
      {/* Summary Section */}
      <section className="summary">
        <div className="summary-card">
          <h3>Total Revenue</h3>
          <p>RM 15,000</p>
        </div>
        <div className="summary-card">
          <h3>Total Transactions This Month</h3>
          <p>325</p>
        </div>
        <div className="summary-card">
          <h3>Total Transactions Today</h3>
          <p>24</p>
        </div>
      </section>

      {/* Table Section */}
      <section className="report-table">
        <h2>Laporan Pendapatan</h2>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Date</th>
              <th>Card/Pocket</th>
              <th>Cash</th>
              <th>Fine Collected</th>
              <th>Bank Payment</th>
              <th>Operator Cash</th>
              <th>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>2025-06-01</td>
              <td>RM 500</td>
              <td>RM 200</td>
              <td>RM 100</td>
              <td>RM 300</td>
              <td>RM 250</td>
              <td>RM 1350</td>
            </tr>
            {/* Additional rows can go here */}
          </tbody>
        </table>
      </section>
    </div>
  );
}
