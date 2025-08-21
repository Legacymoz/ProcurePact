import { useEffect, useState } from "react";
import { useAuth } from "../Hooks/AuthContext";
import RequestModal from "../Components/RequestModal";
import { Principal } from "@dfinity/principal";
import "../styles/ConnectionStyles.css";
import { ProcurePact_backend } from "declarations/ProcurePact_backend";
import { useStore } from "../store/useStore";


const tabOptions = [
  { label: "Mutual", key: "mutual" },
  { label: "Invitations", key: "invitations" },
  { label: "Pending", key: "pending" },
];

const Connections = () => {
  const { principal } = useAuth();
  const [connections, setConnections] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("mutual");
  const handleOpen = () => setOpen(true);

  const { myConnections, getConnections } = useStore();

  useEffect(() => {
    
    if (principal) {
      fetchConnections(); // Call the async function
    }
  }, [principal, getConnections]);

const fetchConnections = async () => {
  try {
    await getConnections(principal); // Call your async function here
    console.log("Coonections before normalizing", myConnections);
    const normalized = await normalizeConnections(myConnections);
    console.log("Normalized Connections:", normalized);
    setConnections(normalized);
  } catch (error) {
    console.error("Error fetching connections:", error);
  }
};

  const request = async (principal) => {
    await ProcurePact_backend.requestConnection(principal)
      .then((response) => {
        if (response.ok) {
          alert("Connection request sent!");
        } else {
          alert("Error sending request");
          console.log(response.err);
        }
      })
      .finally(getConnections());
  };

  const acceptInvitation = async (principal) => {
    await ProcurePact_backend.acceptConnectionRequest(
      Principal.fromText(principal)
    )
      .then((response) => {
        if (response.ok) {
          alert("Connection Request Accepted!");
        } else {
          alert("Error accepting request");
        }
      })
      .finally(getConnections());
  };

 


  const normalizeConnections = async (connectionsArr) => {
    // Fetch user details for each connection
    const normalized = await Promise.all(
      connectionsArr.map(async (connection) => {
        let principalText = Principal.fromUint8Array(
          connection.principal._arr
        ).toText();
        let status = Object.keys(connection.status)[0];
        // Fetch user details for this principal
        let userDetails = {};
        try {
          const response = await ProcurePact_backend.getUser(
            Principal.fromText(principalText)
          );
            console.log("User details response:", response);
          if (response && response.length > 0) {
            userDetails = response[0];
            console.log("User details fetched:", userDetails);
          }
        } catch (e) {
            console.error("Error fetching user details:", e);
        }
        return {
          ...connection,
          principal: principalText,
          status,
          ...userDetails,
        };
      })
    );
    return normalized;
  };

 

  // Tab content filter logic
  const getTabConnections = () => {
    if (activeTab === "mutual") {
      return connections.filter((conn) => conn.status === "Accepted");
    }
    if (activeTab === "invitations") {
      return connections.filter((conn) => conn.status === "Invited");
    }
    if (activeTab === "pending") {
      return connections.filter((conn) => conn.status === "RequestSent");
    }
    return [];
  };
  const handleRefresh = ()=> {
    if (principal) {
      fetchConnections(); // Call the async function
    }

  }

  if (!connections || connections.length === 0) {
    return <div> Loading..... </div>;
  }



  return (
    <div className="main-connections-container">
      <div className="sub-connections-container">
        <div className="header">
          <h1>My Connections</h1>
          <div className="connection-button">
            <button className="create-button" onClick={handleOpen}>
              Request
            </button>
            <button className="refresh-button" onClick={handleRefresh}>
              Refresh
            </button>
          </div>
        </div>

        <div className="connections-tabs">
          {tabOptions.map((tab) => (
            <button
              key={tab.key}
              className={`connections-tab-btn${
                activeTab === tab.key ? " active" : ""
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="connections-tab-content">
          {activeTab === "mutual" && (
            <div className="mutual-tab">
              {getTabConnections().length === 0 ? (
                <p className="no-connection">No mutual connections.</p>
              ) : (
                <table className="connections-table">
                  <thead>
                    <tr>
                      <th>Principal</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTabConnections().map((conn, idx) => (
                      <tr key={idx}>
                        <td>{conn.principal}</td>
                        <td>{conn.name ?? "-"}</td>
                        <td>{conn.email ?? "-"}</td>
                        <td>
                          <button className="remove-btn">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {activeTab === "invitations" && (
            <div className="invitations-tab">
              {getTabConnections().length === 0 ? (
                <p className="no-connection">No invitations.</p>
              ) : (
                <table className="connections-table">
                  <thead>
                    <tr>
                      <th>Principal</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTabConnections().map((conn, idx) => (
                      <tr key={idx}>
                        <td>{conn.principal}</td>
                        <td>{conn.name ?? "-"}</td>
                        <td>{conn.email ?? "-"}</td>
                        <td>
                          <button
                            onClick={() => acceptInvitation(conn.principal)}
                            className="accept-btn"
                          >
                            Accept
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {activeTab === "pending" && (
            <div className="pending-tab">
              {getTabConnections().length === 0 ? (
                <p className="no-connection">No pending requests.</p>
              ) : (
                <table className="connections-table">
                  <thead>
                    <tr>
                      <th>Principal</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getTabConnections().map((conn, idx) => (
                      <tr key={idx}>
                        <td>{conn.principal}</td>
                        <td>{conn.name ?? "-"}</td>
                        <td>{conn.email ?? "-"}</td>
                        <td>
                          <button className="cancel-btn">Cancel Request</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
      <RequestModal open={open} setOpen={setOpen} requestConnection={request} />
    </div>
  );
};

export default Connections;
