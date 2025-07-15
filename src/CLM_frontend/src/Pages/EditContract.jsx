import { useParams } from 'react-router-dom';
import { CLM_backend } from 'declarations/CLM_backend';
import { useEffect, useState } from 'react';


const EditContract = () => {
    const [contract, setContract] = useState([]);
    //get contract id from params
    let params = useParams();
    //fetch full contract details
    const fetchContractDetails = async () => {
        try {
            const response = await CLM_backend.getContractDetails(BigInt(params.id));
            console.log("contract details", response);
            setContract(response.ok);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchContractDetails()
    }, []);

    //edit contract
    return (<>
        <div className='container-fluid'>
            <h1>{contract.name}</h1>
        </div>
    </>)
};
export default EditContract;

