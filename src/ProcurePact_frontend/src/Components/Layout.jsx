
import "../styles/LayoutStyles.css";
import MainNavbar from "./MainNavbar";
import { Outlet } from "react-router-dom";
import MainSideNavbar from "./MainSideNavbar";

const Layout = () => {
  return (
    <div className="layout-container">
      <div className="navigation">
        {/* <MainNavbar /> */}
        <MainSideNavbar />
      </div>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;









