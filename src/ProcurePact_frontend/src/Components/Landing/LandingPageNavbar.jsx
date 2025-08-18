import React from "react";
import "../../styles/LandingPageNavbarStyles.css";
import { useNavigate } from "react-router-dom";


const Navbar = () => {
  const navigate = useNavigate();

  const handleScroll = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="landing-navbar">
      <div className="logo">ProcurePact</div>
      <ul className="navLinks">
        <li onClick={() => handleScroll("home")}>Home</li>
        <li onClick={() => handleScroll("problem")}>Problem</li>
        <li onClick={() => handleScroll("features")}>Features</li>
        <li onClick={() => handleScroll("solution")}>Solution</li>
        <li onClick={() => handleScroll("contact")}>Contact</li>
      </ul>
      <button className="getStartedButton" onClick={() => navigate("/")}>Get Started</button>
    </nav>
  );
};

export default Navbar;
