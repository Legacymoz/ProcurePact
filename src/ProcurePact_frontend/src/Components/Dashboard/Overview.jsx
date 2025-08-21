
import React, { useEffect, useState } from "react";
import "../../styles/OverviewStyles.css";
import { useStore } from "../../store/useStore";
import { ledgerStore } from "../../store/ledgerStore";

import { FaCoins, FaFileAlt, FaFileInvoice, FaUsers } from "react-icons/fa";
import { useAuth } from "../../Hooks/AuthContext";

const Overview = () => {
  const { user, isAuthenticated, authClient, principal } = useAuth();
  const { ledger } = ledgerStore();
  const [balance, setBalance] = useState(null);

  const {
    myContracts,
    fetchContracts,
    myInvoices,
    fetchInvoices,
    myConnections,
    getConnections,
  } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!principal) return;

      try {
        // fetch balance
        const bal = await ledger.balance({
          owner: principal,
          subaccount: null,
        });

        // bal is usually in e8s or bigint depending on your canister
        // convert to human-readable (assuming e8s to ICP)

        setBalance(Number(bal));

        // fetch other stuff
        await Promise.all([
          fetchContracts(principal),
          fetchInvoices(principal),
          getConnections(principal),
        ]);
      } catch (err) {
        console.error("Error fetching balance or data:", err);
      }
    };

    fetchData();
  }, [principal, ledger, fetchContracts, fetchInvoices, getConnections]);

  console.log("my User Balance", balance);
  console.log("my Contracts", myContracts);
  console.log("my Invoices", myInvoices);
  console.log("my Connections", myConnections);

  return (
    <div className="main-overview-container">
      <h2 className="overview-title">Overview</h2>
      <div className="overview-cards-container">
        {/* Balance Card */}
        <div
          className="overview-card"
          style={{
            background: "linear-gradient(135deg, #ff8800 60%, #ffb366 100%)",
          }}
        >
          <div className="overview-card-left">
            <div
              className="overview-icon-bg"
              style={{ background: "rgba(255,136,0,0.45)" }}
            >
              <FaCoins size={28} color="white" />
            </div>
          </div>
          <div className="overview-card-right">
            <div className="overview-card-value">
              {balance !== null ? `$${balance}` : "Loading..."}
            </div>
            <div className="overview-card-label">Balance</div>
          </div>
        </div>
        {/* Contracts Card */}
        <div
          className="overview-card"
          style={{
            background: "linear-gradient(135deg, #007bff 60%, #66b3ff 100%)",
          }}
        >
          <div className="overview-card-left">
            <div
              className="overview-icon-bg"
              style={{ background: "rgba(0,123,255,0.45)" }}
            >
              <FaFileAlt size={28} color="white" />
            </div>
          </div>
          <div className="overview-card-right">
            <div className="overview-card-value">{myContracts.length}</div>
            <div className="overview-card-label">Contracts</div>
          </div>
        </div>
        {/* Invoices Card */}
        <div
          className="overview-card"
          style={{
            background: "linear-gradient(135deg, #28a745 60%, #85e085 100%)",
          }}
        >
          <div className="overview-card-left">
            <div
              className="overview-icon-bg"
              style={{ background: "rgba(40,167,69,0.45)" }}
            >
              <FaFileInvoice size={28} color="white" />
            </div>
          </div>
          <div className="overview-card-right">
            <div className="overview-card-value">{myInvoices.length}</div>
            <div className="overview-card-label">Invoices</div>
          </div>
        </div>
        {/* Connections Card */}
        <div
          className="overview-card"
          style={{
            background: "linear-gradient(135deg, #ff3366 60%, #ff99b3 100%)",
          }}
        >
          <div className="overview-card-left">
            <div
              className="overview-icon-bg"
              style={{ background: "rgba(255,51,102,0.45)" }}
            >
              <FaUsers size={28} color="white" />
            </div>
          </div>
          <div className="overview-card-right">
            <div className="overview-card-value">
              {Array.isArray(myConnections) ? myConnections.length : 0}
            </div>
            <div className="overview-card-label">Connections</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
