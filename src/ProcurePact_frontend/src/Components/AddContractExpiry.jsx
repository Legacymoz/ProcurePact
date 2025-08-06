import React, { useEffect, useState } from "react";
import { ProcurePact_backend } from 'declarations/ProcurePact_backend';
import { useStore } from '../store/useStore';

// Helper to convert nanoseconds to YYYY-MM-DD
function nsToDateString(ns) {
  if (!ns) return '';
  const date = new Date(Number(ns) / 1000000);
  return date.toISOString().slice(0, 10);
}

const ContractExpiry = ({ currentExpiry }) => {
  const selectedContract = useStore((state) => state.selectedContract);

  // Prefill with fetched expiry date in nanoseconds
  const [date, setDate] = useState(() => nsToDateString(currentExpiry[0]));

  useEffect(() => {
    setDate(nsToDateString(currentExpiry[0]));
  }, [currentExpiry]);

  const handleSubmit = async () => {
    if (!date) {
      console.log("No date selected");
      return;
    }
    // Convert YYYY-MM-DD to nanoseconds
    const timestamp = BigInt(new Date(date).getTime()) * 1000000n;
    await ProcurePact_backend.updateExpiryDate(BigInt(selectedContract), timestamp).then((result) => {
      if (result.ok) {
        alert("Expiry date updated successfully")
      } else {
        alert("Error updating expiry date", result.err);
        console.log(result.err);
      }
    })
  };

  return (
    <div className="contract-section-container">
      <h2 className="contract-section-heading">Contract Expiry Date</h2>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button onClick={handleSubmit} className="submit-button">
        Save
      </button>
    </div>
  );
};

export default ContractExpiry;
