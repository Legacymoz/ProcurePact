import React from "react";
import "../styles/OverviewStyles.css";

const Overview = () => {
  return (
    <div className="main-overview-container">
      <h2 className="overview-title">Overview</h2>
      <div className="overview-cards-container">
        {/* Balance Card */}
        <div
          className="overview-card"
          style={{ background: "linear-gradient(135deg, #ff8800 60%, #ffb366 100%)" }}
        >
          <div className="overview-card-left">
            <div className="overview-icon-bg" style={{ background: "rgba(255,136,0,0.45)" }}>
              {/* Coin Icon */}
              <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm1 17.93V20h-2v-.07A8.001 8.001 0 0 1 4.07 13H4v-2h.07A8.001 8.001 0 0 1 11 4.07V4h2v.07A8.001 8.001 0 0 1 19.93 11H20v2h-.07A8.001 8.001 0 0 1 13 19.93z"/>
              </svg>
            </div>
          </div>
          <div className="overview-card-right">
            <div className="overview-card-value">$12,500</div>
            <div className="overview-card-label">Balance</div>
          </div>
        </div>
        {/* Contracts Card */}
        <div
          className="overview-card"
          style={{ background: "linear-gradient(135deg, #007bff 60%, #66b3ff 100%)" }}
        >
          <div className="overview-card-left">
            <div className="overview-icon-bg" style={{ background: "rgba(0,123,255,0.45)" }}>
              {/* Document Icon */}
              <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                <path d="M19 2H8c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2v-2h1c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 16H5V8h14v10zm-2-12H8V4h9v2z"/>
              </svg>
            </div>
          </div>
          <div className="overview-card-right">
            <div className="overview-card-value">8</div>
            <div className="overview-card-label">Contracts</div>
          </div>
        </div>
        {/* Invoices Card */}
        <div
          className="overview-card"
          style={{ background: "linear-gradient(135deg, #28a745 60%, #85e085 100%)" }}
        >
          <div className="overview-card-left">
            <div className="overview-icon-bg" style={{ background: "rgba(40,167,69,0.45)" }}>
              {/* Invoice Icon */}
              <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                <path d="M21 8V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v1H1v2h2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8h2V8h-2zm-2 10H5V8h14v10zm-2-12H8V4h9v2z"/>
              </svg>
            </div>
          </div>
          <div className="overview-card-right">
            <div className="overview-card-value">15</div>
            <div className="overview-card-label">Invoices</div>
          </div>
        </div>
        {/* Connections Card */}
        <div
          className="overview-card"
          style={{ background: "linear-gradient(135deg, #ff3366 60%, #ff99b3 100%)" }}
        >
          <div className="overview-card-left">
            <div className="overview-icon-bg" style={{ background: "rgba(255,51,102,0.45)" }}>
              {/* Connection Icon */}
              <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 13.36 17 14.28 17 15.5V19h7v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
          </div>
          <div className="overview-card-right">
            <div className="overview-card-value">4</div>
            <div className="overview-card-label">Connections</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;