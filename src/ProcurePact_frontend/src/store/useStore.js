import { create } from "zustand";
import { icrc1_ledger_canister } from "declarations/icrc1_ledger_canister";
import { ProcurePact_backend } from "declarations/ProcurePact_backend";
import { invoice } from "declarations/invoice";


export const useStore = create((set) => ({
  selectedContract: "",
  setSelectedContract: (contractId) =>
    set(() => ({ selectedContract: contractId })),

  //Token Balance for User
  userBalance: 0,
  getUserBalance: async (principal) => {
    try {
      const result = await icrc1_ledger_canister.icrc1_balance_of({
        owner: principal,
        subaccount: [],
      });
      set({ userBalance: result });
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  },

  //Function to get a users Contracts
  myContracts: [],
  fetchContracts: async (principal) => {
    try {
      const result = await ProcurePact_backend.getContracts(principal);
      if (result.ok) {
        set({ myContracts: result.ok });
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
        set({ myInvoices: result.ok });
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
        set({ myConnections: result.ok });
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
      if (result[0]) {
        set({ userInfo: result[0] });
        console.log("User info fetched successfully", result[0]);
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  },

  //its the same function as the above, bh this returns a value
  getUserInfoandReturn: async (principal) => {
    try {
      const result = await ProcurePact_backend.getUser(principal);
      console.log("Result in getInfoandReturn", result);
      if (result[0]) {
        set({ userInfo: result[0] });
        console.log("User info fetched successfully", result[0]);
        return result[0]; // 👈 return the value
      }
    } catch (err) {
      console.error("Error fetching user info:", err);
    }
  },

  //Setting the selected invoice ID
  selectedInvoiceID: "",
  setSelectedInvoiceID: (invoiceId) =>
    set(() => ({ selectedInvoiceID: invoiceId })),
  clearSelectedInvoiceID: () => set(() => ({ selectedInvoiceID: "" })),

  //Fetching the selected Invoice Data
  invoiceData: null,
  fetchInvoiceData: async (invoiceId) => {
    try {
      const result = await invoice.getInvoice(BigInt(invoiceId));
      if (result[0]) {
        set({ invoiceData: result[0] });
        console.log("Invoice data fetched successfully", result[0]);
      }
    } catch (err) {
      console.error("Error fetching invoice data:", err);
    }
  },

  //Fetching all invoices
  allInvoices: [],
  fetchAllInvoices: async (principal) => {
    try {
      const result = await ProcurePact_backend.getInvoices(principal);
      if (result.ok) {
        set({ allInvoices: result.ok });
        console.log("All invoices fetched successfully", result.ok);
      }
    } catch (err) {
      console.error("Error fetching all invoices:", err);
    }
  },
}));

