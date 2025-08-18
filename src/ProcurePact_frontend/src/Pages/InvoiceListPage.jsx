import React, { useState, useEffect } from "react";
import { ProcurePact_backend } from "declarations/ProcurePact_backend";
import { useAuth } from "../Hooks/AuthContext";
import InvoiceList from "../Components/InvoiceList";
import "../styles/InvoiceListPageStyles.css"; // Import the CSS file

const InvoiceListPage = () => {
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [filter, setFilter] = useState("All");

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const { user, isAuthenticated, authClient, principal } = useAuth();

  useEffect(() => {
    if (!principal) return;
    const fetchInvoices = async () => {
      try {
        const result = await ProcurePact_backend.getInvoices(
          authClient.getIdentity().getPrincipal()
        );
        console;
        if (result.ok) {
          setInvoices(result.ok);
          console.log("Invoices fetched successfully", result.ok);
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to fetch invoices");
        console.log("This is the error", err);
      }
    };

    fetchInvoices();
    console.log(invoices);
  }, [principal]);

  useEffect(() => {
    filterInvoices(filter);
  }, [invoices, filter]);

  const filterInvoices = (status) => {
    setFilter(status);
     setActiveTab(status);
    if (filter === "All") {
      setFilteredInvoices(invoices);
      return;
    }

   const filtered = invoices.filter(
     (invoice) => Object.keys(invoice.status)[0] === status
   );
    console.log("Inside Filteration", filtered);
    setFilteredInvoices(filtered);
    return;
  };

  if (loading) return <p>Loading invoices...</p>;
  console.log("Inside Invoices List Page");

  return (
    <div className="main-invoice-container">
      <div className="sub-invoice-container">
        <div className="header">
          <h1>Invoice List</h1>
        </div>

        <div className="filter-container">
          <button
            className={activeTab === "All" ? "active" : ""}
            onClick={() => filterInvoices("All")}
          >
            All
          </button>
          <button
            className={activeTab === "Pending" ? "active" : ""}
            onClick={() => filterInvoices("Pending")}
          >
            Pending
          </button>
          <button
            className={activeTab === "Paid" ? "active" : ""}
            onClick={() => filterInvoices("Paid")}
          >
            Paid
          </button>
          <button
            className={activeTab === "Overdue" ? "active" : ""}
            onClick={() => filterInvoices("Overdue")}
          >
            Overdue
          </button>
          <button
            className={activeTab === "Disputed" ? "active" : ""}
            onClick={() => filterInvoices("Disputed")}
          >
            Disputed
          </button>
        </div>
        <div className="invoice-container">
          <InvoiceList invoices={filteredInvoices} />
        </div>
      </div>
    </div>
  );
};

export default InvoiceListPage;
