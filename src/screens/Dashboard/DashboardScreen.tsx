import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Header } from '../../components/common/Header';
import { AssetCard } from '../../components/dashboard/AssetCard';
import { PaymentSummary } from '../../components/dashboard/PaymentSummary';
import { NisabDisplay } from '../../components/dashboard/NisabDisplay';
import { PortfolioView } from '../../components/dashboard/PortfolioView';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { CALCULATORS } from '../../constants/calculators';
import { useCalculatorStore } from '../../store/calculatorStore';
import { useFamilyStore } from '../../store/familyStore';
import { Feather } from '@expo/vector-icons';

type Tab = 'calculators' | 'portfolio';

const DashboardScreen: React.FC = () => {
  const resetAll = useCalculatorStore((state) => state.resetAll);
  const members = useFamilyStore((s) => s.members);
  const currentMemberId = useFamilyStore((s) => s.currentMemberId);
  const currentMember = members.find((m) => m.id === currentMemberId);
  const [activeTab, setActiveTab] = useState<Tab>('calculators');

  const handleResetAll = () => {
    resetAll();
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.title}>
            {currentMember && currentMember.relationship !== 'self'
              ? `${currentMember.name}'s Zakat across 16 asset categories`
              : 'Pay your Zakat across 16 asset categories'}
          </Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetAll}
          >
            <Feather name="rotate-ccw" size={16} color={colors.red[600]} />
            <Text style={styles.resetButtonText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'calculators' && styles.tabActive]}
            onPress={() => setActiveTab('calculators')}
            activeOpacity={0.7}
          >
            <Feather
              name="grid"
              size={16}
              color={activeTab === 'calculators' ? colors.white : colors.gray[500]}
            />
            <Text style={[styles.tabText, activeTab === 'calculators' && styles.tabTextActive]}>
              Calculators
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'portfolio' && styles.tabActive]}
            onPress={() => setActiveTab('portfolio')}
            activeOpacity={0.7}
          >
            <Feather
              name="pie-chart"
              size={16}
              color={activeTab === 'portfolio' ? colors.white : colors.gray[500]}
            />
            <Text style={[styles.tabText, activeTab === 'portfolio' && styles.tabTextActive]}>
              Portfolio
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'calculators' ? (
          <>
            {/* Payment Summary */}
            <PaymentSummary />

            {/* Nisab Display */}
            <NisabDisplay />

            {/* Section Title */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Text style={styles.sectionTitleBold}>Select</Text> assets you own,{' '}
                <Text style={styles.sectionTitleBold}>calculate</Text>, and{' '}
                <Text style={styles.sectionTitleBold}>pay</Text> your selected ones
              </Text>
            </View>

            {/* Calculator Cards Grid */}
            <View style={styles.grid}>
              {CALCULATORS.map((calculator) => (
                <View key={calculator.id} style={styles.gridItem}>
                  <AssetCard
                    id={calculator.id}
                    name={calculator.name}
                    icon={calculator.icon}
                    description={calculator.description}
                    route={calculator.route}
                  />
                </View>
              ))}
            </View>
          </>
        ) : (
          <PortfolioView />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  title: {
    flex: 1,
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[500],
    marginRight: spacing.md,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.red[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.red[200],
  },
  resetButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.red[600],
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: colors.primary[700],
  },
  tabText: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray[500],
  },
  tabTextActive: {
    color: colors.white,
  },

  // Calculators tab
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    color: colors.gray[600],
  },
  sectionTitleBold: {
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[600],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: spacing.xs,
  },
});

export default DashboardScreen;
