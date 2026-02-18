// Payment types

export interface Beneficiary {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface BeneficiaryAllocation {
  beneficiaryId: string;
  percentage: number;
  amount: number;
}

export interface Payment {
  id: string;
  zakatAmount: number;
  customAmount: number;
  processingFee: number;
  totalAmount: number;
  currency: string;
  calculators: string[]; // Array of calculator IDs included in this payment
  distributions: BeneficiaryAllocation[];
  paymentMethod: 'paynow';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface PaymentHistory {
  payments: Payment[];
  totalPaid: number;
}
