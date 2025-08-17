import { useEffect, useState } from "react";
import "../styles/AddPaymentStyles.css";
import { useStore } from '../store/useStore';
import { ProcurePact_backend } from "declarations/ProcurePact_backend";


const AddPayment = ({ currentPaymentTerm }) => {
  const [payment, setPayment] = useState(
    currentPaymentTerm && currentPaymentTerm[0]
      ? Object.keys(currentPaymentTerm[0])[0]
      : ""
  );
  const [deferredPayment, setDeferredPayment] = useState({
    due: "",
    penalty: ""
  });

  // Convert YYYY-MM-DD to nanoseconds
  const timestamp = (date) => { return BigInt(new Date(date).getTime()) * 1000000n };


  const selectedContract = useStore((state) => state.selectedContract);
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Payment Terms", payment)

    try {
      await ProcurePact_backend.updatePayementTerms(BigInt(selectedContract), payment === "OnDelivery" ? { [payment]: null } : { [payment]: { due: timestamp(deferredPayment.due), penalty: BigInt(deferredPayment.penalty) } }).then((response) => {
        if (response.ok) {
          alert("Payment terms updated successfully!");
        } else {
          alert("Error updating payment terms");
          console.log(response.err);
        }
      });
    } catch (error) {
      console.error("Error adding parties:", error);
    }
  };

  useEffect(() => {
    if (currentPaymentTerm && currentPaymentTerm[0]) {
      const termKey = Object.keys(currentPaymentTerm[0])[0]; // e.g. "Deferred"
      setPayment(termKey);

      if (termKey === "Deferred") {
        const { due, penalty } = currentPaymentTerm[0].Deferred;

        // Convert due from nanoseconds to YYYY-MM-DD
        const dueDate = new Date(Number(due / 1000000n)).toISOString().split("T")[0];

        setDeferredPayment({
          due: dueDate,
          penalty: penalty.toString()
        });
      }
    }
  }, [currentPaymentTerm])

  return (
    <div className="contract-payment-container">
      <h2 className="contract-section-heading">Payment Details</h2>
      <form onSubmit={handleSubmit}>
        <select value={payment} onChange={(e) => setPayment(e.target.value)}>
          <option value="">Choose your Option</option>
          <option value="OnDelivery">On Delivery </option>
          <option value="Deferred">Deferred</option>
        </select>
        {payment === "Deferred" && <>
          <label htmlFor="due">Invoice due date</label>
          <input type="date" name="due" id="due" value={deferredPayment.due} onChange={(e) => { setDeferredPayment({ ...deferredPayment, due: e.target.value }) }} required className="form-control" />
          <label htmlFor="penalty">24-hour Penalty</label>
          <input name="penalty" id="penalty" value={deferredPayment.penalty} onChange={(e) => { setDeferredPayment({ ...deferredPayment, penalty: e.target.value }) }} required className="form-control" />
        </>}
        <button type="submit" className="submit-button">
          Save
        </button>
      </form>
    </div>
  );
};

export default AddPayment;
