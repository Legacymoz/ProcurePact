import React from "react";
import "../../styles/LandingProblemStyles.css"


const LandingProblem = () => {
  return (
    <section className="problemSection" id="problem">
      <h2>SMEs are locked out of growth.</h2>
      <div className="contentContainer">
        <div className="problemText">
          <p>
            Cross-border trade should be simple—but for SMEs, it's broken.
            Payments take weeks, FX fees eat away margins, and banks won't
            extend credit without collateral.
          </p>
          <div className="statsContainer">
            <div className="statCard">
              <h3>50%</h3>
              <p>Of SMEs cannot access credit</p>
            </div>
            <div className="statCard">
              <h3>3-5 days</h3>
              <p>Average payment periods for intra-african trade </p>
            </div>
            <div className="statCard">
              <h3>10%</h3>
              <p>Cross-border transaction fees in Africa</p>
            </div>
            <div className="statCard">
              <h3>60%</h3>
              <p>Of SMEs have cash flow gaps</p>
            </div>
          </div>
        </div>
        <div className="problemImage">
          <img
            src="Landing/business-owner.jpg"
            alt="Frustrated SME owner facing payment delays"
          />
        </div>
      </div>
    </section>
  );
};


export default LandingProblem;
