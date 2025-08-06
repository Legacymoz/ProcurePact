import { createContext, useContext, useState } from "react";
import { AuthClient } from "@dfinity/auth-client";
import { Actor } from "@dfinity/agent";
import { ProcurePact_backend } from 'declarations/ProcurePact_backend';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authClient, setAuthClient] = useState(null);
    const [principal, setPrincipal] = useState(null);
    const [user, setUser] = useState(null);

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const createAuthClient = async () => {
        const createdAuthClient = await AuthClient.create();
        setAuthClient(createdAuthClient);
        await onIdentityUpdate();
    }

    const onIdentityUpdate = async () => {
        if (!authClient.getIdentity().getPrincipal().isAnonymous()) { //don't authenticate anonymous identities
            Actor.agentOf(ProcurePact_backend).replaceIdentity(authClient.getIdentity());
            setIsAuthenticated(authClient.isAuthenticated());
            setPrincipal(authClient.getIdentity().getPrincipal());
        }
    };

    return (
        <>
            <AuthContext.Provider value={{ authClient, onIdentityUpdate, createAuthClient, isAuthenticated, principal, user, setUser }}>
                {children}
            </AuthContext.Provider>
        </>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}