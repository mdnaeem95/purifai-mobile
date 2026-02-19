import { create } from 'zustand';
import {
  CalculatorType,
  CashData,
  GoldData,
  InsuranceData,
  SharesData,
  ETFData,
  MutualFundsData,
  SukukData,
  InvestmentLandData,
  InvestmentPropertyData,
  CryptoData,
  NFTData,
  CommodityData,
  REITData,
  ETCData,
  PrivateEquityData,
  BusinessData,
} from '../types/calculator';
import { saveMemberData, loadMemberData } from '../services/storage';
import { useFamilyStore } from './familyStore';

interface CalculatorState {
  cash: CashData | null;
  gold: GoldData | null;
  insurance: InsuranceData | null;
  shares: SharesData | null;
  etf: ETFData | null;
  mutual_funds: MutualFundsData | null;
  sukuk: SukukData | null;
  investment_land: InvestmentLandData | null;
  investment_property: InvestmentPropertyData | null;
  crypto: CryptoData | null;
  nft: NFTData | null;
  commodity: CommodityData | null;
  reit: REITData | null;
  etc: ETCData | null;
  private_equity: PrivateEquityData | null;
  business: BusinessData | null;
}

interface CalculatorStore {
  calculators: CalculatorState;
  selectedCalculators: string[];
  calculatedCalculators: string[];
  totalZakatDue: number;

  // Actions
  setCalculatorData: (type: CalculatorType, data: any) => Promise<void>;
  clearCalculator: (type: CalculatorType) => Promise<void>;
  resetAll: () => Promise<void>;
  loadCalculators: () => Promise<void>;
  toggleCalculatorSelection: (type: CalculatorType) => void;
  markAsCalculated: (type: CalculatorType) => Promise<void>;
  updateTotalZakat: () => void;
  loadAllMembersCalculators: () => Promise<Record<string, CalculatorState>>;
}

const initialCalculatorState: CalculatorState = {
  cash: null,
  gold: null,
  insurance: null,
  shares: null,
  etf: null,
  mutual_funds: null,
  sukuk: null,
  investment_land: null,
  investment_property: null,
  crypto: null,
  nft: null,
  commodity: null,
  reit: null,
  etc: null,
  private_equity: null,
  business: null,
};

const getMemberId = (): string => useFamilyStore.getState().currentMemberId;

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  calculators: initialCalculatorState,
  selectedCalculators: [],
  calculatedCalculators: [],
  totalZakatDue: 0,

  setCalculatorData: async (type: CalculatorType, data: any) => {
    const memberId = getMemberId();
    const newCalculators = {
      ...get().calculators,
      [type]: data,
    };

    await saveMemberData('calculators', memberId, newCalculators);

    // Add to calculated calculators if it has a calculation
    const calculatedCalculators = [...get().calculatedCalculators];
    if (data.calculated && !calculatedCalculators.includes(type)) {
      calculatedCalculators.push(type);
    }

    set({
      calculators: newCalculators,
      calculatedCalculators,
    });

    // Update total Zakat
    get().updateTotalZakat();
  },

  clearCalculator: async (type: CalculatorType) => {
    const memberId = getMemberId();
    const newCalculators = {
      ...get().calculators,
      [type]: null,
    };

    await saveMemberData('calculators', memberId, newCalculators);

    // Remove from selected and calculated
    const selectedCalculators = get().selectedCalculators.filter((c) => c !== type);
    const calculatedCalculators = get().calculatedCalculators.filter((c) => c !== type);

    set({
      calculators: newCalculators,
      selectedCalculators,
      calculatedCalculators,
    });

    // Update total Zakat
    get().updateTotalZakat();
  },

  resetAll: async () => {
    const memberId = getMemberId();
    await saveMemberData('calculators', memberId, initialCalculatorState);
    await saveMemberData('selectedCalculators', memberId, []);
    await saveMemberData('calculatedCalculators', memberId, []);

    set({
      calculators: initialCalculatorState,
      selectedCalculators: [],
      calculatedCalculators: [],
      totalZakatDue: 0,
    });
  },

  loadCalculators: async () => {
    const memberId = getMemberId();
    if (!memberId) return;

    const calculators = await loadMemberData<CalculatorState>('calculators', memberId);
    const selectedCalculators = await loadMemberData<string[]>('selectedCalculators', memberId);
    const calculatedCalculators = await loadMemberData<string[]>('calculatedCalculators', memberId);

    set({
      calculators: calculators || initialCalculatorState,
      selectedCalculators: selectedCalculators || [],
      calculatedCalculators: calculatedCalculators || [],
    });

    // Update total Zakat
    get().updateTotalZakat();
  },

  toggleCalculatorSelection: async (type: CalculatorType) => {
    const memberId = getMemberId();
    const selectedCalculators = get().selectedCalculators;
    const newSelection = selectedCalculators.includes(type)
      ? selectedCalculators.filter((c) => c !== type)
      : [...selectedCalculators, type];

    await saveMemberData('selectedCalculators', memberId, newSelection);
    set({ selectedCalculators: newSelection });
  },

  markAsCalculated: async (type: CalculatorType) => {
    const memberId = getMemberId();
    const calculatedCalculators = get().calculatedCalculators;
    if (!calculatedCalculators.includes(type)) {
      const newCalculated = [...calculatedCalculators, type];
      await saveMemberData('calculatedCalculators', memberId, newCalculated);
      set({ calculatedCalculators: newCalculated });
    }

    // Update total Zakat
    get().updateTotalZakat();
  },

  updateTotalZakat: () => {
    const { calculators } = get();
    let total = 0;

    Object.values(calculators).forEach((calculator) => {
      if (calculator && calculator.calculated) {
        total += calculator.zakatAmount;
      }
    });

    set({ totalZakatDue: total });
  },

  loadAllMembersCalculators: async () => {
    const members = useFamilyStore.getState().members;
    const allData: Record<string, CalculatorState> = {};

    for (const member of members) {
      const data = await loadMemberData<CalculatorState>('calculators', member.id);
      if (data) {
        allData[member.id] = data;
      }
    }

    return allData;
  },
}));
