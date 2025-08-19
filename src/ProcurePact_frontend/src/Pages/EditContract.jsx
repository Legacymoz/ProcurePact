import { useParams } from 'react-router-dom';
import { ProcurePact_backend } from 'declarations/ProcurePact_backend';
import { useEffect, useState } from 'react';
import "../styles/EditContractStyles.css";
import AddParty from '../Components/EditContract/AddParty';
import AddProducts from '../Components/EditContract/AddProducts';
import AddPayment from '../Components/EditContract/AddPayment';
import ContractExpiry from '../Components/EditContract/AddContractExpiry';
import AddSignature from '../Components/EditContract/AddSignature';

const EditContract = () => {
    const [contract, setContract] = useState(null);

    const params = useParams();

    // Fetch contract details
    const fetchContractDetails = async () => {
        try {
            const response = await ProcurePact_backend.getContractDetails(BigInt(params.id));
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

        <div className="party-container">
          <AddParty currentParties={contract.parties} />
        </div>

        <div className="products-container">
            <AddProducts currentPricing={contract.pricing} />
        </div>

        <div className="container-2">
          <AddPayment currentPaymentTerm={contract.paymentTerm} />
          <ContractExpiry currentExpiry={contract.expiresAt} />
        </div>

        <div className="signature-container">
          <AddSignature currentParties={contract.parties} />
        </div>
      </div>
    );
};

export default EditContract;

