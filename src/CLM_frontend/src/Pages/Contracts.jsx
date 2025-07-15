import { CLM_backend } from 'declarations/CLM_backend';
import { useEffect, useState } from 'react';
import Modal from '../Components/Modal';
import { useAuth } from "../Hooks/AuthContext";
import { useNavigate } from "react-router-dom";


const Contracts = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, authClient } = useAuth();
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const [contracts, setContracts] = useState([]);

    const fetchContracts = async () => {
        CLM_backend.getContracts(authClient.getIdentity().getPrincipal()).then((fetched) => {
            console.log("fetched contracts", fetched)
            setContracts(fetched.ok);
        });
        console.log("contracts", contracts)
    };

    const submitNewContract = async (name, description, role) => {
        try {
            const result = await CLM_backend.createContract(name, description, role);
            console.log("Contract created:", result);
            alert("Contract created successfully");
        } catch (error) {
            console.error("Error creating contract:", error);
            alert("Failed to create contract");
        } finally {
            fetchContracts();
        }
    };

    {/*
        🚩Implement logic to reduce number of contract fetch
        */}
    useEffect(() => {
        if (isAuthenticated && user?.length != 0) {
            fetchContracts();
        }
    }, [user]);

    return (
        <>
            <h1>My Contracts</h1>
            {user != null && isAuthenticated ? <><button onClick={handleOpen}>Create</button>

                {/*
          Map contracts to display
          Only show ID, name and truncated Description
          */}

                <table className='table table striped'>
                    <thead >
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Name</th>
                            <th scope="col">Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contracts.length > 0 &&
                            contracts?.map((contract) => (
                                <tr key={contract.contractId} onClick={() => navigate(`/contract/${contract.contractId}`)}>
                                    <td>{contract.contractId}</td>
                                    <td>{contract.name}</td>
                                    <td>
                                        {
                                            contract.description.length > 30
                                                ? contract.description.slice(0, 30) + '...'
                                                : contract.description
                                        }
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </>


                : <><p>Update profile to view contracts</p></>}
            {!isAuthenticated && <>
                <p>Please log in</p>
            </>}
            <Modal
                open={(open)}
                setOpen={setOpen}
                submitNewContract={submitNewContract}
            />
        </>
    )
};

export default Contracts;