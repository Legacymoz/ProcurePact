import React, { useEffect, useState } from "react";
import "../styles/InvoiceListStyles.css"; // Import the CSS file


function formatNanoDate(nano) {
  if (!nano) return "-";
  return new Date(Number(nano) / 1_000_000).toLocaleDateString();
}

const InvoiceList = ({invoices}) => {
  
  const [error, setError] = useState("");
  console.log("Invoices......", invoices)
  
    return (
    invoices && invoices.length > 0 ? (
      <div className="table-wrapper">
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Recipient</th>
            <th>Created At</th>
            <th>Due Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr key={index}>
              <td>{invoice.contractId}</td>
              <td className="recipient-cell" >{invoice.recipient.toText()}</td>
              <td>{formatNanoDate(invoice.createdAt)}</td>
              <td>{formatNanoDate(invoice.dueDate)}</td>
              <td>{invoice.totalAmount}</td>
              <td>{Object.keys(invoice.status)[0]}</td>
              <td>
                <button>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    ) : (
      <div className="no-invoices">
        <p>No invoices available</p>
      </div>
    )
  );
};

export default InvoiceList;
