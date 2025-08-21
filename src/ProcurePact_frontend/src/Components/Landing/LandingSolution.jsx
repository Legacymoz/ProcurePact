import React from "react";
import "../../styles/LandingSolutionStyles.css";

const LandingSolution = () => {
  return (
    <section className="solutionSection" id="solution">
      <h2>ProcurePact: The Trusted Online Platform for Seamless Trade</h2>
      <p className="solutionIntro">
        ProcurePact is a single, trusted platform designed to solve the biggest
        challenges faced by SMEs.
      </p>

      <div className="pillarsContainer">
        <div className="pillarCard">
          <img
            src="../../../public/Landing/reliable-Payment.png"
            alt="Reliable Payment Assurance"
            className="pillarImage"
          />
          <h3>Reliable Payment Assurance</h3>
          <p>
            Ensure secure and timely payments for every transaction, giving SMEs
            peace of mind and financial stability.
          </p>
        </div>

        <div className="pillarCard">
          <img
            src="../../../public/Landing/Credit.png"
            alt="Flexible Access to Credit"
            className="pillarImage"
          />
          <h3>Flexible Access to Credit</h3>
          <p>
            Unlock instant liquidity with tailored financing options to keep
            your operations running smoothly.
          </p>
        </div>

        <div className="pillarCard">
          <img
            src="../../../public/Landing/smartContract.png"
            alt="Smart Contract Management"
            className="pillarImage"
          />
          <h3>Smart Contract Management</h3>
          <p>
            Automate and manage trade contracts with full transparency, reducing
            disputes and streamlining operations.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingSolution;
