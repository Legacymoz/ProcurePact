import React from "react";
import "../../styles/LandingSolutionStyles.css";

const LandingSolution = () => {
  return (
    <section className="solutionSection" id="solution">
      <h2>ProcurePact: Powering SME Trade with Liquidity & Trust</h2>
      <p className="solutionIntro">
        We give SMEs the tools to trade confidently. Instant payments, access to
        credit, and seamless contract management in one secure platform.
      </p>

      <div className="featuresContainer">
        <div className="featureCard">
          <img
            src="../../../public/Landing/usdt.png"
            alt="Instant Stablecoin Payments"
            className="featureImage"
          />
          <h3>Instant Stablecoin Payments</h3>
          <p>
            Settle deals instantly with escrow-backed stablecoin payments. No
            more delays, fewer disputes, and stronger vendor trust.
          </p>
        </div>

        <div className="featureCard">
          <img
            src="../../../public/Landing/invoice.png"
            alt="Invoice-Backed Credit"
            className="featureImage"
          />
          <h3>Invoice-Backed Credit</h3>
          <p>
            Turn pending invoices into working capital. Unlock short-term
            liquidity when you need it most, without traditional collateral.
          </p>
        </div>

        <div className="featureCard">
          <img
            src="../../../public/Landing/smartContract.png"
            alt="Smart Contract Lifecycle"
            className="featureImage"
          />
          <h3>Smart Contract Lifecycle</h3>
          <p>
            Manage vendor agreements, delivery notes, and invoices in one place.
            Automated workflows reduce friction and speed up trade.
          </p>
        </div>

        <div className="featureCard">
          <img
            src="../../../public/Landing/fraud-proof.png"
            alt="Fraud-Proof Transactions"
            className="featureImage"
          />
          <h3>Fraud-Proof Transactions</h3>
          <p>
            Every record is secured on an immutable blockchain ledger, ensuring
            end-to-end transparency and fraud prevention.
          </p>
        </div>

        <div className="featureCard comingSoon">
          <img
            src="../../../public/Landing/analytics.jpg"
            alt="Real-Time Business Intelligence"
            className="featureImage"
          />
          <h3>
            Real-Time Business Intelligence <span className="comingSoonTag">Coming Soon</span>
          </h3>
          <p>
            Gain instant insights into payments, cash flow, and trade
            performance with real-time analytics—helping SMEs make smarter,
            data-driven decisions.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingSolution;
