// import { useEffect, useState } from "react";
// import "../styles/AddPartyStyles.css";
// import { ProcurePact_backend } from "declarations/ProcurePact_backend";
// import { useAuth } from "../Hooks/AuthContext";
// import { useStore } from "../store/useStore";
// import { Principal } from "@dfinity/principal";

// const AddParty = ({ currentParties }) => {
//   // Convert all party principals to text if they are Uint8Array objects
//   const normalizeParties = (partiesArr) =>
//     partiesArr.map((party) => {
//       let principalText = party.principal;
//       if (party.principal && party.principal._arr) {
//         try {
//           principalText = Principal.fromUint8Array(
//             new Uint8Array(party.principal._arr)
//           ).toText();
//         } catch (e) {
//           principalText = String(party.principal);
//         }
//       }
//       return { ...party, principal: principalText };
//     });

//   const [parties, setParties] = useState(normalizeParties(currentParties));
//   const { principal, authClient } = useAuth();
//   const selectedContract = useStore((state) => state.selectedContract);
//   const userPrincipal = authClient.getIdentity().getPrincipal().toText();

//   // Helper to extract role/status from details
//   const extractRole = (details) => Object.keys(details?.role || {})[0] || "";
//   const extractStatus = (details) => Object.keys(details?.status || {})[0] || "";

//   // Helper to count roles
//   const countRole = (roleName) =>
//     parties.filter((p) => extractRole(p.details) === roleName).length;

//   try {
//     ProcurePact_backend.getContracts(principal).then((fetchedContracts) => {
//       console.log("Fetched contracts:", fetchedContracts);
//     });
//   } catch (error) {
//     console.error("Error fetching contracts:", error);
//   }

//   useEffect(() => {
//     console.log(
//       "This is my principal",
//       authClient.getIdentity().getPrincipal().toText()
//     );
//   }, []);

//   const addParty = () => {
//     // Prevent adding more than one Buyer or Seller
//     if (countRole("Buyer") >= 1 && countRole("Supplier") >= 1) {
//       // Only allow adding ThirdParty
//       setParties([
//         ...parties,
//         {
//           principal: "",
//           details: { status: { Invited: null }, role: { ThirdParty: null } },
//         },
//       ]);
//       return;
//     }
//     if (countRole("Buyer") >= 1) {
//       setParties([
//         ...parties,
//         {
//           principal: "",
//           details: { status: { Invited: null }, role: { Supplier: null } },
//         },
//       ]);
//       return;
//     }
//     if (countRole("Supplier") >= 1) {
//       setParties([
//         ...parties,
//         {
//           principal: "",
//           details: { status: { Invited: null }, role: { Buyer: null } },
//         },
//       ]);
//       return;
//     }
//     // If neither Buyer nor Supplier exists, allow both
//     setParties([
//       ...parties,
//       {
//         principal: "",
//         details: { status: { Invited: null }, role: { Buyer: null } },
//       },
//     ]);
//   };

//   const handleInputChange = (index, field, value) => {
//     const updated = [...parties];
//     if (field === "principal") {
//       updated[index].principal = value;
//     } else if (field === "role") {
//       // Prevent selecting Buyer/Seller if already present
//       if (
//         (value === "Buyer" && countRole("Buyer") >= 1 && extractRole(updated[index].details) !== "Buyer") ||
//         (value === "Supplier" && countRole("Supplier") >= 1 && extractRole(updated[index].details) !== "Supplier")
//       ) {
//         return;
//       }
//       updated[index].details.role = { [value]: null };
//     }
//     setParties(updated);
//   };

//   const removeParty = (indexToRemove) => {
//     // Prevent removing self
//     if (parties[indexToRemove].principal === userPrincipal) return;
//     const updatedParties = parties.filter((_, index) => index !== indexToRemove);
//     setParties(updatedParties);
//   };

//   const handleSubmit = async () => {
//     // Convert each party's id to a Principal
//     const partiesToSubmit = parties.map((party) => ({
//       principal: Principal.fromText(party.principal),
//       role: extractRole(party.details),
//     }));

//     console.log("Parties added:", partiesToSubmit);

//     await ProcurePact_backend.invitePartiesToContract(
//       selectedContract,
//       partiesToSubmit
//     ).then((response) => {
//       if (response.ok) {
//         alert(response.ok)
//       } else {
//         alert(response.err)
//       }
//     });

//   };

//   useEffect(() => {
//     // If parties are updated from props, normalize them again
//     setParties(normalizeParties(currentParties));
//     // eslint-disable-next-line
//   }, [currentParties]);

//   return (
//     <div className="contract-section-container">
//       <div className="contract-header">
//         <button onClick={addParty} className="add-button">
//           Add
//         </button>
//         <h2 className="contract-section-heading">Add Party</h2>
//       </div>

//       {/* List fetched parties with role and status */}
//       {parties.length > 0 ? (
//         <div className="party-list">
//           {parties.map((party, index) => {
//             const isSelf = party.principal === userPrincipal;
//             const role = extractRole(party.details);
//             const status = extractStatus(party.details);
//             return (
//               <div key={index} className="party-item">
//                 <div className="party-info">
//                   <p className="party-principal">Id: {party.principal}</p>
//                   <p className="party-role">Role: {role}</p>
//                   <p className="party-status">Status: {status}</p>
//                 </div>
//                 {!isSelf && (
//                   <>
//                     <input
//                       type="text"
//                       placeholder="Enter party ID"
//                       value={party.principal}
//                       onChange={(e) => handleInputChange(index, "principal", e.target.value)}
//                     />
//                     <select
//                       value={role}
//                       onChange={(e) => handleInputChange(index, "role", e.target.value)}
//                     >
//                       <option value="">Select role</option>
//                       <option value="Buyer">Buyer</option>
//                       <option value="Supplier">Seller</option>
//                       <option value="ThirdParty">ThirdParty</option>
//                     </select>
//                     <div className="delete-button-container">
//                       <button
//                         onClick={() => removeParty(index)}
//                         className="delete-button"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </>
//                 )}
//                 {isSelf && <p className="self-label">(You)</p>}
//               </div>
//             );
//           })}
//           <button onClick={handleSubmit} className="submit-button">
//             Save
//           </button>
//         </div>
//       ) : (
//         <p className="empty-state">No parties added</p>
//       )}
//     </div>
//   );
// };

// export default AddParty;

import { useEffect, useState } from "react";
import "../../styles/AddPartyStyles.css";
import { ProcurePact_backend } from "declarations/ProcurePact_backend";
import { useAuth } from "../../Hooks/AuthContext";
import { useStore } from "../../store/useStore";
import { Principal } from "@dfinity/principal";

const ROLE_COLORS = {
  Buyer: "#007bff",
  Supplier: "#ff8800",
  ThirdParty: "#6c757d",
};

const COLUMNS = 3; // Number of columns in grid

function shortenPrincipal(principal) {
  if (!principal) return "";
  return principal.length > 8 ? principal.slice(0, 8) + "..." : principal;
}

const AddParty = ({ currentParties }) => {
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

  const [parties, setParties] = useState(normalizeParties(currentParties));
  const [expandedIndex, setExpandedIndex] = useState(null);
  const { principal, authClient } = useAuth();
  const selectedContract = useStore((state) => state.selectedContract);
  const userPrincipal = authClient.getIdentity().getPrincipal().toText();

  const extractRole = (details) => Object.keys(details?.role || {})[0] || "";
  const extractStatus = (details) =>
    Object.keys(details?.status || {})[0] || "";

  const countRole = (roleName) =>
    parties.filter((p) => extractRole(p.details) === roleName).length;

  const addParty = () => {
    let newParty;
    if (countRole("Buyer") >= 1 && countRole("Supplier") >= 1) {
      newParty = {
        principal: "",
        details: { status: { Invited: null }, role: { ThirdParty: null } },
      };
    } else if (countRole("Buyer") >= 1) {
      newParty = {
        principal: "",
        details: { status: { Invited: null }, role: { Supplier: null } },
      };
    } else if (countRole("Supplier") >= 1) {
      newParty = {
        principal: "",
        details: { status: { Invited: null }, role: { Buyer: null } },
      };
    } else {
      newParty = {
        principal: "",
        details: { status: { Invited: null }, role: { Buyer: null } },
      };
    }
    setParties([...parties, newParty]);
    setExpandedIndex(parties.length); // Expand the new panel
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...parties];
    if (field === "principal") {
      updated[index].principal = value;
    } else if (field === "role") {
      if (
        (value === "Buyer" &&
          countRole("Buyer") >= 1 &&
          extractRole(updated[index].details) !== "Buyer") ||
        (value === "Supplier" &&
          countRole("Supplier") >= 1 &&
          extractRole(updated[index].details) !== "Supplier")
      ) {
        return;
      }
      updated[index].details.role = { [value]: null };
    }
    setParties(updated);
  };

  const removeParty = (indexToRemove) => {
    if (parties[indexToRemove].principal === userPrincipal) return;
    const updatedParties = parties.filter(
      (_, index) => index !== indexToRemove
    );
    setParties(updatedParties);
    if (expandedIndex === indexToRemove) setExpandedIndex(null);
  };

  const handleSubmit = async () => {
    const partiesToSubmit = parties.map((party) => ({
      principal: Principal.fromText(party.principal),
      role: extractRole(party.details),
    }));

    console.log(partiesToSubmit)

    await ProcurePact_backend.invitePartiesToContract(
      selectedContract,
      partiesToSubmit
    ).then((response) => {
      if (response.ok) {
        alert(response.ok);
      } else {
        alert(response.err);
      }
    });
  };

  useEffect(() => {
    setParties(normalizeParties(currentParties));
    // eslint-disable-next-line
  }, [currentParties]);

  return (
    <div className="add-party-container">
      <div className="contract-header">
        <button onClick={addParty} className="add-button">
          Add
        </button>
        <h2 className="contract-section-heading">Add Party</h2>
      </div>
      {parties.length > 0 ? (
        <div className="add-party-sub-container">
          <div className="party-grid">
            {parties.map((party, index) => {
              const isSelf = party.principal === userPrincipal;
              const role = extractRole(party.details);
              const status = extractStatus(party.details);
              const isExpanded = expandedIndex === index;
              return (
                <div
                  key={index}
                  className={`party-accordion-panel${
                    isExpanded ? " expanded" : ""
                  }`}
                >
                  {/* Collapsed summary */}
                  <div
                    className="party-accordion-summary"
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                  >
                    <span className="party-principal-short">
                      {shortenPrincipal(party.principal)}
                    </span>
                    <span
                      className="party-role-badge"
                      style={{
                        background: ROLE_COLORS[role] || "#ccc",
                        color: "#fff",
                      }}
                    >
                      {role}
                    </span>
                  </div>
                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="party-accordion-details">
                      <div className="party-info">
                        <p className="party-principal-full">
                          <strong>Id:</strong> {party.principal}
                        </p>
                        <p className="party-status">
                          <strong>Status:</strong> {status}
                        </p>
                      </div>
                      {!isSelf && (
                        <>
                          <input
                            type="text"
                            placeholder="Enter party ID"
                            value={party.principal}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "principal",
                                e.target.value
                              )
                            }
                            className="party-input"
                          />
                          <select
                            value={role}
                            onChange={(e) =>
                              handleInputChange(index, "role", e.target.value)
                            }
                            className="party-select"
                          >
                            <option value="">Select role</option>
                            <option value="Buyer">Buyer</option>
                            <option value="Supplier">Supplier</option>
                            <option value="ThirdParty">ThirdParty</option>
                          </select>
                          <button
                            onClick={() => removeParty(index)}
                            className="delete-button"
                          >
                            Remove
                          </button>
                        </>
                      )}
                      {isSelf && <p className="self-label">(You)</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={handleSubmit} className="submit-button">
            Save
          </button>
        </div>
      ) : (
        <p className="empty-state">No parties added</p>
      )}
    </div>
  );
};

export default AddParty;
