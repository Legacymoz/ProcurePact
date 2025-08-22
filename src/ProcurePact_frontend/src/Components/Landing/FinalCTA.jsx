import React from "react";
import "../../styles/FinalCTAStyles.css";

const FinalCTA = () => {
  return (
    <section className="finalCtaSection" id="contact">
      <div className="ctaContent">
        <h2>Ready to Secure Your Trade and Unlock Your Growth?</h2>
        <p>
          Take control of your cash flow, protect every transaction, and grow
          with confidence — all in one platform.
        </p>
        <button className="ctaButton">Join the Waitlist</button>
      </div>
      <div className="ctaImageWrapper">
        <img
          src="../../../public/Landing/Laptop-Interface.png"
          alt="ProcurePact Dashboard"
          className="ctaImage"
        />
      </div>
    </section>
  );
};

export default FinalCTA;
