import React from "react";
import "../styles/HeroPageStyles.css";

const HeroPage = () => {
  return (
    <div className="heroContainer">
      {/* Top heading */}
      <div className="heroHeading">
        <h1>
          Secure Your Trade.{" "}
          <span className="highlight-text">Automate Your Finance.</span>
        </h1>
        <p className="tagline">Grow your Business with Us</p>
      </div>

      {/* Two-column section */}
      <div className="contentSection">
        <div className="infoContainer">
          <p>
            A trusted online platform for small and medium-sized enterprises to
            ensure reliable payments, unlock instant liquidity, and streamline
            trade operations.
          </p>
          <button className="heroButton">Get Started</button>
        </div>

        <div className="imageContainer">
          <img src="/cartoon-handshake.jpg" alt="The handshake" />
        </div>
      </div>
    </div>
  );
};

export default HeroPage;
