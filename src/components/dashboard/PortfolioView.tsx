import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { DonutChart } from './DonutChart';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useCalculatorStore } from '../../store/calculatorStore';
import { useFamilyStore } from '../../store/familyStore';
import {
  getPortfolioData,
  getFamilyPortfolioData,
  PortfolioItem,
  FamilyPortfolioItem,
} from '../../utils/portfolio';
import { formatCurrency } from '../../utils/formatters';

// --- Legend Row ---

const LegendRow: React.FC<{
  item: PortfolioItem | FamilyPortfolioItem;
  percentage: number;
  showContributions?: boolean;
}> = ({ item, percentage, showContributions }) => (
  <View style={styles.legendRow}>
    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
    <View style={styles.legendInfo}>
      <Text style={styles.legendName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.legendPercent}>{percentage.toFixed(1)}%</Text>
      {showContributions && 'memberContributions' in item && (
        <View style={styles.contributionsContainer}>
          {(item as FamilyPortfolioItem).memberContributions.map((c) => (
            <Text key={c.memberId} style={styles.contributionText}>
              {c.memberName}: {formatCurrency(c.assetValue)}
            </Text>
          ))}
        </View>
      )}
    </View>
    <View style={styles.legendValues}>
      <Text style={styles.legendAssetValue}>{formatCurrency(item.assetValue)}</Text>
      <Text style={styles.legendZakat}>Zakat: {formatCurrency(item.zakatAmount)}</Text>
    </View>
  </View>
);

// --- Empty State ---

const EmptyState: React.FC = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconContainer}>
      <Feather name="pie-chart" size={48} color={colors.gray[300]} />
    </View>
    <Text style={styles.emptyTitle}>No Calculations Yet</Text>
    <Text style={styles.emptyDescription}>
      Complete your asset calculators to see your portfolio breakdown here.
    </Text>
  </View>
);

// --- Main Component ---

type PortfolioMode = 'individual' | 'family';

export const PortfolioView: React.FC = () => {
  const calculators = useCalculatorStore((s) => s.calculators);
  const totalZakatDue = useCalculatorStore((s) => s.totalZakatDue);
  const loadAllMembersCalculators = useCalculatorStore((s) => s.loadAllMembersCalculators);

  const members = useFamilyStore((s) => s.members);
  const showFamilyToggle = members.length > 1;

  const [mode, setMode] = useState<PortfolioMode>('individual');
  const [allMembersCalcs, setAllMembersCalcs] = useState<Record<string, Record<string, any>>>({});

  // Load family data when switching to family mode
  useEffect(() => {
    if (mode === 'family') {
      loadAllMembersCalculators().then(setAllMembersCalcs);
    }
  }, [mode, loadAllMembersCalculators]);

  // Individual portfolio
  const individualData = useMemo(() => getPortfolioData(calculators), [calculators]);

  // Family portfolio
  const familyData = useMemo(
    () => (mode === 'family' ? getFamilyPortfolioData(allMembersCalcs, members) : []),
    [mode, allMembersCalcs, members],
  );

  const portfolioData = mode === 'individual' ? individualData : familyData;

  const totalAssets = useMemo(
    () => portfolioData.reduce((sum, item) => sum + item.assetValue, 0),
    [portfolioData],
  );

  const totalZakat = useMemo(
    () =>
      mode === 'individual'
        ? totalZakatDue
        : portfolioData.reduce((sum, item) => sum + item.zakatAmount, 0),
    [mode, totalZakatDue, portfolioData],
  );

  if (portfolioData.length === 0 && mode === 'individual') {
    return (
      <View>
        {showFamilyToggle && (
          <TogglePill mode={mode} onToggle={setMode} />
        )}
        <EmptyState />
      </View>
    );
  }

  if (portfolioData.length === 0 && mode === 'family') {
    return (
      <View>
        <TogglePill mode={mode} onToggle={setMode} />
        <EmptyState />
      </View>
    );
  }

  const chartData = portfolioData.map((item) => ({
    label: item.name,
    value: item.assetValue,
    color: item.color,
  }));

  return (
    <View>
      {/* Family Toggle */}
      {showFamilyToggle && (
        <TogglePill mode={mode} onToggle={setMode} />
      )}

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Feather name="briefcase" size={20} color={colors.primary[500]} />
          <Text style={styles.summaryLabel}>
            {mode === 'family' ? 'Family Assets' : 'Total Assets'}
          </Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalAssets)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Feather name="heart" size={20} color={colors.emerald[500]} />
          <Text style={styles.summaryLabel}>
            {mode === 'family' ? 'Family Zakat' : 'Total Zakat Due'}
          </Text>
          <Text style={[styles.summaryValue, { color: colors.emerald[700] }]}>
            {formatCurrency(totalZakat)}
          </Text>
        </View>
      </View>

      {/* Donut Chart */}
      <Card variant="elevated" style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          {mode === 'family' ? 'Family Asset Distribution' : 'Asset Distribution'}
        </Text>
        <DonutChart data={chartData} size={220} centerValue={totalAssets} />
        <Text style={styles.chartSubtitle}>
          {portfolioData.length} asset {portfolioData.length === 1 ? 'category' : 'categories'}
          {mode === 'family' && ` across ${members.length} members`}
        </Text>
      </Card>

      {/* Legend */}
      <Card variant="elevated" style={styles.legendCard}>
        <Text style={styles.legendTitle}>Breakdown</Text>
        {portfolioData.map((item) => (
          <LegendRow
            key={item.type}
            item={item}
            percentage={(item.assetValue / totalAssets) * 100}
            showContributions={mode === 'family'}
          />
        ))}
      </Card>
    </View>
  );
};

// --- Toggle Pill ---

const TogglePill: React.FC<{
  mode: PortfolioMode;
  onToggle: (mode: PortfolioMode) => void;
}> = ({ mode, onToggle }) => (
  <View style={styles.toggleContainer}>
    <TouchableOpacity
      style={[styles.toggleOption, mode === 'individual' && styles.toggleOptionActive]}
      onPress={() => onToggle('individual')}
      activeOpacity={0.7}
    >
      <Feather
        name="user"
        size={14}
        color={mode === 'individual' ? colors.white : colors.gray[500]}
      />
      <Text style={[styles.toggleText, mode === 'individual' && styles.toggleTextActive]}>
        My Portfolio
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.toggleOption, mode === 'family' && styles.toggleOptionActive]}
      onPress={() => onToggle('family')}
      activeOpacity={0.7}
    >
      <Feather
        name="users"
        size={14}
        color={mode === 'family' ? colors.white : colors.gray[500]}
      />
      <Text style={[styles.toggleText, mode === 'family' && styles.toggleTextActive]}>
        Family Portfolio
      </Text>
    </TouchableOpacity>
  </View>
);

// --- Styles ---

const styles = StyleSheet.create({
  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: 3,
    marginBottom: spacing.lg,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
  },
  toggleOptionActive: {
    backgroundColor: colors.primary[700],
  },
  toggleText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray[500],
  },
  toggleTextActive: {
    color: colors.white,
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeights.medium,
  },
  summaryValue: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[700],
  },

  // Chart
  chartCard: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  chartTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  chartSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },

  // Legend
  legendCard: {
    marginBottom: spacing.lg,
  },
  legendTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray[100],
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
    marginTop: 4,
  },
  legendInfo: {
    flex: 1,
  },
  legendName: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  legendPercent: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  legendValues: {
    alignItems: 'flex-end',
  },
  legendAssetValue: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  legendZakat: {
    fontSize: typography.fontSizes.xs,
    color: colors.emerald[600],
    marginTop: 2,
  },

  // Contributions (family mode)
  contributionsContainer: {
    marginTop: spacing.xs,
  },
  contributionText: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[500],
    marginTop: 1,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['5xl'],
    paddingHorizontal: spacing['3xl'],
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['2xl'],
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.fontSizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSizes.base * typography.lineHeights.relaxed,
  },
});
