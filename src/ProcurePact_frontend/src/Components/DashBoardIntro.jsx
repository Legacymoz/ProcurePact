import React from "react";
import "../styles/DashBoardIntroStyles.css";

const DashBoardIntro = () => {
  return (
    <div className="main-intro-container">
      <div className="info-container">
        <h1>Hi, Maestro</h1>
        <p>Ready to manage your contracts and parties?</p>
      </div>
      <div className="image-container">
        <img src="Sitted-girl-intro.png" alt="Dashboard intro" />
        {/* <img src="Focused Tech Enthusiast in Orange.png" alt="Dashboard intro" /> */}
      </div>
    </div>
  );
};
export default DashBoardIntro;
