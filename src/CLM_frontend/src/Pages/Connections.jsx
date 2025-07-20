import { CLM_backend } from "declarations/CLM_backend";
import { useEffect, useState } from "react";
import { useAuth } from "../Hooks/AuthContext";
import RequestModal from "../Components/RequestModal";
import { Principal } from "@dfinity/principal";

const Connections = () => {
    const { principal } = useAuth();
    const [connections, setConnections] = useState([]);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);

    const getConnections = async (principal) => {
        await CLM_backend.getConnections(principal).then((response) => {
            if (response.ok) {
                setConnections(normalizeConnections(response.ok));
            } else (
                console.log(response.err)
            )
        })
    };

    const request = async (principal) => {
        await CLM_backend.requestConnection(principal).then((response) => {
            if (response.ok) {
                alert("Connection request sent!")
            } else {
                alert("Error sending request");
                console.log(response.err);
            }
        }).finally(
            getConnections()
        );
    }

    const acceptInvitation = async (principal) => {
        await CLM_backend.acceptConnectionRequest(Principal.fromText(principal)).then((response) => {
            if (response.ok) {
                alert("Connection Request Accepted!");
            } else {
                alert("Error accepting request");
            }
        }
        ).finally(
            getConnections()
        )
    };

    const normalizeConnections = (connectionsArr) => {
        return connectionsArr.map((connection) => {
            let principalText = Principal.fromUint8Array(connection.principal._arr).toText();
            let status = Object.keys(connection.status)[0];
            return { ...connection, principal: principalText, status: status };
        });
    };

    useEffect(() => {
        getConnections(principal);
    }, []);
    return (<>
        <div className="container">
            <h1>My Connections</h1>
            <button className="create-button" onClick={handleOpen}>Request</button>
            <section>
                <h2>Mutual</h2>
                {connections.filter(conn => conn.status === "Accepted").length === 0 ? (
                    <p>No mutual connections.</p>
                ) : (
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">Principal</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {connections.filter(conn => conn.status === "Accepted").map((conn, idx) => (
                                <tr key={idx}>
                                    <td>{conn.principal}</td>
                                    <td><button className="btn btn-danger">Remove</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
            <section>
                <h2>Invitations</h2>
                {connections.filter(conn => conn.status === "Invited").length === 0 ? (
                    <p>No invitations.</p>
                ) : (
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">Principal</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {connections.filter(conn => conn.status === "Invited").map((conn, idx) => (
                                <tr key={idx}>
                                    <td>{conn.principal}</td>
                                    <td>
                                        <button onClick={() => acceptInvitation(conn.principal)} className="btn btn-primary">
                                            Accept
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
            <section>
                <h2>Pending Requests</h2>
                {connections.filter(conn => conn.status === "RequestSent").length === 0 ? (
                    <p>No pending requests.</p>
                ) : (
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col"> Principal</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {connections.filter(conn => conn.status === "RequestSent").map((conn, idx) => (
                                <tr key={idx}>
                                    <td>{conn.principal}</td>
                                    <td><button className="btn btn-danger">Cancel Request</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
            <RequestModal
                open={(open)}
                setOpen={setOpen}
                requestConnection={request}
            />
        </div>
    </>)
};
export default Connections;