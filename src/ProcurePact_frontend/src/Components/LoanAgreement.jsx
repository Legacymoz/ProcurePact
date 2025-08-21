import React, { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import "../styles/LoanAgreementStyles.css";
import { invoice } from "declarations/invoice";

const LoanAgreement = () => {
  const [agreed, setAgreed] = useState(false);
  const { selectedInvoiceID, fetchInvoiceData, invoiceData } = useStore();

  useEffect(() => {
    if (selectedInvoiceID) {
      fetchInvoiceData(selectedInvoiceID);
    }
  }, [selectedInvoiceID, fetchInvoiceData]);

  const invoiceCharge = invoiceData?.totalAmount || 0;
  const loanAmount = (0.8 * invoiceCharge).toFixed(2);
  const serviceCharge = (0.03 * invoiceCharge).toFixed(2);

  const handleGetAdvance = () => {
    // leave function blank for now
    // invoice.collateralize(invoice.contractId).then(...)
    console.log("Selected Invoice ID:", selectedInvoiceID);
    invoice.collateralize(BigInt(selectedInvoiceID)).then((response) => {
      console.log("Response from collateralize:", response);
      if (response.ok) {
        alert("Loan advance has been deposited to your wallet!");
      } else {
        alert("Failed to process advance. Please try again.");
      }
    });
  };

  return (
    <div className="loan-agreement-popup">
      <div className="invoice-charge">Invoice Charge = {invoiceCharge}</div>

      <div className="loan-amount">
        Loan Amount = {loanAmount} (80% of the Invoice Charge)
      </div>

      <div className="service-charge">
        Service Charge = {serviceCharge} (3% of the Invoice Charge)
      </div>

      <div className="loan-details">
        <p>{loanAmount} tokens will be deposited to your wallet.</p>
        <p>Amount will be recovered when the invoice is paid.</p>
        <p>A 3% service charge will be made.</p>
      </div>

      <div className="terms-checkbox">
        <label>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />{" "}
          I agree to the terms and conditions
        </label>
      </div>

      <div className="button">
        <button
          className="get-btn"
          disabled={!agreed}
          onClick={handleGetAdvance}
        >
          Get
        </button>
      </div>
    </div>
  );
};

export default LoanAgreement;
