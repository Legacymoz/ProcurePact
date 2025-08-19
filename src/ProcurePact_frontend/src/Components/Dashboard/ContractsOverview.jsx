import React, { useState, useEffect } from "react";
import { ProcurePact_backend } from "declarations/ProcurePact_backend";
import { useAuth } from "../../Hooks/AuthContext";
import "../../styles/ContractOverviewStyles.css";
import {
  FaFileAlt,
  FaCheckCircle,
  FaFileInvoice,
  FaClipboardList,
} from "react-icons/fa";

const ContractsOverview = () => {
  const [contracts, setContracts] = useState([]);
  const [contractCounts, setContractCounts] = useState({
    Draft: 0,
    Active: 0,
    Invoice: 0,
    Completed: 0,
  });

  const { principal } = useAuth();

  useEffect(() => {
    if (!principal) return;

    const fetchContracts = async () => {
      try {
        const result = await ProcurePact_backend.getContracts(principal);
        if (result.ok) {
          setContracts(result.ok);
          console.log("Fetched contracts:", result.ok);
        }
      } catch (err) {
        console.error("Failed to fetch contracts:", err);
      }
    };

    fetchContracts();
  }, [principal]);

  useEffect(() => {
    const calculateContractCounts = () => {
      const counts = { Draft: 0, Active: 0, Invoice: 0, Completed: 0 };
      contracts.forEach((contract) => {
        console.log("Each Contract", contract);
        const state = Object.keys(contract.status).find(
          (key) => contract.status[key] === null
        );
        if (state) {
          const displayState = state === "InvoiceIssued" ? "Invoice" : state;
          if (counts[displayState] !== undefined) {
            counts[displayState]++;
          }
        }
      });
      setContractCounts(counts);
      console.log("Contract counts:", counts);
    };

    calculateContractCounts();
  }, [contracts]);

  const icons = {
    Draft: <FaClipboardList />,
    Active: <FaFileAlt />,
    Invoice: <FaFileInvoice />,
    Completed: <FaCheckCircle />,
  };

  return (
    <div className="contractsOverview">
      <div className="header">
        <h1>Contracts Overview</h1>
      </div>
      <div className="contract-info-container">
        {Object.entries(contractCounts).map(([status, count]) => (
          <div
            className={`info ${status.toLowerCase().replace(" ", "-")}`}
            key={status}
          >
            <div className="info-icon">{icons[status]}</div>
            <div className="info-text">
              <h2>{count}</h2>
              <p>{status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractsOverview;