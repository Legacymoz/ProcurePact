import React from "react";
import "../styles/SocialProofStyles.css";
import SocialProofChart from "./SocialProofChart";


const SocialProof = () => {
  return (
    <section className="socialProofSection">
      <h2>Trusted by the Backbone of Our Economy</h2>

      <div className="statsContainer">
        <div className="statCard">
          <h3>90%</h3>
          <p>of all businesses in Kenya are SMEs</p>
        </div>
        <div className="statCard">
          <h3>40%</h3>
          <p>of Kenya's GDP comes from SMEs</p>
        </div>
        <div className="statCard">
          <h3>1M+</h3>
          <p>SMEs benefit from better trade & finance tools</p>
        </div>
      </div>

      <div className="chartWrapper">
        <SocialProofChart />
      </div>

      <blockquote className="testimonial">
        <p>
          "Before ProcurePact, we waited months for payments. Now, cash flow is
          steady, and we can focus on growing our cooperative."
        </p>
        <footer>- Tumaini, Agri-Cooperative Owner</footer>
      </blockquote>
    </section>
  );
};

export default SocialProof;
