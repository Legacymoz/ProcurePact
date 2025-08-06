import { ProcurePact_backend } from "declarations/ProcurePact_backend";
import { icrc1_ledger_canister } from "declarations/icrc1_ledger_canister";
import { useEffect, useState } from "react";
import Modal from "../Components/Modal";
import { useAuth } from "../Hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/ContractStyles.css";
import { useStore } from "../store/useStore";
import { Principal } from "@dfinity/principal";

const Contracts = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, authClient , principal} = useAuth();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const [contracts, setContracts] = useState([]);
  const [userBalance, setUserBalance] = useState(0);

  //states from the zustand store
  const selectedContract = useStore((state) => state.selectedContract);
  const setSelectedContract = useStore((state) => state.setSelectedContract);

  const fetchContracts = async () => {
    ProcurePact_backend.getContracts(authClient.getIdentity().getPrincipal()).then(
      (fetched) => {
        setContracts(fetched.ok);
      }
    );
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


  const submitNewContract = async (name, description, role) => {
    try {
      const result = await ProcurePact_backend.createContract(name, description, role);
      console.log("Contract created:", result);
      alert("Contract created successfully");
    } catch (error) {
      console.error("Error creating contract:", error);
      alert("Failed to create contract");
    } finally {
      fetchContracts();
    }
  };

  {
    /*
        🚩Implement logic to reduce number of contract fetch
        */
  }
  const handleSelection = (contractId) => {

    setSelectedContract(contractId);
    const contract = contracts.find((c) => c.contractId === contractId);
    if (!contract) {
      console.error("Contract not found:", contractId);
      return;
    }

    const statusKey = Object.keys(contract?.status || {})[0] || "";
    const paymentTerm = Object.keys(contract?.paymentTerm[0] || {})[0] || "";

    if (statusKey === "Draft") {
      //edit contract
      navigate(`/contract/${contractId}`);
    } else if (statusKey === "Active") {
      if (paymentTerm === "OnDelivery") {
        navigate(`/contract/lock-tokens/${contractId}`)
      } else if (paymentTerm == "Deferred") {
        navigate(`/contract/delivery-note/${contractId}`)
      }
    } else if (statusKey === "DeliveryNoteSubmitted") {
      navigate(`/contract/confirm-delivery-note/${contractId}`);
    } else if (statusKey === "DeliveryConfirmed") {
      if (paymentTerm === "Deferred") {
        navigate(`/contract/invoice/${contractId}`)
      } else if (paymentTerm === "OnDelivery") {
        //delay in auto settling payment
      }
    } else if (statusKey === "InvoiceIssued") {
      navigate(`/contract/settle-invoice/${contractId}`)
    } else if (statusKey === "TokensLocked") {
      navigate(`/contract/delivery-note/${contractId}`)
    }
  };

  // Separate contracts by party status
  const invitedContracts = contracts.filter(
    (contract) =>
      contract.party?.status &&
      Object.keys(contract.party.status)[0] === "Invited"
  );
  const otherContracts = contracts.filter(
    (contract) =>
      !(
        contract.party?.status &&
        Object.keys(contract.party.status)[0] === "Invited"
      )
  );

  // Accept/Reject handlers for invitations
  const handleAcceptInvitation = async (contractId) => {
    // TODO: Call backend to accept invitation
    //alert(`Accepted invitation for contract ${contractId}`);
    //fetchContracts();
    await ProcurePact_backend.acceptContractInvitation(BigInt(contractId))
      .then((response) => {
        if (response.ok) {
          alert("Invitation accepted successfully!");
        } else {
          alert("Error accepting invitation");
          console.error(response.err);
        }
      })
      .finally(fetchContracts());
  };
  const handleRejectInvitation = async (contractId) => {
    // TODO: Call backend to reject invitation
    alert(`Rejected invitation for contract ${contractId}`);
    fetchContracts();
  };

   useEffect(() => {
      if (isAuthenticated && user?.length != 0) {
        fetchContracts();
        getUserBalance();
      }
      console.log(authClient?.getIdentity().getPrincipal().toText());
    }, [user]);

  return (
    <>
      {user != null && isAuthenticated ? (
        <div className="contract-container">
          <h2>Wallet Bal: {Number(userBalance)}</h2>
          <button className="create-button" onClick={handleOpen}>
            Create
          </button>

          {/* Main Contracts Table (excluding Invited) */}
          <div className="contract-table-container">
            <h2 className="contract-table-heading">My Contracts</h2>
            <button onClick={fetchContracts} className="btn btn-secondary mb-3">
              Refresh
            </button>
            <table className="contract-table">
              <thead className="contract-thead">
                <tr className="contract-tr">
                  <th scope="col">ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody className="contract-tbody">
                {otherContracts.length > 0 &&
                  otherContracts?.map((contract) => (
                    <tr
                      key={contract.contractId}
                      onClick={() => handleSelection(contract.contractId)}
                    >
                      <td>{contract.contractId}</td>
                      <td>{contract.name}</td>
                      <td>
                        {contract.description.length > 30
                          ? contract.description.slice(0, 30) + "..."
                          : contract.description}
                      </td>
                      <td>{Object.keys(contract.party.role)[0]}</td>
                      <td>{Object.keys(contract.status)[0]}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <br />
          {/* Invited Contracts Section */}
          {invitedContracts.length > 0 && (
            <div className="invited-contracts-section">
              <h2>Invitations</h2>
              <table className="contract-table">
                <thead className="contract-thead">
                  <tr className="contract-tr">
                    <th>ID</th>
                    <th>Contract Creator</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody className="contract-tbody">
                  {invitedContracts.map((contract) => (
                    <tr
                      key={contract.contractId}
                      style={{ cursor: "not-allowed", opacity: 0.7 }}
                    >
                      <td>{contract.contractId}</td>
                      <td>
                        {Principal.fromUint8Array(
                          contract.createdBy._arr
                        ).toText()}
                      </td>
                      <td>{contract.name}</td>
                      <td>
                        {contract.description.length > 30
                          ? contract.description.slice(0, 30) + "..."
                          : contract.description}
                      </td>
                      <td>{Object.keys(contract.party.role)[0]}</td>
                      <td>
                        <button
                          onClick={() =>
                            handleAcceptInvitation(contract.contractId)
                          }
                          className="btn btn-primary"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleRejectInvitation(contract.contractId)
                          }
                          className="btn btn-danger"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <>
          <p className="empty-state">Update profile to view contracts</p>
        </>
      )}
      {!isAuthenticated && (
        <>
          <p className="empty-state"> Please log in</p>
        </>
      )}
      <Modal
        open={open}
        setOpen={setOpen}
        submitNewContract={submitNewContract}
      />
    </>
  );
};

export default Contracts;
