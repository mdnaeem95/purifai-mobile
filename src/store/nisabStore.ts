import { create } from 'zustand';
import { NISAB } from '../constants/nisab';

interface NisabStore {
  monetary: number;
  goldWeight: number;
  goldPrice: number;
  updatedDate: string;

  // Actions
  updateNisab: (monetary: number, goldWeight: number, goldPrice: number) => void;
}

export const useNisabStore = create<NisabStore>((set) => ({
  monetary: NISAB.monetary.amount,
  goldWeight: NISAB.gold.weight,
  goldPrice: NISAB.gold.pricePerGram,
  updatedDate: NISAB.updatedDate,

  updateNisab: (monetary: number, goldWeight: number, goldPrice: number) => {
    set({
      monetary,
      goldWeight,
      goldPrice,
      updatedDate: new Date().toISOString().split('T')[0],
    });
  },
}));
