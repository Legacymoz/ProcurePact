import { useParams } from 'react-router-dom';
import { CLM_backend } from 'declarations/CLM_backend';
import { useEffect, useState } from 'react';
import "../styles/EditContractStyles.css";
import AddParty from '../Components/AddParty';
import AddProducts from '../Components/AddProducts';
import AddPayment from '../Components/AddPayment';
import ContractExpiry from '../Components/AddContractExpiry';

const EditContract = () => {
    const [contract, setContract] = useState(null);

    const params = useParams();

    // Fetch contract details
    const fetchContractDetails = async () => {
        try {
            const response = await CLM_backend.getContractDetails(BigInt(params.id));
            const data = response.ok;
            setContract(data);
        } catch (error) {
            console.error("Error fetching contract:", error);
        }
    };

    useEffect(() => {
        fetchContractDetails();
    }, []);

    if (!contract) return <p>Loading...</p>;

    return (
        <div className="editContract-container">
            <h1>Edit Contract: {contract.name}</h1>

            <AddParty currentParties={contract.parties}/>

            <AddProducts currentPricing={contract.pricing}/>

            <AddPayment currentPaymentTerm={contract.paymentTerm}/>
            < ContractExpiry />

        </div>
    );
};

export default EditContract;

