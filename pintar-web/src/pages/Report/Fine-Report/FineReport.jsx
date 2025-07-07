import React from 'react';
import './FineReport.css';

export default function FineReport() {
  const summaryOne = {
    issued: 420,
    paid: 320,
    unpaid: 100,
  };

  const summaryTwo = {
    cashFromFines: 'RM 9,500',
    petakUsed: 180,
  };

  const fineReportData = [
    {
      date: '2025-06-01',
      issued: 50,
      paid: 40,
      unpaid14: 10,
      petakPaid: 25,
      cashPaid: 15,
      amountPaid: 'RM 1,800',
      amountUnpaid: 'RM 450',
    },
    {
      date: '2025-06-02',
      issued: 60,
      paid: 50,
      unpaid14: 10,
      petakPaid: 30,
      cashPaid: 20,
      amountPaid: 'RM 2,100',
      amountUnpaid: 'RM 500',
    },
    {
      date: '2025-06-03',
      issued: 45,
      paid: 30,
      unpaid14: 15,
      petakPaid: 10,
      cashPaid: 20,
      amountPaid: 'RM 1,400',
      amountUnpaid: 'RM 600',
    },
  ];

  return (
    <div className="fine-report">

      {/* Section 1: Summary Boxes */}
      <section className="summary-section">
        <div className="summary-card light-blue">
          <h4>Total Fines Issued</h4>
          <p>{summaryOne.issued}</p>
          <h4>Total Fines Paid</h4>
          <p>{summaryOne.paid}</p>
          <h4>Total Fines Unpaid</h4>
          <p>{summaryOne.unpaid}</p>
        </div>
        <div className="summary-card light-green">
          <h4>Total Cash From Fines</h4>
          <p>{summaryTwo.cashFromFines}</p>
          <h4>Total PETAK Used for Fines</h4>
          <p>{summaryTwo.petakUsed}</p>
        </div>
      </section>

      {/* Section 2: Table */}
      <section className="table-section">
        <h3>📊 Detailed Fine Report</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Fines Issued</th>
                <th>Fines Paid</th>
                <th>Total Fines Unpaid (Less than 14 days)</th>
                <th>Paid w/ PETAK</th>
                <th>Paid w/ Cash</th>
                <th>Total Paid</th>
                <th>Total Unpaid</th>
              </tr>
            </thead>
            <tbody>
              {fineReportData.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.date}</td>
                  <td>{entry.issued}</td>
                  <td>{entry.paid}</td>
                  <td>{entry.unpaid14}</td>
                  <td>{entry.petakPaid}</td>
                  <td>{entry.cashPaid}</td>
                  <td>{entry.amountPaid}</td>
                  <td>{entry.amountUnpaid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
