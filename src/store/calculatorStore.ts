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
import { saveData, loadData } from '../services/storage';

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

export const useCalculatorStore = create<CalculatorStore>((set, get) => ({
  calculators: initialCalculatorState,
  selectedCalculators: [],
  calculatedCalculators: [],
  totalZakatDue: 0,

  setCalculatorData: async (type: CalculatorType, data: any) => {
    const newCalculators = {
      ...get().calculators,
      [type]: data,
    };

    await saveData('calculators', newCalculators);

    // Add to calculated calculators if it has a calculation
    const calculatedCalculators = get().calculatedCalculators;
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
    const newCalculators = {
      ...get().calculators,
      [type]: null,
    };

    await saveData('calculators', newCalculators);

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
    await saveData('calculators', initialCalculatorState);
    await saveData('selectedCalculators', []);

    set({
      calculators: initialCalculatorState,
      selectedCalculators: [],
      calculatedCalculators: [],
      totalZakatDue: 0,
    });
  },

  loadCalculators: async () => {
    const calculators = await loadData<CalculatorState>('calculators');
    const selectedCalculators = await loadData<string[]>('selectedCalculators');
    const calculatedCalculators = await loadData<string[]>('calculatedCalculators');

    if (calculators) {
      set({
        calculators,
        selectedCalculators: selectedCalculators || [],
        calculatedCalculators: calculatedCalculators || [],
      });

      // Update total Zakat
      get().updateTotalZakat();
    }
  },

  toggleCalculatorSelection: async (type: CalculatorType) => {
    const selectedCalculators = get().selectedCalculators;
    const newSelection = selectedCalculators.includes(type)
      ? selectedCalculators.filter((c) => c !== type)
      : [...selectedCalculators, type];

    await saveData('selectedCalculators', newSelection);
    set({ selectedCalculators: newSelection });
  },

  markAsCalculated: async (type: CalculatorType) => {
    const calculatedCalculators = get().calculatedCalculators;
    if (!calculatedCalculators.includes(type)) {
      const newCalculated = [...calculatedCalculators, type];
      await saveData('calculatedCalculators', newCalculated);
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
}));
