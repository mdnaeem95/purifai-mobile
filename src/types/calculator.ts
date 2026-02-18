// Calculator types

export interface BankAccount {
  id: string;
  name: string;
  accountType: 'savings' | 'current' | 'fixed_deposit';
  lowestAmountInYear: number;
  interestEarned?: number;
}

export interface CashData {
  accounts: BankAccount[];
  totalDebts: number;
  calculated: boolean;
  zakatAmount: number;
}

export interface GoldData {
  currentPricePerGram: number; // Current market price per gram
  personalUseGold: number; // Jewelry and gold for personal use (grams)
  investmentGold: number; // Gold bars, coins, investment gold (grams)
  applyZakatOnPersonalGold: boolean; // Hanafi method includes personal jewelry
  calculated: boolean;
  zakatAmount: number;
}

export interface InsurancePolicy {
  id: string;
  policyName: string;
  policyType: 'endowment' | 'whole_life' | 'term_life' | 'health' | 'auto';
  surrenderValue: number;
}

export interface InsuranceData {
  policies: InsurancePolicy[];
  calculated: boolean;
  zakatAmount: number;
}

export interface ShareHolding {
  id: string;
  companyName: string;
  numberOfShares: number;
  pricePerShare: number;
  zakatableAssetRatio: number; // For asset-based method
}

export type SharesCalculationMethod = 'asset_based' | 'market_value' | 'detailed';

export interface SharesData {
  calculationMethod: SharesCalculationMethod;
  holdings: ShareHolding[];
  calculated: boolean;
  zakatAmount: number;
}

export interface ETFHolding {
  id: string;
  name: string;
  numberOfUnits: number;
  pricePerUnit: number;
}

export type ETFCalculationMethod = 'direct' | 'ratio_25' | 'informational';

export interface ETFData {
  liabilityExemptions: string[]; // IDs of checked exemption conditions
  calculationMethod: ETFCalculationMethod;
  holdings: ETFHolding[];
  calculated: boolean;
  zakatAmount: number;
}

export interface MutualFundHolding {
  id: string;
  name: string;
  numberOfUnits: number;
  pricePerUnit: number;
}

export type MutualFundsCalculationMethod = 'ratio_25' | 'informational';

export interface MutualFundsData {
  liabilityExemptions: string[];
  calculationMethod: MutualFundsCalculationMethod;
  holdings: MutualFundHolding[];
  calculated: boolean;
  zakatAmount: number;
}

export type SukukType = 'al_ijarah' | 'al_musharakah' | 'al_mudharabah' | 'al_murabahah' | 'al_istisna';

export interface SukukData {
  sukukType: SukukType;
  // Al Ijarah fields
  rentalIncomeReceived?: number;
  remainingAtDueDate?: number;
  // Al Musharakah fields
  sukukValue?: number;
  zakatableAssetPercentage?: number;
  // Al Mudharabah fields
  marketValue?: number;
  profitShareReceived?: number;
  // Al Murabahah fields
  outstandingReceivable?: number;
  // Al Istisna fields
  totalIncomeFromGoods?: number;
  calculated: boolean;
  zakatAmount: number;
}

export interface LandHolding {
  id: string;
  name: string;
  marketValue: number;
}

export interface InvestmentLandData {
  liabilityExemptions: string[];
  holdings: LandHolding[];
  calculated: boolean;
  zakatAmount: number;
}

export type PropertyType = 'bought_to_resell' | 'rental_income' | 'redevelop_resell';

export interface InvestmentPropertyData {
  liabilityExemptions: string[];
  propertyType: PropertyType;
  propertyName: string;
  // Type 1: Bought to Resell
  currentMarketValue?: number;
  // Type 2: Rental Income
  rentalIncomeOnHand?: number;
  // Type 3: Redevelop & Resell
  marketValueAfterRefurbishment?: number;
  calculated: boolean;
  zakatAmount: number;
}

export type CryptoType = 'trading' | 'security_tokens' | 'asset_backed';

export interface CryptoData {
  liabilityExemptions: string[];
  cryptoType: CryptoType;
  cryptoName: string;
  marketValue: number;
  zakatableAssetRatio?: number; // For security tokens
  calculated: boolean;
  zakatAmount: number;
}

export type NFTType = 'market_value' | 'underlying_asset';

export interface NFTData {
  liabilityExemptions: string[];
  nftType: NFTType;
  nftName: string;
  marketValue: number;
  underlyingAssetValue?: number; // For Type 2
  calculated: boolean;
  zakatAmount: number;
}

export interface CommodityData {
  liabilityExemptions: string[];
  commodityName: string;
  premiumPaid: number;
  calculated: boolean;
  zakatAmount: number;
}

export type REITType = 'unit_value' | 'rental_income';

export interface REITData {
  liabilityExemptions: string[];
  reitType: REITType;
  reitName: string;
  numberOfUnits: number;
  pricePerUnit: number;
  rentalIncomeOnHand?: number; // For Type 2
  calculated: boolean;
  zakatAmount: number;
}

export type ETCCalculationType = 'market_value' | 'underlying_asset';

export interface ETCHolding {
  id: string;
  name: string;
  numberOfUnits: number;
  pricePerUnit: number;
}

export interface ETCData {
  liabilityExemptions: string[];
  calculationType: ETCCalculationType;
  holdings: ETCHolding[];
  calculated: boolean;
  zakatAmount: number;
}

export interface PrivateEquityData {
  liabilityExemptions: string[];
  companyName: string;
  investmentAmount: number;
  companyBookValue: number;
  zakatableAssets: number;
  companyLiabilities: number;
  calculated: boolean;
  zakatAmount: number;
}

export interface BusinessData {
  // Current Assets
  bankBalance: number;
  cashInHand: number;
  fixedDeposit: number;
  prepaidExpenses: number;
  closingStocks: number;
  tradeStocks: number;
  tradeDebtors: number;
  loanReceivable: number;
  staffWelfareFund: number;
  staffLoan: number;
  otherDeposits: number;
  // Adjustments to Remove
  bankInterestReceived: number;
  latePaymentInterest: number;
  utilitiesDeposit: number;
  badDebts: number;
  obsoleteStocks: number;
  // Adjustments to Add
  donationsLastQuarter: number;
  fixedAssetsPurchased: number;
  personalDrawings: number;
  // Current Liabilities
  tradeCreditors: number;
  financialLoans: number;
  accruedExpenses: number;
  incomeTaxProvision: number;
  overdraft: number;
  directorsFees: number;
  // Business Details
  muslimOwnershipPercentage: number;
  calculated: boolean;
  zakatAmount: number;
}

export type CalculatorData =
  | CashData
  | GoldData
  | InsuranceData
  | SharesData
  | ETFData
  | MutualFundsData
  | SukukData
  | InvestmentLandData
  | InvestmentPropertyData
  | CryptoData
  | NFTData
  | CommodityData
  | REITData
  | ETCData
  | PrivateEquityData
  | BusinessData;

export type CalculatorType =
  | 'cash'
  | 'gold'
  | 'insurance'
  | 'shares'
  | 'etf'
  | 'mutual_funds'
  | 'sukuk'
  | 'investment_land'
  | 'investment_property'
  | 'crypto'
  | 'nft'
  | 'commodity'
  | 'reit'
  | 'etc'
  | 'private_equity'
  | 'business';
