import { useEffect, useState } from "react";
import Modal from "../Components/CreateContractModal";
import { useAuth } from "../Hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/ContractStyles.css";
import { useStore } from "../store/useStore";
import { Principal } from "@dfinity/principal";
import { ProcurePact_backend } from "declarations/ProcurePact_backend";
import { ledgerStore } from "../store/ledgerStore";
const tabOptions = [
  { label: "My Contracts", key: "myContracts" },
  { label: "Invitations", key: "invitations" },
];

const Contracts = () => {
  const { ledger } = ledgerStore();
  const navigate = useNavigate();
  const { user, isAuthenticated, authClient, principal } = useAuth();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const [contracts, setContracts] = useState([]);
  const [activeTab, setActiveTab] = useState("myContracts");

  // states from the zustand store
  const selectedContract = useStore((state) => state.selectedContract);
  const setSelectedContract = useStore((state) => state.setSelectedContract);

  const fetchContracts = async () => {
    ProcurePact_backend.getContracts(
      authClient.getIdentity().getPrincipal()
    ).then((fetched) => {
      setContracts(fetched.ok);
    });
  };

  const submitNewContract = async (name, description, role) => {
    try {
      const result = await ProcurePact_backend.createContract(
        name,
        description,
        role
      );
      alert("Contract created successfully");
    } catch (error) {
      alert("Failed to create contract");
    } finally {
      fetchContracts();
    }
  };

  const handleSelection = (contractId) => {
    setSelectedContract(contractId);
    const contract = contracts.find((c) => c.contractId === contractId);
    if (!contract) return;

    const statusKey = Object.keys(contract?.status || {})[0] || "";
    const paymentTerm = Object.keys(contract?.paymentTerm[0] || {})[0] || "";

    if (statusKey === "Draft") {
      navigate(`/app/contract/${contractId}`);
    } else if (statusKey === "Active") {
      if (paymentTerm === "OnDelivery") {
        navigate(`/app/contract/lock-tokens/${contractId}`);
      } else if (paymentTerm == "Deferred") {
        navigate(`/app/contract/delivery-note/${contractId}`);
      }
    } else if (statusKey === "DeliveryNoteSubmitted") {
      navigate(`/app/contract/confirm-delivery-note/${contractId}`);
    } else if (statusKey === "DeliveryConfirmed") {
      if (paymentTerm === "Deferred") {
        navigate(`/app/contract/invoice/${contractId}`);
      }
    } else if (statusKey === "InvoiceIssued") {
      navigate(`/app/contract/settle-invoice/${contractId}`);
    } else if (statusKey === "TokensLocked") {
      navigate(`/app/contract/delivery-note/${contractId}`);
    }
  };

  // Separate contracts by party status
  const invitedContracts = contracts?.filter(
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

  const handleAcceptInvitation = async (contractId) => {
    await ProcurePact_backend.acceptContractInvitation(BigInt(contractId))
      .then((response) => {
        if (response.ok) {
          alert("Invitation accepted successfully!");
        } else {
          alert("Error accepting invitation");
        }
      })
      .finally(fetchContracts());
  };

  const handleRejectInvitation = async (contractId) => {
    alert(`Rejected invitation for contract ${contractId}`);
    fetchContracts();
  };

  useEffect(() => {
    if (isAuthenticated && user?.length !== 0) {
      fetchContracts();
    }
  }, [user]);

  return (
    <div className="main-contracts-container">
      {user != null && isAuthenticated ? (
        <div className="contract-container">
          <div className="header">
            <h2>My Contracts</h2>
            <div className="contract-button">
              <button className="create-button" onClick={handleOpen}>
                Create
              </button>

              <button className="refresh-button" onClick={fetchContracts}>
                Refresh
              </button>
            </div>
          </div>

          <div className="contracts-tabs">
            {tabOptions.map((tab) => (
              <button
                key={tab.key}
                className={`contracts-tab-btn${activeTab === tab.key ? " active" : ""
                  }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="contracts-tab-content">
            {activeTab === "myContracts" && (
              <div className="my-contracts-tab">
                <div className="contract-table-container">
                  <table className="contract-table">
                    <thead className="contract-thead">
                      <tr className="contract-tr">
                        <th scope="col">ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Description</th>
                        <th scope="col">Role</th>
                        <th scope="col">Status</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody className="contract-tbody">
                      {otherContracts.length > 0 ? (
                        otherContracts.map((contract) => (
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
                            <td>
                              <button
                                onClick={() =>
                                  handleSelection(contract.contractId)
                                }
                                className="edit-button"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="empty-state">
                            No contracts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {activeTab === "invitations" && (
              <div className="invitations-contracts-tab">
                {invitedContracts.length > 0 ? (
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

                        >
                          <td>{contract.contractId}</td>
                          <td>
                            {(() => {
                              const principalText = Principal.fromUint8Array(
                                contract.createdBy._arr
                              ).toText();
                              return principalText.length > 18
                                ? principalText.slice(0, 18) + "..."
                                : principalText;
                            })()}
                          </td>
                          <td>{contract.name}</td>
                          <td>
                            {contract.description.length > 30
                              ? contract.description.slice(0, 30) + "..."
                              : contract.description}
                          </td>
                          <td>{Object.keys(contract.party.role)[0]}</td>
                          <td>
                            <div className="invitation-actions">
                              <button
                                onClick={() =>
                                  handleAcceptInvitation(contract.contractId)
                                }
                                className="accept-button"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleRejectInvitation(contract.contractId)
                                }
                                className="reject-button"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="empty-state">No invitations found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="empty-state">Update profile to view contracts</p>
      )}
      {!isAuthenticated && <p className="empty-state"> Please log in</p>}
      <Modal
        open={open}
        setOpen={setOpen}
        submitNewContract={submitNewContract}
      />
    </div>
  );
};

export default Contracts;
