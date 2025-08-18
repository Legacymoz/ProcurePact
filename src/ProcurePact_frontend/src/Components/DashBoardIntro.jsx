import React from "react";
import "../styles/DashBoardIntroStyles.css";
import { useAuth } from "../Hooks/AuthContext";

const DashBoardIntro = () => {
  const { user, principal } = useAuth();

  return (
    <div className="main-intro-container">
      <div className="info-container">
        <h1>Welcome, {user?.name || "User"}!</h1>
        <p className="principal">Principal: {principal?.toText() || "N/A"}</p>
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
