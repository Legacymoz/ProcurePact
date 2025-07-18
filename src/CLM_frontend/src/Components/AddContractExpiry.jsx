import React, { useState } from "react";

const ContractExpiry = () => {
  const [date, setDate] = useState("");

  const handleSubmit = () => {
    if (!date) {
      console.log("No date selected");
      return;
    }

    // Convert to Unix timestamp (in seconds)
    const timestamp = Math.floor(new Date(date).getTime() / 1000);
    console.log("Unix Timestamp:", timestamp);

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
