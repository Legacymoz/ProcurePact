import { create } from "zustand";

export const useStore = create((set) => ({

    selectedContract: '',
    setSelectedContract: (contractId) => set(() => ({ selectedContract: contractId })),



}))

