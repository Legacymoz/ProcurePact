import {useState } from "react";
import "../styles/AddPaymentStyles.css";
import { useStore } from '../store/useStore';
import { CLM_backend } from "declarations/CLM_backend";


const AddPayment = ({ currentPaymentTerm }) => {
  const [payment, setPayment] = useState(Object.keys(currentPaymentTerm?.[0])[0]);
  const selectedContract = useStore((state) => state.selectedContract);
  const handleSubmit = async () => {
    console.log("Payment Terms", payment)

    try {
      const data = await CLM_backend.updatePayementTerms(BigInt(selectedContract), { [payment]: null });
      console.log("Parties added successfully:", data);


    } catch (error) {
      console.error("Error adding parties:", error);
    }
  };

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
