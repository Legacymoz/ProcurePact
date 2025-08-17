
import "../styles/LayoutStyles.css";
import MainNavbar from "./MainNavbar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <MainNavbar />

      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
};

export default Layout;









