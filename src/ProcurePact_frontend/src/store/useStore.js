import {
  create
} from "zustand";
import {
  ProcurePact_backend
} from "declarations/ProcurePact_backend";

export const useStore = create((set) => ({
  selectedContract: "",
  setSelectedContract: (contractId) =>
    set(() => ({
      selectedContract: contractId
    })),

  //Function to get a users Contracts
  myContracts: [],
  fetchContracts: async (principal) => {
    try {
      const result = await ProcurePact_backend.getContracts(principal);
      if (result.ok) {
        set({
          myContracts: result.ok
        });
        console.log("Contracts fetched successfully", result.ok);
      }
    } catch (err) {
      console.error("Error fetching contracts:", err);
    }
  },

  //Function to get a users Invoice

  myInvoices: [],
  fetchInvoices: async (principal) => {
    try {
      const result = await ProcurePact_backend.getInvoices(principal);
      if (result.ok) {
        set({
          myInvoices: result.ok
        });
        console.log("Invoices fetched successfully", result.ok);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  },

  //Functions to get Users Connections
  myConnections: [],
  getConnections: async (principal) => {
    try {
      const result = await ProcurePact_backend.getConnections(principal);
      if (result.ok) {
        set({
          myConnections: result.ok
        });
        console.log("Connections fetched successfully", result.ok);
      }
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  },

  userInfo: [],
  getUserInfo: async (principal) => {
    try {
      const result = await ProcurePact_backend.getUser(principal);
      if (result.ok) {
        set({
          userInfo: result.ok
        });
        console.log("User info fetched successfully", result.ok);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  },
}));