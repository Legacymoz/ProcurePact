import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { CLM_backend } from "declarations/CLM_backend";
import { useAuth } from "../Hooks/AuthContext";
import { icrc1_ledger_canister } from "declarations/icrc1_ledger_canister";
import { Principal } from "@dfinity/principal";
import "../styles/LockTokens.css";
import { Actor } from "@dfinity/agent";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const LockTokens = () => {
  const selectedContract = useStore((state) => state.selectedContract);
  const { principal: userPrincipal } = useAuth(); // current logged-in user
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const { user, isAuthenticated, authClient } = useAuth();
  const [fullcontract, setFullContract] = useState(null);
  const [contractValue, setContractValue] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const navigate = useNavigate();

  // Fetch full contract details
  const fetchFullContractDetails = async () => {
    try {
      const response = await CLM_backend.getContractDetails(selectedContract);
      if (response.ok) {
        setFullContract(response.ok);
        setContractValue(response.ok.value);
        console.log("Fetched full contract details:", response.ok);
        
      } else {
        console.error("Error fetching full contract details:", response.err);
      }
    } catch (error) {
      console.error("Error fetching full contract details:", error);
    }
  };

  // Fetch contract details for a specific user
  const fetchContractDetails = async () => {
    try {
      const response = await CLM_backend.getContracts(
        authClient.getIdentity().getPrincipal()
      );

      const data = response.ok;

      // Identify the user's role
      const contract = data.find((c) => c.contractId === selectedContract);
      if (contract) {
        setContract(contract);
        console.log("Fetched contract:", contract);
        const role = Object.keys(contract.party.role)[0];
        setUserRole(role);
      }
    } catch (error) {
      console.error("Error fetching contract:", error);
    }
  };

  const getUserBalance = async () => {
    try {
      const result = await icrc1_ledger_canister.icrc1_balance_of({
        owner: userPrincipal,
        subaccount: [], // or: undefined if not using subaccounts
      });
      setUserBalance(result);
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  };

  console.log("User Balance:", userBalance);

  useEffect(() => {
    fetchContractDetails();
    fetchFullContractDetails();
    getTransferFee();
    getUserBalance();
  }, []);

  //get transfer fee
  const getTransferFee = async () => {
    return await icrc1_ledger_canister.icrc1_fee();
  };
  //get User balance
  

  const handleLockTokens = async () => {
    // Logic to lock tokens goes here

    try {
      if (!authClient || !authClient.isAuthenticated()) {
        alert("Please login to lock tokens");
        return;
      }

      // Use authenticated identity
      Actor.agentOf(icrc1_ledger_canister).replaceIdentity(
        authClient.getIdentity()
      );

      // Get transfer fee
    const transferFee = await getTransferFee();
      // Approve token lock
      //approval is charged in the user
      const result = await icrc1_ledger_canister.icrc2_approve({
        amount: BigInt(contractValue) + transferFee,
        //specify who is allowed to spend the tokens
        spender: {
          owner: Principal.fromText(process.env.CANISTER_ID_ESCROW),
          subaccount: [],
        },
        created_at_time: [],
        expected_allowance: [],
        expires_at: [],
        memo: [],
        fee: [],
        from_subaccount: [],
      });

      if (result.Ok) {
        await CLM_backend.lockTokens(BigInt(selectedContract)).then(
          (response) => {
            if (response.ok) {
              alert("Tokens locked Successfully");
              navigate(-1)
            } else {
              console.log(response.err)
              alert("Error Locking tokens");
            }
          }
        );
      } else {
        alert("Error approving lock");
        console.error(result.Err);
      }
    } catch (error) {
      console.log(error);
      alert("An error occurred while locking tokens");
    }
  };

  if (!contract || !userRole) return <p>Loading contract...</p>;

  
  

  return (
    <div>
      {userRole === "Buyer" ? (
        <div id="buyer-lock-tokens" className="lock-tokens-container">
          <h2>Lock Tokens for Contract: {contract.name}</h2>
          <p>Role: {userRole}</p>
          <p>Contract Value: {contractValue} ICP</p>
          <p>Current Available Tokens: {userBalance} ICP</p>
          <button onClick={handleLockTokens}>Lock Tokens</button>
        </div>
      ) : (
        <div id="awaiting-lock" className="lock-tokens-container">
          <h2>Awaiting for Buyer to Lock Tokens</h2>
        </div>
      )}
    </div>
  );
};

export default LockTokens;
