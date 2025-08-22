
import "../styles/LayoutStyles.css";
import MainNavbar from "./MainNavbar";
import { Outlet } from "react-router-dom";
import MainSideNavbar from "./MainSideNavbar";
import ProcureChat from "./ProcureChat/ProcureChat";

const Layout = () => {
  return (
    <div className="layout-container">
      <div className="navigation">
        {/* <MainNavbar /> */}
        <MainSideNavbar />
      </div>

      <div className="main-content">
        <Outlet />
        <ProcureChat/>
      </div>
    </div>
  );
};

export default Layout;









