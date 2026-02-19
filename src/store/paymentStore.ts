import { create } from 'zustand';
import { Payment, PaymentHistory, Beneficiary } from '../types/payment';
import { saveMemberData, loadMemberData } from '../services/storage';
import { useFamilyStore } from './familyStore';

export const BENEFICIARIES: Beneficiary[] = [
  { id: 'jamiyah', name: 'Jamiyah Singapore', initials: 'JS', color: '#3B82F6' },
  { id: 'ppis', name: 'Persatuan Pemudi Islam Singapura', initials: 'PP', color: '#059669' },
  { id: 'pergas', name: 'PERGAS', initials: 'P', color: '#7C3AED' },
  { id: 'alsagoff', name: 'Alsagoff Arab School', initials: 'AA', color: '#D97706' },
  { id: 'newlife', name: 'New Life Stories Limited', initials: 'NL', color: '#E11D48' },
  { id: 'madcash', name: 'MADCash S.E.', initials: 'MS', color: '#0891B2' },
  { id: 'amp', name: 'Association of Muslim Professionals', initials: 'AO', color: '#EA580C' },
];

export const PROCESSING_FEE_RATE = 0.0239; // 2.39%

const getMemberId = (): string => useFamilyStore.getState().currentMemberId;

interface PaymentStore extends PaymentHistory {
  // Current payment state
  selectedBeneficiaries: string[];
  allocations: Record<string, number>; // beneficiaryId -> percentage
  customAmount: number;

  // Actions
  toggleBeneficiary: (beneficiaryId: string) => void;
  setAllocation: (beneficiaryId: string, percentage: number) => void;
  setCustomAmount: (amount: number) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => Promise<void>;
  updatePaymentStatus: (paymentId: string, status: 'pending' | 'completed' | 'failed') => Promise<void>;
  loadPayments: () => Promise<void>;
  clearPayments: () => Promise<void>;
  resetPaymentSetup: () => void;
}

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: [],
  totalPaid: 0,
  selectedBeneficiaries: [],
  allocations: {},
  customAmount: 0,

  toggleBeneficiary: (beneficiaryId) => {
    const { selectedBeneficiaries, allocations } = get();
    if (selectedBeneficiaries.includes(beneficiaryId)) {
      // Remove
      const newSelected = selectedBeneficiaries.filter((id) => id !== beneficiaryId);
      const newAllocations = { ...allocations };
      delete newAllocations[beneficiaryId];
      set({ selectedBeneficiaries: newSelected, allocations: newAllocations });
    } else {
      // Add with 0% allocation
      set({
        selectedBeneficiaries: [...selectedBeneficiaries, beneficiaryId],
        allocations: { ...allocations, [beneficiaryId]: 0 },
      });
    }
  },

  setAllocation: (beneficiaryId, percentage) => {
    set({
      allocations: { ...get().allocations, [beneficiaryId]: Math.min(Math.max(percentage, 0), 100) },
    });
  },

  setCustomAmount: (amount) => {
    set({ customAmount: amount });
  },

  addPayment: async (paymentData) => {
    const memberId = getMemberId();
    const newPayment: Payment = {
      ...paymentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    const payments = [...get().payments, newPayment];
    await saveMemberData('payments', memberId, payments);

    const totalPaid = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.zakatAmount, 0);

    set({ payments, totalPaid });
  },

  updatePaymentStatus: async (paymentId, status) => {
    const memberId = getMemberId();
    const payments = get().payments.map((payment) => {
      if (payment.id === paymentId) {
        return {
          ...payment,
          status,
          completedAt: status === 'completed' ? new Date().toISOString() : payment.completedAt,
        };
      }
      return payment;
    });

    await saveMemberData('payments', memberId, payments);

    const totalPaid = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + p.zakatAmount, 0);

    set({ payments, totalPaid });
  },

  loadPayments: async () => {
    const memberId = getMemberId();
    if (!memberId) return;

    const payments = await loadMemberData<Payment[]>('payments', memberId);

    if (payments) {
      const totalPaid = payments
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + p.zakatAmount, 0);

      set({ payments, totalPaid });
    } else {
      set({ payments: [], totalPaid: 0 });
    }
  },

  clearPayments: async () => {
    const memberId = getMemberId();
    await saveMemberData('payments', memberId, []);
    set({ payments: [], totalPaid: 0 });
  },

  resetPaymentSetup: () => {
    set({ selectedBeneficiaries: [], allocations: {}, customAmount: 0 });
  },
}));
