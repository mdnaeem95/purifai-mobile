// Calculator metadata for all 16 asset types
import { CalculatorType } from '../types/calculator';

export interface CalculatorMeta {
  id: CalculatorType;
  name: string;
  icon: string;
  description: string;
  route: string;
}

export const CALCULATORS: CalculatorMeta[] = [
  {
    id: 'cash',
    name: 'Cash',
    icon: 'dollar-sign',
    description: 'Pay Zakat on your bank accounts, cash, and savings',
    route: 'CashCalculator',
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: 'box',
    description: 'Pay Zakat on Gold (Physical or Fractional)',
    route: 'GoldCalculator',
  },
  {
    id: 'insurance',
    name: 'Insurance',
    icon: 'shield',
    description: 'Zakat on the surrender value of the insurance',
    route: 'InsuranceCalculator',
  },
  {
    id: 'shares',
    name: 'Shares',
    icon: 'trending-up',
    description: 'Pay Zakat on shares of companies',
    route: 'SharesCalculator',
  },
  {
    id: 'etf',
    name: 'Exchange-Traded Funds',
    icon: 'activity',
    description: 'Pay Zakat on Exchange-Traded Funds',
    route: 'ETFCalculator',
  },
  {
    id: 'mutual_funds',
    name: 'Mutual Funds',
    icon: 'pie-chart',
    description: 'Pay Zakat on Mutual Funds and Unit Trusts',
    route: 'MutualFundsCalculator',
  },
  {
    id: 'sukuk',
    name: 'Sukuk',
    icon: 'file-text',
    description: 'Pay Zakat on Islamic Bonds (Sukuk)',
    route: 'SukukCalculator',
  },
  {
    id: 'investment_land',
    name: 'Investment Land',
    icon: 'map-pin',
    description: 'Pay Zakat on land held as trading stock',
    route: 'InvestmentLandCalculator',
  },
  {
    id: 'investment_property',
    name: 'Investment Property',
    icon: 'home',
    description: 'Pay Zakat on property held for resale or rental income',
    route: 'InvestmentPropertyCalculator',
  },
  {
    id: 'crypto',
    name: 'Crypto Asset',
    icon: 'cpu',
    description: 'Pay Zakat on cryptocurrency and digital tokens',
    route: 'CryptoCalculator',
  },
  {
    id: 'nft',
    name: 'Non-Fungible Tokens',
    icon: 'image',
    description: 'Pay Zakat on NFTs based on type and underlying asset',
    route: 'NFTCalculator',
  },
  {
    id: 'commodity',
    name: 'Commodity Investing',
    icon: 'package',
    description: 'Pay Zakat on commodity investments and premiums',
    route: 'CommodityCalculator',
  },
  {
    id: 'reit',
    name: 'Real Estate Investment Trusts',
    icon: 'grid',
    description: 'Pay Zakat on REIT units or rental income',
    route: 'REITCalculator',
  },
  {
    id: 'etc',
    name: 'Exchange-Traded Commodities',
    icon: 'box',
    description: 'Pay Zakat on Exchange-Traded Commodities',
    route: 'ETCCalculator',
  },
  {
    id: 'private_equity',
    name: 'Private Equity',
    icon: 'briefcase',
    description: 'Pay Zakat on Private Equity and Startup Investments',
    route: 'PrivateEquityCalculator',
  },
  {
    id: 'business',
    name: 'Business',
    icon: 'clipboard',
    description: 'Zakat on Business based on AAOIFI Shariah Standards',
    route: 'BusinessCalculator',
  },
];
