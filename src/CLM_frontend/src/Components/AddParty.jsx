import { useEffect, useState } from "react";
import "../styles/AddPartyStyles.css";
import { CLM_backend } from "declarations/CLM_backend";
import { useAuth } from "../Hooks/AuthContext";
import { useStore } from "../store/useStore";

const AddParty = () => {
  const [parties, setParties] = useState([]);
  const { user, principal } = useAuth();
  const selectedContract = useStore((state) => state.selectedContract);

  try {
    CLM_backend.getContracts(principal).then((fetchedContracts) => {
      console.log("Fetched contracts:", fetchedContracts);
    });
  } catch (error) {
    console.error("Error fetching contracts:", error);
  }

  useEffect(() => {
    console.log(
      "This is my principal",
      authClient.getIdentity().getPrincipal().toText()
    );
  }, []);

  const addParty = () => {
    const newParty = {
      id: "",
      role: "",
    };
    setParties([...parties, newParty]);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...parties];
    updated[index][field] = value;
    setParties(updated);
  };

  const removeParty = (indexToRemove) => {
    const updatedParties = parties.filter(
      (_, index) => index !== indexToRemove
    );
    setParties(updatedParties);
  };

  const handleSubmit = async () => {
    console.log("Parties added:", parties);

    try {
      const data = await CLM_backend.invitePartiesToContract(
        selectedContract,
        parties
      );
      console.log("Parties added successfully:", data);
    } catch (error) {
      console.error("Error adding parties:", error);
    }
  };

  return (
    <div className="contract-section-container">
      <div className="contract-header">
        <button onClick={addParty} className="add-button">
          Add
        </button>
        <h2 className="contract-section-heading">Add Party</h2>
      </div>

      {parties.length > 0 ? (
        <div className="party-list">
          {parties.map((party, index) => (
            <div key={index} className="party-item">
              <input
                type="text"
                placeholder="Enter party ID"
                value={party.id}
                onChange={(e) => handleInputChange(index, "id", e.target.value)}
              />
              <select
                value={party.role}
                onChange={(e) =>
                  handleInputChange(index, "role", e.target.value)
                }
              >
                <option value="">Select role</option>
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
              </select>

              <div className="delete-button-container">
                <button
                  onClick={() => removeParty(index)}
                  className="delete-button"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button onClick={handleSubmit} className="submit-button">
            Save
          </button>
        </div>
      ) : (
        <p className="empty-state">No parties added</p>
      )}
    </div>
  );
};

export default AddParty;
