import React from "react";
import "../../styles/HeroPageStyles.css";
import { useNavigate } from "react-router-dom";

const HeroPage = () => {
  const navigate = useNavigate();

  return (
    <div className="heroContainer" id="home">
      {/* Top heading */}
      <div className="heroHeading">
        <h1>
          Seamless Trade. <span className="highlight-text">Instant Cash Flow. </span>Smarter Growth.
        </h1>
        <p className="tagline">Grow your Business with Us</p>
      </div>

      {/* Two-column section */}
      <div className="contentSection">
        <div className="infoContainer">
          <p>
            We are a secure platform for SMEs to trade confidently—fast payments, easy access to credit, and streamlined vendor agreements across markets
          </p>
          <button className="heroButton" onClick={() => navigate("/app")}>
            Get Started
          </button>
        </div>

        <div className="imageContainer">
          <img src="/Landing/cartoon-handshake.jpg" alt="The handshake" />
        </div>
      </div>
    </div>
  );
};

export default HeroPage;
