import { Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../Hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import { ProcurePact_backend } from "declarations/ProcurePact_backend";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ReorderIcon from "@mui/icons-material/Reorder";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ListItemButton from "@mui/material/ListItemButton";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import "../styles/MainNavbarStyles.css";

const MainNavbar = () => {
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

  //sidebar stuff
  const [open, setOpen] = useState(false);
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <div className="drawer-logo-block">
        <span className="drawer-logo-text">ProcurePact</span>
        {/* Or use <img src="/logo.svg" alt="ProcurePact Logo" className="drawer-logo-img" /> */}
      </div>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemIcon>
              <ReorderIcon />
            </ListItemIcon>
            <ListItemText primary="Contracts" />
          </ListItemButton>
        </ListItem>
      </List>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/profile">
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
      </List>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/connections">
            <ListItemIcon>
              <PeopleAltIcon />
            </ListItemIcon>
            <ListItemText primary="Connections" />
          </ListItemButton>
        </ListItem>
      </List>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/invoiceList">
            <ListItemIcon>
              <ReorderIcon />
            </ListItemIcon>
            <ListItemText primary="Invoices" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
  return (
    <div className="main-navbar-container">
      <nav className="navbar">
        <div className="container1">
          <Button onClick={toggleDrawer(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="black"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
              />
            </svg>
          </Button>

          <div className="navbar-brand-block">
            <Link to="/" className="navbar-brand-link">
              ProcurePact
            </Link>
          </div>
        </div>

        <div className="container2">
          <div className="navbar-text">
            <span>
              {isAuthenticated
                ? `Welcome, ${!user ? principal.toText() : user.name}`
                : "Please log in"}
            </span>
          </div>

          <button onClick={isAuthenticated ? logout : login}>
            {isAuthenticated ? "Log out" : "Log in"}
          </button>
        </div>
      </nav>

      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
};

export default MainNavbar;
