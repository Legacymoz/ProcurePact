import React, { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { useAuth } from "../Hooks/AuthContext";
import { CLM_backend } from "declarations/CLM_backend";
import "../styles/ConfirmDeliveryNote.css"; // Import your CSS file
import { useNavigate } from "react-router-dom";

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

const ConfirmDeliveryNote = () => {
  const selectedContract = useStore((state) => state.selectedContract);
  const { authClient } = useAuth();
  const [fullContract, setFullContract] = useState(null);
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  


  useEffect(() => {
    fetchContractDetails();
    fetchFullContractDetails();
  }, []);

  const fetchFullContractDetails = async () => {
    try {
      const response = await CLM_backend.getContractDetails(selectedContract);
      if (response.ok) {
        setFullContract(response.ok);
        console.log("Fetched full contract details:", response.ok);
      } else {
        console.error("Error fetching full contract details:", response.err);
      }
    } catch (error) {
      console.error("Error fetching full contract details:", error);
    }
  };

  const fetchContractDetails = async () => {
    try {
      const response = await CLM_backend.getContracts(
        authClient.getIdentity().getPrincipal()
      );
      const data = response.ok;
      const contract = data.find((c) => c.contractId === selectedContract);
      if (contract) {
        setContract(contract);
        const role = Object.keys(contract.party.role)[0];
        setUserRole(role);
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await CLM_backend.confirmDelivery(selectedContract);
      if (response.ok) {
        alert("Delivery Note confirmed successfully");
        navigate(-1); // Navigate back to the previous page
      } else {
        alert("Failed to confirm Delivery Note");
      }
    } catch (error) {
      console.error("Error submitting delivery note:", error);
      
    }
  };

  

  const deliveryNote = fullContract?.deliveryNote?.[0];
  const description =
    deliveryNote?.description || "No delivery note description found.";
  
  // console.log("Delivery Note Items:", items);

  const nestedItems = deliveryNote?.items?.[0] || [];
  const items = flattenItems(nestedItems);

  if (!fullContract || !userRole) return <p>Loading contract...</p>;

  return (
    <div className="confirm-container">
      {userRole === "Buyer" ? (
        <>
          <h2 className="confirm-title">Confirm Delivery Note</h2>

          <div className="confirm-description">
            <strong>Description:</strong>
            <p>{description}</p>
          </div>

          <div className="confirm-table-section">
            <h5 className="items-title">Items</h5>
            <table className="confirm-table">
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
            <div style={{ marginTop: "20px", textAlign: "right" }}>
              <button
                className="add-confirm-delivery-note-btn"
                onClick={handleSubmit}
              >
                Confirm Delivery Note
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="pending-message">
          <h4>Awaiting for Buyer to Confirm Delivery Note</h4>
        </div>
      )}
    </div>
  );
};

export default ConfirmDeliveryNote;
