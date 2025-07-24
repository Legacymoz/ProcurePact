import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { CLM_backend } from "declarations/CLM_backend";
import { useAuth } from "../Hooks/AuthContext";
import "../styles/DeliveryNote.css";
import { useNavigate } from "react-router-dom";

const DeliveryNote = () => {
  const selectedContract = useStore((state) => state.selectedContract);
  const { principal: userPrincipal } = useAuth(); // current logged-in user
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const { user, isAuthenticated, authClient } = useAuth();
  const [fullContract, setFullContract] = useState(null);
  const [contractValue, setContractValue] = useState(0);
  const navigate = useNavigate();


  // Fetch full contract details
  const fetchFullContractDetails = async () => {
    try {
      const response = await CLM_backend.getContractDetails(selectedContract);
      if (response.ok) {
        setFullContract(response.ok);
        setContractValue(response.ok.value);
        console.log("Fetched full contract details:", response.ok);
      } else {
        console.error("Error fetching full contract details:", response.err);
      }
    } catch (error) {
      console.error("Error fetching full contract details:", error);
    }
  };

  // Fetch contract details for a specific user
  const fetchContractDetails = async () => {
    try {
      const response = await CLM_backend.getContracts(
        authClient.getIdentity().getPrincipal()
      );

      const data = response.ok;

      // Identify the user's role
      const contract = data.find((c) => c.contractId === selectedContract);
      if (contract) {
        setContract(contract);
        console.log("Fetched contract:", contract);
        const role = Object.keys(contract.party.role)[0];
        setUserRole(role);
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
    }
  };

  useEffect(() => {
    fetchContractDetails();
    fetchFullContractDetails();
  }, []);

  const handleSubmit = async () => {
    const description = "DeliveryNote Accepted by Supplier"
    try {
      CLM_backend.addDeliveryNote(BigInt(selectedContract), description).then(
        (response) => {
          if (response.ok) {
            alert("Delivery note generated");
            navigate(-1); // Navigate back to the previous page
          } else {
            alert("Error adding delivery note");
            console.error("Error adding delivery note:", response.err);
          }
        }
      );
    } catch (error) {
        console.error("Error submitting delivery note:", error);
    }
  };

   if (!contract || !userRole) return <p>Loading contract...</p>;

  return (
    <div className="delivery-note-container">
      {userRole === "Supplier" ? (
        <div>
          <h2>Contract Pricing Details</h2>
          <table className="pricing-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {fullContract?.pricing?.map((price, index) => (
                <tr key={index}>
                  <td>{price.name}</td>
                  <td>{price.description}</td>
                  <td>{price.quantity}</td>
                  <td>{price.unit_price}</td>
                  <td>{price.quantity * price.unit_price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Add Delivery Note Button */}
          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <button className="add-delivery-note-btn" onClick={handleSubmit}>
              Add Delivery Note
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h2>Awaiting for Supplier to create a Delivery Note</h2>
        </div>
      )}
    </div>
  );
};

export default DeliveryNote;
