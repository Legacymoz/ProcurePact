import React, { useEffect, useState } from "react";
import "../styles/InvoiceListStyles.css"; // Import the CSS file
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";

function formatNanoDate(nano) {
  if (!nano) return "-";
  return new Date(Number(nano) / 1_000_000).toLocaleDateString();
}

const InvoiceList = ({ invoices }) => {
  const navigate = useNavigate();
  const setSelectedInvoiceID = useStore((state) => state.setSelectedInvoiceID);
  const selectedInvoiceID = useStore((state) => state.selectedInvoiceID);

  const [error, setError] = useState("");
  console.log("Invoices......", invoices);

  const handleClick = (id) => {
    setSelectedInvoiceID(id);
    console.log("Selected Invoice ID:", id);
    navigate(`/app/viewInvoice`);
  };

  useEffect(() => {
    if (selectedInvoiceID) {
      console.log("Selected Invoice ID:", selectedInvoiceID);
    }
  }, [selectedInvoiceID]);

  return invoices && invoices.length > 0 ? (
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
              <td className="recipient-cell">{invoice.recipient.toText()}</td>
              <td>{formatNanoDate(invoice.createdAt)}</td>
              <td>{formatNanoDate(invoice.dueDate)}</td>
              <td>{invoice.totalAmount}</td>
              <td>{Object.keys(invoice.status)[0]}</td>
              <td>
                <button onClick={() => handleClick(invoice.contractId)}>
                  View
                </button>
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
  );
};

export default InvoiceList;
