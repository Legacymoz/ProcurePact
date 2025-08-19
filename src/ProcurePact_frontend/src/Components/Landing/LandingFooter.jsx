import React from "react";
import "../../styles/LandingFooterStyles.css";
import { FaTwitter, FaLinkedin, FaFacebookF } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footerContent">
        <div className="footerLeft">
          <h3>ProcurePact</h3>
          <p>© {new Date().getFullYear()} ProcurePact. All rights reserved.</p>
        </div>

        <ul className="footerLinks">
          <li>
            <a href="/about">About Us</a>
          </li>
          <li>
            <a href="/contact">Contact</a>
          </li>
          <li>
            <a href="/terms">Terms of Service</a>
          </li>
          <li>
            <a href="/privacy">Privacy Policy</a>
          </li>
        </ul>

        <div className="footerSocials">
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <FaTwitter />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">
            <FaLinkedin />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <FaFacebookF />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
