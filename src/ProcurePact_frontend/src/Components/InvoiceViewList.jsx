import React, { useEffect } from "react";
import { useStore } from "../store/useStore";
import { useAuth } from "../Hooks/AuthContext";
import "../styles/InvoiceViewListStyles.css"; // Import the CSS file

const dummyInvoices = [
  { contractId: "001", amount: 1200, date: "2025-08-01" },
  { contractId: "002", amount: 850, date: "2025-08-02" },
  { contractId: "003", amount: 430, date: "2025-08-03" },
  { contractId: "004", amount: 2750, date: "2025-08-04" },
  { contractId: "005", amount: 960, date: "2025-08-05" },
  { contractId: "006", amount: 1100, date: "2025-08-06" },
  { contractId: "007", amount: 540, date: "2025-08-07" },
  { contractId: "008", amount: 1990, date: "2025-08-08" },
  { contractId: "009", amount: 3100, date: "2025-08-09" },
  { contractId: "010", amount: 1500, date: "2025-08-10" },
];

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
