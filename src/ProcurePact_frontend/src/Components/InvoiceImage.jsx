import React, { useState, useEffect } from "react";
import "../styles/InvoiceImageStyles.css";
import { useStore } from "../store/useStore";
import { useAuth } from "../Hooks/AuthContext";
import { Principal } from "@dfinity/principal";
import { ProcurePact_backend } from "declarations/ProcurePact_backend";

//flatten items linked list
function flattenItems(nestedArray) {
  const flatItems = [];

  function flatten(item) {
    if (Array.isArray(item)) {
      item.forEach(flatten);
    } else {
      flatItems.push(item);
    }
  }
  flatten(nestedArray);
  return flatItems;
}

const InvoiceImage = () => {
  const [issuer, setIssuer] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const { principal } = useAuth();
  const {
    invoiceData,
    fetchInvoiceData,
    selectedInvoiceID,
    getUserInfo,
    userInfo,
    getUserInfoandReturn,
  } = useStore();

  // console.log("Trying to view the Invoice");

  // Function to fetch user info for a principal and set to state
  const fetchAndSetUserInfo = async (principal, setFn) => {
    console.log("The principal that is going to the function:", principal);
    const data = await getUserInfoandReturn(principal);
    console.log("Fetched user info:", data);
    setFn({ principal, info: data });
  };


  useEffect(() => {
    // console.log("Inside UseEffect of fetching the InvoiceData");
    if (selectedInvoiceID) {
      fetchInvoiceData(selectedInvoiceID);
      // console.log("Selected Invoice Data:", invoiceData);
    }
  }, [selectedInvoiceID, fetchInvoiceData]);

  useEffect(() => {
    const fetchBothUserInfos = async () => {
      if (invoiceData && invoiceData.recipient && invoiceData.issuer) {
        const recipientPrincipal = invoiceData.recipient._arr;
        const issuerPrincipal = invoiceData.issuer._arr;

        console.log(
          "Principal to push to the fetch",
          Principal.fromUint8Array(recipientPrincipal)
        );

        if (recipientPrincipal) {
          console.log("Fetching user info for recipient:", recipientPrincipal);
          fetchAndSetUserInfo(
            Principal.fromUint8Array(recipientPrincipal),
            setRecipient
          );
          
        }
        if (issuerPrincipal) {
          fetchAndSetUserInfo(
            Principal.fromUint8Array(issuerPrincipal),
            setIssuer
          );
        }
      }
    };
    fetchBothUserInfos();
  }, [invoiceData]);

  useEffect(() => {
    if (issuer) console.log("Issuer:", issuer);
  }, [issuer]);

  useEffect(() => {
    if (recipient) console.log("Recipient:", recipient);
  }, [recipient]);

  const items = invoiceData?.items ? flattenItems(invoiceData.items) : [];

  if (!invoiceData || !issuer || !recipient) return <div className="loading-container">Loading...</div>;

  return (
    <div className="invoice-view-container ">
      {/* Header */}
      <header className="invoice-header">
        <div className="invoice-issuer">
          <h1>{issuer.info?.name}</h1>
          <p>Address: {issuer.info?.address}</p>
          <p>
            Email: {issuer.info?.email} | Phone: {issuer.info?.phone}
          </p>
        </div>
        <div className="invoice-details">
          <h2>INVOICE</h2>
          <p>
            <strong>Invoice ID:</strong> {selectedInvoiceID}
          </p>
          <p>
            <strong>Date Issued:</strong>{" "}
            {invoiceData?.createdAt
              ? new Date(
                  Math.floor(Number(invoiceData.createdAt)) / 1_000_000
                ).toDateString()
              : ""}
          </p>
        </div>
      </header>

      <section className="invoice-recipient">
        <h3>Bill To</h3>
        <p>
          <strong>ID:</strong> {recipient.principal.toText()}
        </p>
        <p>
          <strong>Name:</strong> {recipient.info?.name}
        </p>
        <p>
          <strong>Email:</strong> {recipient.info?.email}
        </p>
        <p>
          <strong>Phone:</strong> {recipient.info?.phone}
        </p>
      </section>

      <section className="invoice-items-info">
        <h3>Itemized Charges</h3>
        <table className="pricing-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit_price}</td>
                  <td>{item.quantity * item.unit_price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-items">
                  No items available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="invoice-totals">
          <p>May include late penalties</p>
          <p>
            <strong>Total:</strong> ${invoiceData?.totalAmount}
          </p>
        </div>
      </section>

      <section className="invoice-payment-terms">
        <h3>Payment Terms</h3>
        <p>
          <strong>Due Date:</strong>{" "}
          {invoiceData?.dueDate
            ? new Date(
                Math.floor(Number(invoiceData.dueDate)) / 1_000_000
              ).toDateString()
            : ""}
        </p>
        <p>
          <strong>Penalty:</strong> {invoiceData?.penalty} per day late
        </p>
      </section>

      <section className="invoice-notes">
        <h3>Additional notes by Supplier</h3>
        <p>{invoiceData?.notes}</p>
      </section>
    </div>
  );
};

export default InvoiceImage;
