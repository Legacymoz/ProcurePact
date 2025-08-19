import {
  IcrcLedgerCanister
} from "@dfinity/ledger-icrc";
import {
  create
} from "zustand";
import {
  createAgent
} from "@dfinity/utils";

export const ledgerStore = create((set) => ({
  ledger: null,
  agent: null,
  canister: null,

  createLedger: async (identity, canisterId, host) => {
    try {
      const agent = await createAgent({
        identity,
        host: host ?? undefined,
      });

      if (host) {
        await agent.fetchRootKey();
      }

      const createdLedger = IcrcLedgerCanister.create({
        agent,
        canisterId,
      });

      set(() => ({
        ledger: createdLedger,
        agent: agent,
        canister: canisterId
      }));
    } catch (error) {
      console.error("Error creating ledger:", error);
      return (null);
    }
  },
}));