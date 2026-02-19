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
import { CALCULATORS } from '../constants/calculators';

// 16 distinct colors for chart segments
const CHART_COLORS: Record<CalculatorType, string> = {
  cash: '#6366F1',       // Indigo
  gold: '#F59E0B',       // Amber
  insurance: '#8B5CF6',  // Violet
  shares: '#10B981',     // Emerald
  etf: '#3B82F6',        // Blue
  mutual_funds: '#EC4899', // Pink
  sukuk: '#14B8A6',      // Teal
  investment_land: '#F97316', // Orange
  investment_property: '#EF4444', // Red
  crypto: '#06B6D4',     // Cyan
  nft: '#A855F7',        // Purple
  commodity: '#84CC16',  // Lime
  reit: '#0EA5E9',       // Sky
  etc: '#D946EF',        // Fuchsia
  private_equity: '#059669', // Emerald dark
  business: '#4338CA',   // Indigo dark
};

/**
 * Extracts the gross total asset value from a calculator's stored data.
 */
export function getAssetValue(type: CalculatorType, data: any): number {
  if (!data || !data.calculated) return 0;

  switch (type) {
    case 'cash': {
      const d = data as CashData;
      return d.accounts.reduce((sum, a) => sum + (Number(a.lowestAmountInYear) || 0), 0);
    }
    case 'gold': {
      const d = data as GoldData;
      const grams = d.applyZakatOnPersonalGold
        ? (Number(d.personalUseGold) || 0) + (Number(d.investmentGold) || 0)
        : Number(d.investmentGold) || 0;
      return grams * (Number(d.currentPricePerGram) || 0);
    }
    case 'insurance': {
      const d = data as InsuranceData;
      return d.policies.reduce((sum, p) => sum + (Number(p.surrenderValue) || 0), 0);
    }
    case 'shares': {
      const d = data as SharesData;
      return d.holdings.reduce(
        (sum, h) => sum + (Number(h.numberOfShares) || 0) * (Number(h.pricePerShare) || 0),
        0,
      );
    }
    case 'etf': {
      const d = data as ETFData;
      return d.holdings.reduce(
        (sum, h) => sum + (Number(h.numberOfUnits) || 0) * (Number(h.pricePerUnit) || 0),
        0,
      );
    }
    case 'mutual_funds': {
      const d = data as MutualFundsData;
      return d.holdings.reduce(
        (sum, h) => sum + (Number(h.numberOfUnits) || 0) * (Number(h.pricePerUnit) || 0),
        0,
      );
    }
    case 'sukuk': {
      const d = data as SukukData;
      switch (d.sukukType) {
        case 'al_ijarah':
          return (Number(d.rentalIncomeReceived) || 0) + (Number(d.remainingAtDueDate) || 0);
        case 'al_musharakah':
          return Number(d.sukukValue) || 0;
        case 'al_mudharabah':
          return Number(d.marketValue) || 0;
        case 'al_murabahah':
          return Number(d.outstandingReceivable) || 0;
        case 'al_istisna':
          return Number(d.totalIncomeFromGoods) || 0;
        default:
          return 0;
      }
    }
    case 'investment_land': {
      const d = data as InvestmentLandData;
      return d.holdings.reduce((sum, h) => sum + (Number(h.marketValue) || 0), 0);
    }
    case 'investment_property': {
      const d = data as InvestmentPropertyData;
      return (
        Number(d.currentMarketValue) ||
        Number(d.rentalIncomeOnHand) ||
        Number(d.marketValueAfterRefurbishment) ||
        0
      );
    }
    case 'crypto': {
      const d = data as CryptoData;
      return Number(d.marketValue) || 0;
    }
    case 'nft': {
      const d = data as NFTData;
      return Number(d.marketValue) || 0;
    }
    case 'commodity': {
      const d = data as CommodityData;
      return Number(d.premiumPaid) || 0;
    }
    case 'reit': {
      const d = data as REITData;
      return (Number(d.numberOfUnits) || 0) * (Number(d.pricePerUnit) || 0);
    }
    case 'etc': {
      const d = data as ETCData;
      return d.holdings.reduce(
        (sum, h) => sum + (Number(h.numberOfUnits) || 0) * (Number(h.pricePerUnit) || 0),
        0,
      );
    }
    case 'private_equity': {
      const d = data as PrivateEquityData;
      return Number(d.investmentAmount) || 0;
    }
    case 'business': {
      const d = data as BusinessData;
      return (
        (Number(d.bankBalance) || 0) +
        (Number(d.cashInHand) || 0) +
        (Number(d.fixedDeposit) || 0) +
        (Number(d.prepaidExpenses) || 0) +
        (Number(d.closingStocks) || 0) +
        (Number(d.tradeStocks) || 0) +
        (Number(d.tradeDebtors) || 0) +
        (Number(d.loanReceivable) || 0) +
        (Number(d.staffWelfareFund) || 0) +
        (Number(d.staffLoan) || 0) +
        (Number(d.otherDeposits) || 0)
      );
    }
    default:
      return 0;
  }
}

export interface PortfolioItem {
  type: CalculatorType;
  name: string;
  icon: string;
  assetValue: number;
  zakatAmount: number;
  color: string;
}

export interface MemberContribution {
  memberId: string;
  memberName: string;
  assetValue: number;
  zakatAmount: number;
}

export interface FamilyPortfolioItem extends PortfolioItem {
  memberContributions: MemberContribution[];
}

/**
 * Builds portfolio data from all calculated calculators.
 * Returns items sorted by asset value descending.
 */
export function getPortfolioData(calculators: Record<string, any>): PortfolioItem[] {
  const items: PortfolioItem[] = [];

  for (const meta of CALCULATORS) {
    const data = calculators[meta.id];
    if (!data || !data.calculated) continue;

    const assetValue = getAssetValue(meta.id, data);
    if (assetValue <= 0) continue;

    items.push({
      type: meta.id,
      name: meta.name,
      icon: meta.icon,
      assetValue,
      zakatAmount: Number(data.zakatAmount) || 0,
      color: CHART_COLORS[meta.id],
    });
  }

  items.sort((a, b) => b.assetValue - a.assetValue);
  return items;
}

/**
 * Aggregates portfolio data across all family members.
 * Each asset type sums values from all members and tracks per-member contributions.
 */
export function getFamilyPortfolioData(
  allMembersCalcs: Record<string, Record<string, any>>,
  members: { id: string; name: string }[],
): FamilyPortfolioItem[] {
  const itemMap = new Map<CalculatorType, FamilyPortfolioItem>();

  for (const member of members) {
    const calcs = allMembersCalcs[member.id];
    if (!calcs) continue;

    for (const meta of CALCULATORS) {
      const data = calcs[meta.id];
      if (!data || !data.calculated) continue;

      const assetValue = getAssetValue(meta.id, data);
      if (assetValue <= 0) continue;

      const zakatAmount = Number(data.zakatAmount) || 0;

      if (!itemMap.has(meta.id)) {
        itemMap.set(meta.id, {
          type: meta.id,
          name: meta.name,
          icon: meta.icon,
          assetValue: 0,
          zakatAmount: 0,
          color: CHART_COLORS[meta.id],
          memberContributions: [],
        });
      }

      const item = itemMap.get(meta.id)!;
      item.assetValue += assetValue;
      item.zakatAmount += zakatAmount;
      item.memberContributions.push({
        memberId: member.id,
        memberName: member.name,
        assetValue,
        zakatAmount,
      });
    }
  }

  const items = Array.from(itemMap.values());
  items.sort((a, b) => b.assetValue - a.assetValue);
  return items;
}
