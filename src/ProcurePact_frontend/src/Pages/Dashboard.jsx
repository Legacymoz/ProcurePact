import React from 'react'
import DashBoardIntro from '../Components/DashBoardIntro'
import "../styles/DashboardStyles.css"
import Overview from '../Components/Overview'
import InvoicesDue from '../Components/InvoicesDue'
import ContractsOverview from '../Components/ContractsOverview'


const Dashboard = () => {
  return (
    <div className="main-dashboard-container">
      <DashBoardIntro />
      <Overview />
      <div className="sub-container-2">
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