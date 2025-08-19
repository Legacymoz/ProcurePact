import React from "react";
import InvoiceViewImage from "../Components/InvoiceViewImage";
import InvoiceViewList from "../Components/InvoiceViewList";
import "../styles/InvoiceViewPageStyles.css";

const InvoiceViewPage = () => {
  return (
    <div className="invoice-view-page-container">
      <div className="list-container">
        <InvoiceViewList />
      </div>

      <div className="image-page-container">
        <InvoiceViewImage />
      </div>
    </div>
  );
};

export default InvoiceViewPage;
