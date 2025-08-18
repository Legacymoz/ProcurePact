import React from 'react'
import DashBoardIntro from '../Components/Dashboard/DashBoardIntro'
import "../styles/DashboardStyles.css"
import Overview from '../Components/Dashboard/Overview'
import InvoicesDue from '../Components/Dashboard/InvoicesDue'
import ContractsOverview from '../Components/Dashboard/ContractsOverview'


const Dashboard = () => {
  return (
    <div className="main-dashboard-container">
      <div className="intro-dash-container">
        <DashBoardIntro />
      </div>
      <div className="overview-dash-container">
        <Overview />
      </div>
      <div className="sub-container-3">
        <div className="invoice-container">
          <InvoicesDue />
        </div>
        <div className="contract-container">
          <ContractsOverview />
        </div>
      </div>
    </div>
  );
}

export default Dashboard