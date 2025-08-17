import React from "react";
import "../styles/LandingProblemStyles.css"


const LandingProblem = () => {
  return (
    <section className="problemSection">
      <h2>Are you a small business struggling with cash flow?</h2>
      <div className="contentContainer">
        <div className="problemText">
          <p>
            Many small and medium-sized enterprises (SMEs) face a difficult
            reality: delayed payments starve them of the cash needed for
            operations. At the same time, traditional banks are often unwilling
            to lend, citing a lack of collateral and inconsistent financial
            documents.
          </p>
          <p className="tumainiStory">
            Meet <strong>Tumaini</strong>, a small agri-cooperative that
            connects onion farmers to clients in Nairobi. Like many SMEs, they
            struggle with late payments and can't access credit, trapping them
            in a cycle of limited growth.
          </p>
        </div>

        <div className="problemImage">
          <img
            src="../../public/business-owner.jpg"
            alt="Stressed business owner illustration"
          />
        </div>
      </div>
    </section>
  );
};

export default LandingProblem;
