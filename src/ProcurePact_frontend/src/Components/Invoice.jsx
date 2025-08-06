import { ProcurePact_backend } from "declarations/ProcurePact_backend";
import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { useAuth } from "../Hooks/AuthContext";
import "../styles/Invoice.css";
import { Principal } from "@dfinity/principal";
import { useNavigate } from "react-router-dom";


const Invoice = () => {
    const { principal, user } = useAuth();
    const selectedContract = useStore((state) => state.selectedContract);
    const [contract, setContract] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [invoiceNotes, setInvoiceNotes] = useState("");
    const [buyer, setBuyer] = useState([]);
    const navigate = useNavigate();

    const getRole = (parties) => {
        const party = parties.filter((p) => Principal.fromUint8Array(p.principal._arr).toText() === Principal.fromUint8Array(principal._arr).toText());
        if (party) {
            return Object.keys(party[0].details.role)[0];
        }
        return null;
    };
    const extractRole = (details) => Object.keys(details?.role || {})[0] || "";

    const getBuyer = (parties) => {
        const party = parties.filter((p) => extractRole(p.details) == "Buyer");
        return Principal.fromUint8Array(party[0].principal._arr).toText();
    };

    // Fetch full contract details
    const fetchContractDetails = async () => {
        await ProcurePact_backend.getContractDetails(selectedContract).then((response) => {
            if (response.ok) {
                setContract(response.ok);
                setUserRole(getRole(response.ok.parties))
            } else {
                console.error("Error fetching full contract details:", response.err);
            }
        });
    };

    const fetchBuyerDetails = async (principal) => {
        await ProcurePact_backend.getUser(principal).then((userInfo) => {
            setBuyer(userInfo[0]);
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await ProcurePact_backend.createInvoice(BigInt(selectedContract), [invoiceNotes]).then((response) => {
            if (response.ok) {
                alert("Invoice created successfully")
            } else {
                alert("Error creating invoice");
                console.log(response.err)
            }
        }).finally(
            navigate(-1)
        )
    }

    useEffect(() => {
        fetchContractDetails();
        if (contract) {
            fetchBuyerDetails(Principal.fromText(getBuyer(contract?.parties)));
        }
    }, [contract]);

    if (!contract || !userRole) return <p>Loading contract...</p>;

    return (
        <>
            <div className="invoice-container mb-3">

                {/* Billing Info */}
                {userRole === "Supplier" && contract?.parties &&
                    <>
                        {/* Header */}
                        <header className="invoice-header">
                            <div>
                                <h1>{user.name}</h1>
                                <p>Address: {user.address}</p>
                                <p>Email: {user.email} | Phone: {user.phone}</p>
                            </div>
                            <div>
                                <h2>INVOICE</h2>
                                <p><strong>Invoice ID:</strong> {selectedContract}</p>
                                <p><strong>Date:</strong> {new Date().toDateString()}</p>
                            </div>
                        </header>

                        <section className="invoice-section">
                            <h3>Bill To</h3>
                            <p><strong>ID:</strong> {getBuyer(contract.parties)}</p>
                            <p><strong>Name:</strong> {buyer?.name}</p>
                            <p><strong>Email:</strong> {buyer?.email}</p>
                            <p><strong>Phone:</strong> {buyer?.phone}</p>
                        </section>

                        {/* Pricing Table */}
                        <section className="invoice-section">
                            <h3>Itemized Charges</h3>
                            <table className="pricing-table">
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Description</th>
                                        <th>Qty</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contract?.pricing?.map((price, index) => (
                                        <tr key={index}>
                                            <td>{price.name}</td>
                                            <td>{price.description}</td>
                                            <td>{price.quantity}</td>
                                            <td>{price.unit_price.toFixed(2)}</td>
                                            <td>{(price.quantity * price.unit_price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div className="invoice-totals">

                                <p><strong>Total:</strong> ${contract?.pricing?.reduce((sum, item) => sum + item.quantity * item.unit_price, 0).toFixed(2)}</p>
                            </div>
                        </section>

                        {/* Payment Terms */}
                        <section className="invoice-section">
                            <h3>Payment Terms</h3>
                            <p><strong>Due Date:</strong> {new Date(Math.floor(Number(contract?.paymentTerm[0].Deferred.due)) / 1_000_000).toDateString()}</p>
                            <p><strong>Penalty:</strong> {contract?.paymentTerm[0].Deferred.penalty} per day late</p>
                        </section>

                        {/* Notes and Submission */}
                        <section className="invoice-section">
                            <h3>Additional Notes</h3>
                            <form onSubmit={handleSubmit} className="invoice-form">
                                <label htmlFor="notes">Comments or Remarks:</label>
                                <input
                                    type="text"
                                    id="notes"
                                    value={invoiceNotes}
                                    placeholder="Add a note to the invoice..."
                                    onChange={(e) => setInvoiceNotes(e.target.value)}
                                />
                                <button type="submit">Submit Invoice</button>
                            </form>
                        </section>
                    </>
                }

                {
                    userRole === "Buyer" && contract?.parties && <>
                        <h1>Contract ID: {selectedContract}</h1>
                        <h2>Waiting for Supplier to issue invoice</h2>
                    </>
                }
            </div>
        </>

    )
}

export default Invoice;