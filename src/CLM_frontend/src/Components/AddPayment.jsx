import {useEffect, useState } from "react";
import "../styles/AddPaymentStyles.css";
import { useStore } from '../store/useStore';
import { CLM_backend } from "declarations/CLM_backend";


const AddPayment = ({ currentPaymentTerm }) => {
  const [payment, setPayment] = useState(
    currentPaymentTerm && currentPaymentTerm[0]
      ? Object.keys(currentPaymentTerm[0])[0]
      : ""
  );
  const selectedContract = useStore((state) => state.selectedContract);
  const handleSubmit = async () => {
    console.log("Payment Terms", payment)

    try {
      await CLM_backend.updatePayementTerms(BigInt(selectedContract), { [payment]: null }).then((response) => {
        if (response.ok) {
          alert("Payment terms updated successfully!");
        } else {
          alert("Error updating payment terms");
          console.log(response.err);
        }
      });
      // Optionally, you can also update the zustand store or trigger a re-fetch of
      // contracts to reflect the changes in the UI.
      // For example:
      // fetchContracts();
      // Or update the store state if you have a method for that.
      // setSelectedContract(null); // Reset the selected contract if needed


    } catch (error) {
      console.error("Error adding parties:", error);
    }
  };

  useEffect(()=>{
    console.log("current payment term", currentPaymentTerm)
  },[])

  return (
    <div className="contract-section-container">
      <h2 className="contract-section-heading">Payment Details</h2>
      <select value={payment} onChange={(e) => setPayment(e.target.value)}>
        <option value="">Choose your Option</option>
        <option value="OnDelivery">On Delivery </option>
      </select>
      <button onClick={handleSubmit} className="submit-button">
        Save
      </button>
    </div>
  );
};

export default AddPayment;
