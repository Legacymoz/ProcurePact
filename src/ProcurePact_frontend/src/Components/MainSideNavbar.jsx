import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useAuth } from "../Hooks/AuthContext";
import {
  FaHome,
  FaFileContract,
  FaUser,
  FaUsers,
  FaFileInvoice,
  FaSignOutAlt,
  FaSignInAlt,
} from "react-icons/fa";
import { ProcurePact_backend } from "declarations/ProcurePact_backend";
import "../styles/MainSideNavbarStyles.css";

const MainSideNavbar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  let navigate = useNavigate();
  const {
    authClient,
    onIdentityUpdate,
    createAuthClient,
    isAuthenticated,
    principal,
    user,
    setUser,
  } = useAuth();
  const location = useLocation(); // Get the current location

  // One day in nanoseconds
  const days = BigInt(1);
  const hours = BigInt(24);
  const nanoseconds = BigInt(3600000000000);

  const identityProvider = () => {
    if (process.env.DFX_NETWORK === "local") {
      return `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`;
    } else if (process.env.DFX_NETWORK === "ic") {
      return `https://${process.env.CANISTER_ID_INTERNET_IDENTITY}.ic0.app`;
    } else {
      Outlet;
      return `https://${process.env.CANISTER_ID_INTERNET_IDENTITY}.dfinity.network`;
    }
  };

  const login = async () => {
    await new Promise((resolve) => {
      authClient.login({
        identityProvider: identityProvider(),
        maxTimeToLive: days * hours * nanoseconds,
        onSuccess: resolve,
      });
    });

    await onIdentityUpdate();

    try {
      const userData = await ProcurePact_backend.getUser(
        authClient.getIdentity().getPrincipal()
      );
      if (userData && userData.length > 0) {
        setUser(userData[0]);
      } else if (userData && userData.length === 0) {
        setUser(null);
      }
    } catch (error) {
      // handle error
    }
  };

  //logout
  const logout = async () => {
    await authClient.logout();
    await onIdentityUpdate();
    navigate("/");
  };

  useEffect(() => {
    if (authClient == null) {
      createAuthClient();
    }
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/app/dashboard" },
    { name: "Contracts", icon: <FaFileContract />, path: "/app/contracts" },
    { name: "Profile", icon: <FaUser />, path: "/app/profile" },
    { name: "Connections", icon: <FaUsers />, path: "/app/connections" },
    { name: "Invoices", icon: <FaFileInvoice />, path: "/app/invoices" },
  ];

  return (
    <div className="main-sidenav expanded">
      {" "}
      {/* Always expanded */}
      {/* Logo Section */}
      <div className="logo-section">
        <span>Procure Pact</span>
      </div>
      {/* Menu Items */}
      <div className="menu-items">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`menu-item ${
              location.pathname === item.path ? "active" : ""
            }`} // Use location.pathname to check active path
            onClick={() => navigate(item.path)} // Use navigate for navigation
          >
            {item.icon}
            <span>{item.name}</span>
          </div>
        ))}
      </div>
      {/* Login/Logout Section */}
      <div className="auth-section" onClick={isAuthenticated ? logout : login}>
        {isAuthenticated ? <FaSignOutAlt /> : <FaSignInAlt />}
        <span>{isAuthenticated ? "Logout" : "Login"}</span>
      </div>
    </div>
  );
};

export default MainSideNavbar;
