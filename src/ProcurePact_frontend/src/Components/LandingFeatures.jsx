import React from "react";
import "../styles/LandingFeaturesStyles.css";

const LandingFeatures = () => {
  return (
    <section className="featuresSection">
      <h2>Features That Power Your Growth</h2>

      <div className="featuresContainer">
        <div className="featureCard">
          <img
            src="../../public/escrow-settlement.jpg"
            alt="Instant Escrow Settlement"
            className="featureImage"
          />
          <h3>Instant Escrow Settlement</h3>
          <p>
            Enable immediate, trusted payments for on-delivery deals. This
            eliminates delays and disputes by using an integrated escrow
            service.
          </p>
        </div>

        <div className="featureCard">
          <img
            src="../../public/invoice-financing.jpg"
            alt="Invoice-Backed Financing"
            className="featureImage"
          />
          <h3>Invoice-Backed Financing</h3>
          <p>
            Turn your pending invoices into instant collateral to access
            short-term credit when you need it most.
          </p>
        </div>

        <div className="featureCard">
          <img
            src="../../public/smart-contract.jpg"
            alt="Smart Contract Lifecycle Management"
            className="featureImage"
          />
          <h3>Smart Contract Lifecycle Management (CLM)</h3>
          <p>
            Handle vendor agreements, invoices, and delivery notes in one place,
            with zero-cost digital documentation.
          </p>
        </div>

        <div className="featureCard">
          <img
            src="../../public/blockchain-security.jpg"
            alt="Fraud-Proof Transactions"
            className="featureImage"
          />
          <h3>Fraud-Proof Transactions</h3>
          <p>
            All records are stored on an immutable blockchain ledger, ensuring
            end-to-end transparency and security.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
