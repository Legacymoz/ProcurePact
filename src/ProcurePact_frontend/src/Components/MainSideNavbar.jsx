import { Outlet, useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useAuth } from "../Hooks/AuthContext";
//OISY wallet imports
import { IcrcWallet } from '@dfinity/oisy-wallet-signer/icrc-wallet'
import { ledgerStore } from "../store/ledgerStore";
//End of OISY imports
import {
  FaHome,
  FaFileContract,
  FaUser,
  FaUsers,
  FaFileInvoice,
  FaSignOutAlt,
  FaSignInAlt,
  FaMoneyBill,
} from "react-icons/fa";
import OisyIcon from "./OISY/OisyIcon";
import { ProcurePact_backend } from "declarations/ProcurePact_backend";
import "../styles/MainSideNavbarStyles.css";

const MainSideNavbar = () => {
  const { createLedger } = ledgerStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [wallet, setWallet] = useState(null);
  //test
  const [metadata, setMetadata] = useState(null);
  let navigate = useNavigate();
  const {
    authClient,
    onIdentityUpdate,
    createAuthClient,
    isAuthenticated,
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
    disconnectWallet();
    navigate("/");
  };

  useEffect(() => {
    if (authClient == null) {
      createAuthClient();
    }
  }, []);

  const canisterProvider = () => {
    if (process.env.DFX_NETWORK === "local") {
      return process.env.CANISTER_ID_ICRC1_LEDGER_CANISTER;
    } else if (process.env.DFX_NETWORK === "ic") {
      //ckUSDT ledger
      return "cefgz-dyaaa-aaaar-qag5a-cai"
    }
  };

  const hostProvider = () => {
    if (process.env.DFX_NETWORK === "local") {
      return 'http://localhost:4943'
    } else if (process.env.DFX_NETWORK === "ic") {
      return null;
    }
  }
  //handle ledger connection
  useEffect(() => {
    if (authClient?.isAuthenticated()) {
      createLedger(authClient?.getIdentity(), canisterProvider(), hostProvider())
    }
  }, [authClient]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  //OISY Wallet Stuff
  const connectWallet = async () => {
    try {
      const wallet = await IcrcWallet.connect({
        url: 'https://staging.oisy.com/sign',
        host: 'http://localhost:4943'
      });
      setWallet(wallet);
    } catch (error) {
      console.log(error)
    }
  };

  const disconnectWallet = () => {
    wallet?.disconnect();
  };

  //end of Oisy stuff

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/app/dashboard" },
    { name: "Contracts", icon: <FaFileContract />, path: "/app/contracts" },
    { name: "Profile", icon: <FaUser />, path: "/app/profile" },
    { name: "Connections", icon: <FaUsers />, path: "/app/connections" },
    { name: "Invoices", icon: <FaFileInvoice />, path: "/app/invoices" },
    { name: "Finance", icon: <FaMoneyBill />, path: "/app/finance" },
    { name: "OISY Wallet", icon: <OisyIcon /> },
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
            className={`menu-item ${location.pathname === item.path ? "active" : ""
              }`} // Use location.pathname to check active path
            onClick={item.name !== "OISY Wallet" ? () => navigate(item.path) : () => connectWallet()} // Use navigate for navigation
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
