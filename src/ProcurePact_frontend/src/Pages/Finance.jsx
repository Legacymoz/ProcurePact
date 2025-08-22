import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import LoanList from "../Components/LoanList";
import { useAuth } from "../Hooks/AuthContext";
import "../styles/InvoiceListPageStyles.css"; // Import the CSS file
import LoanOverview from "../Components/LoanOverview";

const Financial = () => {
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const { fetchAllInvoices, allInvoices } = useStore();
  const [filter, setFilter] = useState("All");
  const { user, isAuthenticated, authClient, principal } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [collateralizedInvoices, setCollateralizedInvoices] = useState([]);

  useEffect(() => {
    fetchAllInvoices(principal);
  }, [fetchAllInvoices]);

  useEffect(() => {
    const invoices = allInvoices.filter(
      (invoice) => invoice.collateralized === true
    );
    setCollateralizedInvoices(invoices);
    console.log("Filtered collateralizedInvoices:", collateralizedInvoices);
  }, [allInvoices]);

  useEffect(() => {
    setFilteredInvoices(collateralizedInvoices);
  }, [collateralizedInvoices]);

  const filterInvoices = (status) => {
    setFilter(status);
    setActiveTab(status);
    if (status === "All") {
      setFilteredInvoices(collateralizedInvoices);
      return;
    }

    const filtered = collateralizedInvoices.filter(
      (invoice) => Object.keys(invoice.status)[0] === status
    );
    console.log("Inside Filteration", filtered);
    setFilteredInvoices(filtered);
    return;
  };



  return (
    <div className="main-invoice-container">
      <div className="sub-invoice-container">
        <div className="header">
          <h1 style={{ fontSize: "50px" }}>My Loans</h1>
        </div>

        <LoanOverview invoices={filteredInvoices} />

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
            Unpaid
          </button>
          <button
            className={activeTab === "Paid" ? "active" : ""}
            onClick={() => filterInvoices("Paid")}
          >
            Paid
          </button>
        </div>
        <div className="invoice-container">
          <LoanList invoices={filteredInvoices} />
        </div>
      </div>
      <div className="sub-invoice-container">
        <div className="header">
          <h1 style={{ fontSize: "50px" }}>My NFTs</h1>
        </div>
        {/**
         * List all NFTs here
         * 
         */}
         <h2>Coming soon</h2>
      </div>
    </div>
  );
};

export default Financial;
