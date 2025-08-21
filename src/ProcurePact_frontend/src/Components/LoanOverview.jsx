import React, { useMemo } from "react";
import "../styles/LoanOverviewStyles.css";
import { FaCoins, FaFileInvoice } from "react-icons/fa";

const LoanOverview = ({ invoices }) => {
  // Calculate total loanable amount (80% of totalAmount for each invoice)
  // const totalLoanAmount = useMemo(() => {
  //   if (!invoices || invoices.length === 0) return 0;
  //   return invoices
  //     .reduce((acc, inv) => acc + inv.totalAmount * 0.8, 0)
  //     .toFixed(2);
  // }, [invoices]);

  const totalLoanAmount = useMemo(() => {
    if (!invoices || invoices.length === 0) return 0;

    return invoices
      .filter((inv) => inv.status && inv.status.Pending !== undefined) // keep only Pending
      .reduce((acc, inv) => acc + inv.totalAmount * 0.8, 0)
      .toFixed(2);
  }, [invoices]);

  // Number of loans
  const numberOfLoans = invoices ? invoices.length : 0;

  return (
    <div className="loan-overview-container">
      {/* Total Loanable Amount Card */}
      <div
        className="loan-overview-card"
        style={{
          background: "linear-gradient(135deg, #ff8800 60%, #ffb366 100%)",
        }}
      >
        <div className="loan-overview-card-left">
          <div
            className="loan-overview-icon-bg"
            style={{ background: "rgba(255,136,0,0.45)" }}
          >
            <FaCoins size={28} color="white" />
          </div>
        </div>
        <div className="loan-overview-card-right">
          <div className="loan-overview-card-value">${totalLoanAmount}</div>
          <div className="loan-overview-card-label">Total Loan Amount</div>
        </div>
      </div>

      {/* Number of Loans Card */}
      <div
        className="loan-overview-card"
        style={{
          background: "linear-gradient(135deg, #007bff 60%, #66b3ff 100%)",
        }}
      >
        <div className="loan-overview-card-left">
          <div
            className="loan-overview-icon-bg"
            style={{ background: "rgba(0,123,255,0.45)" }}
          >
            <FaFileInvoice size={28} color="white" />
          </div>
        </div>
        <div className="loan-overview-card-right">
          <div className="loan-overview-card-value">{numberOfLoans}</div>
          <div className="loan-overview-card-label">Number of Loans</div>
        </div>
      </div>
    </div>
  );
};

export default LoanOverview;
