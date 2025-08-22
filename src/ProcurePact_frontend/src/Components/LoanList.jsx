import React, { useEffect, useState } from "react";
import "../styles/LoanListStyles.css"; // Import the CSS file
import "../styles/InvoiceListStyles.css";

// Removed LoanAgreementModal import

function formatNanoDate(nano) {
  if (!nano) return "-";
  return new Date(Number(nano) / 1_000_000).toLocaleDateString();
}

function tokenize(){
  alert("Tokenize invoice to a tradable NFT feature coming soon!")
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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => {
            const status = Object.keys(invoice.status)[0];
            return (
              <tr key={index}>
                <td>{invoice.contractId}</td>
                <td>{(invoice.totalAmount * 0.8).toFixed(2)}</td>
                <td>{formatNanoDate(invoice.dueDate)}</td>
                <td>
                  {status === "Pending" && (
                    <div className="tokenize-button">
                    <button onClick={tokenize}>Tokenize</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
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
