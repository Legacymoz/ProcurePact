import React, { useEffect, useState } from "react";
import "../styles/LoanListStyles.css"; // Import the CSS file

// Removed LoanAgreementModal import

function formatNanoDate(nano) {
  if (!nano) return "-";
  return new Date(Number(nano) / 1_000_000).toLocaleDateString();
}

const LoanList = ({ invoices }) => {
  console.log("Invoices......", invoices);

  return invoices && invoices.length > 0 ? (
    <div className="loan-table-wrapper">
      <table className="loan-invoice-table">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Amount</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr key={index}>
              <td>{invoice.contractId}</td>
              <td>{(invoice.totalAmount * 0.8).toFixed(2)}</td>

              <td>{formatNanoDate(invoice.dueDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="no-loans">
      <p>No loans available</p>
    </div>
  );
};

export default LoanList;
