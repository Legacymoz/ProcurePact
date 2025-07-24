import { invoice } from "declarations/invoice"
import { useStore } from "../store/useStore";
import { CLM_backend } from "declarations/CLM_backend";
import { useEffect, useState } from "react";
import { useAuth } from "../Hooks/AuthContext";
import { Principal } from "@dfinity/principal";
import { useNavigate } from "react-router-dom";
import "../styles/Invoice.css";
import { icrc1_ledger_canister } from "declarations/icrc1_ledger_canister";

const SettleInvoice = () => {
    const selectedContract = useStore((state) => state.selectedContract);
    const navigate = useNavigate();
    const [fetchedInvoice, setfetchedInvoice] = useState({});
    const [supplier, setSupplier] = useState([])
    const [userRole, setUserRole] = useState("");
    const [userBalance, setUserBalance] = useState(0);
    const { principal, user } = useAuth();

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
    };

    const getRole = (principal, invoiceData) => {
        const issuer = Principal.fromUint8Array(invoiceData.issuer._arr).toText();
        const recipient = Principal.fromUint8Array(invoiceData.recipient._arr).toText();
        const currentUser = Principal.fromUint8Array(principal._arr).toText();

        if (currentUser === recipient) {
            setUserRole("Buyer");
        } else if (currentUser === issuer) {
            setUserRole("Supplier");
        }
    };

    const getUserBalance = async () => {
        try {
            const result = await icrc1_ledger_canister.icrc1_balance_of({
                owner: principal,
                subaccount: [], // or: undefined if not using subaccounts
            });
            setUserBalance(result);
        } catch (error) {
            console.error("Error fetching user balance:", error);
        }
    };

    //pay invoice
    const handleSubmit = async () => {
        await CLM_backend.payInvoice(selectedContract).then((response) => {
            if (response.ok) {
                alert("Payment Successful")
            } else {
                alert("Error making payment")
                console.log(response.err)
            }
        }).finally(
            navigate(-1)
        )
    };

    const fetchSupplierDetails = async (principal) => {
        await CLM_backend.getUser(principal).then((userInfo) => {
            setSupplier(userInfo[0]);
        });
    };

    useEffect(() => {
        (async () => {
            const response = await invoice.getInvoice(BigInt(selectedContract));
            const invoiceData = response[0];
            setfetchedInvoice(invoiceData);
            fetchSupplierDetails(Principal.fromUint8Array(invoiceData.issuer._arr));
            getRole(principal, invoiceData);
            getUserBalance(principal);
        })();
    }, []);


    if (!fetchedInvoice || !userRole) return <p>Loading details ...</p>

    const items = flattenItems(fetchedInvoice?.items?.[0] || []);

    return (<>
        {/*
    
                    <p>Status:{Object.keys(fetchedInvoice.status || [])[0] || ""}</p>
    */}
        {userRole === "Buyer" && fetchedInvoice &&
            <div className="invoice-container mb-3">
                {/* Header */}
                <header className="invoice-header">
                    <div>
                        <h1>{supplier?.name}</h1>
                        <p>Address: {supplier?.address}</p>
                        <p>Email: {supplier?.email} | Phone: {supplier?.phone}</p>
                    </div>
                    <div>
                        <h2>INVOICE</h2>
                        <p><strong>Invoice ID:</strong> {selectedContract}</p>
                        <p><strong>Date Issued:</strong> {new Date(Math.floor(Number(fetchedInvoice?.createdAt)) / 1_000_000).toDateString()}</p>
                    </div>
                </header>

                <section className="invoice-section">
                    <h3>Bill To</h3>
                    <p><strong>ID:</strong> {Principal.fromUint8Array(principal._arr).toText()}</p>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone}</p>
                </section>

                <section className="invoice-section">
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

                    {/* Totals */}
                    <div className="invoice-totals">
                        <p>May include late penalties</p>
                        <p><strong>Total:</strong> ${fetchedInvoice?.totalAmount}</p>
                    </div>
                </section>

                <section className="invoice-section">
                    <h3>Payment Terms</h3>
                    <p><strong>Due Date:</strong> {new Date(Math.floor(Number(fetchedInvoice?.dueDate)) / 1_000_000).toDateString()}</p>
                    <p><strong>Penalty:</strong> {fetchedInvoice?.penalty} per day late</p>
                </section>

                <section className="invoice-section">
                    <h3>Addtional notes by Supplier</h3>
                    <p>{fetchedInvoice?.notes}</p>
                </section>
                <section className="invoice-section">
                    <h3>Pay Invoice</h3>
                    <p>Available wallet balance: ${userBalance}</p>
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        Pay
                    </button>
                </section>

            </div>
        }

        {
            userRole === "Supplier" && fetchedInvoice && <>
                <h1>Contract ID: {selectedContract}</h1>
                <h2>Waiting for buyer to pay invoice</h2>
            </>
        }

    </>)
}

export default SettleInvoice;