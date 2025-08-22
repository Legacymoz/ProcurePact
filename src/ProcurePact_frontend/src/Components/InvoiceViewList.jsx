import React, { useEffect } from "react";
import { useStore } from "../store/useStore";
import { useAuth } from "../Hooks/AuthContext";
import "../styles/InvoiceViewListStyles.css"; // Import the CSS file

const InvoiceViewList = () => {
  const { principal } = useAuth();
  const fetchAllInvoices = useStore((state) => state.fetchAllInvoices);
  const allInvoices = useStore((state) => state.allInvoices);
  const { selectedInvoiceID, setSelectedInvoiceID } = useStore();

  useEffect(() => {
    if (principal) {
      fetchAllInvoices(principal);
    }
  }, [principal, fetchAllInvoices]);

  return (
    <div className="invoice-view-list-container">
      <h2>Invoices</h2>
      {!allInvoices || allInvoices.length === 0 ? (
        <div>No invoices found.</div>
      ) : (
        <ul>
          {allInvoices.map((invoice, idx) => {
            const isActive = selectedInvoiceID === invoice.contractId;
            return (
              <li
                key={invoice.contractId || idx}
                className={isActive ? "active-invoice" : ""}
                onClick={() => setSelectedInvoiceID(invoice.contractId)}
                style={{ cursor: "pointer" }}
              >
                Invoice {invoice.contractId}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default InvoiceViewList;
