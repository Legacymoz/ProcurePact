import React, { useState, useEffect } from "react";
import { ProcurePact_backend } from "declarations/ProcurePact_backend";
import { useAuth } from "../Hooks/AuthContext";
import "../styles/InvoicesDue.css";

function formatNanoDate(nano) {
  if (!nano) return "-";
  return new Date(Number(nano) / 1_000_000).toLocaleDateString();
}

const InvoicesDue = () => {
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("today");

  const { user, isAuthenticated, authClient, principal } = useAuth();

  useEffect(() => {
    if (!principal) return;
    const fetchInvoices = async () => {
      try {
        const result = await ProcurePact_backend.getInvoices(principal);
        if (result.ok) {
          setInvoices(result.ok);
          setFilteredInvoices(result.ok);
          setLoading(false);
          console.log("Fetched invoices:", result.ok);
        }
      } catch (err) {
        setError("Failed to fetch invoices");
      }
    };

    fetchInvoices();
  }, [principal]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);

    const now = new Date();
    let filtered = invoices;

    if (value === "today") {
      filtered = invoices.filter((invoice) => {
        const dueDate = new Date(invoice.dueDate);
        return dueDate.toDateString() === now.toDateString();
      });
    } else if (value === "thisWeek") {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      filtered = invoices.filter((invoice) => {
        const dueDate = new Date(invoice.dueDate);
        return dueDate >= startOfWeek && dueDate <= endOfWeek;
      });
    } else if (value === "twoWeeks") {
      const twoWeeksFromNow = new Date(now);
      twoWeeksFromNow.setDate(now.getDate() + 14);

      filtered = invoices.filter((invoice) => {
        const dueDate = new Date(invoice.dueDate);
        return dueDate >= now && dueDate <= twoWeeksFromNow;
      });
    } else if (value === "month") {
      const endOfMonth = new Date(now);
      endOfMonth.setMonth(now.getMonth() + 1);

      filtered = invoices.filter((invoice) => {
        const dueDate = new Date(invoice.dueDate);
        return dueDate >= now && dueDate <= endOfMonth;
      });
    }

    setFilteredInvoices(filtered);
  };

  return (
    <div className="invoicesDue">
      <div className="invoicesDue-header">
        <h1 className="invoicesDue-title">Invoices Due</h1>
        <select
          className="invoicesDue-filter"
          value={filter}
          onChange={handleFilterChange}
        >
          <option value="today">Today</option>
          <option value="thisWeek">This Week</option>
          <option value="twoWeeks">Two Weeks</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table className="invoicesDue-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Due Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.contractId}>
                  <td>{invoice.contractId}</td>
                  <td>{formatNanoDate(invoice.dueDate)}</td>
                  <td>
                    <button className="invoicesDue-viewButton">View</button>
                  </td>
                </tr>
              ))}
            
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InvoicesDue;
