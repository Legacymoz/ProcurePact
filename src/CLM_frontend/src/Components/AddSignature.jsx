import { useAuth } from "../Hooks/AuthContext";
import { CLM_backend } from "declarations/CLM_backend";
import { useStore } from '../store/useStore';
import { Principal } from "@dfinity/principal";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const AddSignature = ({ currentParties }) => {
    const selectedContract = useStore((state) => state.selectedContract);
    const [canSign, setCanSign] = useState(false);
    const [isSignatory, setIsSignatory] = useState(false);
    const { user, principal } = useAuth();
    const navigate = useNavigate();

    const normalizeParties = (partiesArr) =>
        partiesArr.map((party) => {
            let principalText = party.principal;
            if (party.principal && party.principal._arr) {
                try {
                    principalText = Principal.fromUint8Array(
                        new Uint8Array(party.principal._arr)
                    ).toText();
                } catch (e) {
                    principalText = String(party.principal);
                }
            }
            return { ...party, principal: principalText };
        });

    //get current party status
    //filter parties array where party.principal == principal
    //extract role
    //if role == Singnatory , setIsSignatory(true)

    const extractStatus = (details) => Object.keys(details?.status || {})[0] || "";

    const getPartyStatus = (partiesArr) => {
        let thisParty = partiesArr.filter(party => party.principal == principal);
        if (extractStatus(thisParty[0].details) == "Signatory") {
            setIsSignatory(true);
        }
    };

    //🚩should reload contract after this
    const handleSubmit = async (e) => {
        e.preventDefault();
        await CLM_backend.addSignature(BigInt(selectedContract)).then((response) => {
            if (response.ok) {
                alert("Contract signed")
            } else {
                console.log(response.err);
                alert("Error signning contrat. Please try again");
            }
        }).finally(
            navigate("/")
        )
    };

    useEffect(() => {
        getPartyStatus(normalizeParties(currentParties));
    }, []);

    return (
        <div className="contract-section-container">
            <h2 className="contract-section-heading">Signature</h2>
            {!isSignatory ? <>
                <p>In signing this Agreement, the party confirms their familiarity with the conditions of operating with the Client, and pledges to adhere to these terms at all times. </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="partyName">Name:</label>
                        <input
                            type="text"
                            id="partyName"
                            placeholder="Full name as appears in profile"
                            className="form-control"
                            onChange={(e) => e.target.value === user.name ? setCanSign(true) : setCanSign(false)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={!canSign}>Sign Contract</button>
                </form>
            </> : <>
                <p>You are already a signatory to this contract</p>
            </>}
        </div>
    )
};

export default AddSignature;