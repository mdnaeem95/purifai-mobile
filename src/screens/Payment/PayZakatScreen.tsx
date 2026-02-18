import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useCalculatorStore } from '../../store/calculatorStore';
import { usePaymentStore, BENEFICIARIES, PROCESSING_FEE_RATE } from '../../store/paymentStore';
import { CALCULATORS } from '../../constants/calculators';

const formatCurrency = (value: number) => {
  return `S$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const ALLOCATION_PRESETS = [25, 50, 75, 100];

const PayZakatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const calculators = useCalculatorStore((state) => state.calculators);
  const totalZakatDue = useCalculatorStore((state) => state.totalZakatDue);

  const {
    selectedBeneficiaries,
    allocations,
    customAmount,
    toggleBeneficiary,
    setAllocation,
    setCustomAmount,
  } = usePaymentStore();

  // Get calculated calculators with their amounts
  const calculatedItems = useMemo(() => {
    const items: Array<{ id: string; name: string; amount: number }> = [];
    Object.entries(calculators).forEach(([key, data]) => {
      if (data && data.calculated && data.zakatAmount > 0) {
        const meta = CALCULATORS.find((c) => c.id === key);
        items.push({ id: key, name: meta?.name || key, amount: data.zakatAmount });
      }
    });
    return items;
  }, [calculators]);

  const zakatAmount = totalZakatDue + (Number(customAmount) || 0);
  const processingFee = zakatAmount * PROCESSING_FEE_RATE;
  const totalToPay = zakatAmount + processingFee;

  const totalAllocation = useMemo(() => {
    return Object.values(allocations).reduce((sum, pct) => sum + pct, 0);
  }, [allocations]);

  const canProceed = selectedBeneficiaries.length > 0 && totalAllocation === 100 && zakatAmount > 0;

  const handleProceed = () => {
    navigation.navigate('CompletePayment');
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Pay Your Zakat</Text>
        <Text style={styles.subtitle}>Distribute your Zakat to beneficiaries of your choice</Text>

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>PAYMENT SUMMARY</Text>

          {calculatedItems.map((item) => (
            <View key={item.id} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{item.name}</Text>
              <Text style={styles.summaryValue}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}

          {calculatedItems.length === 0 && (
            <Text style={styles.emptyText}>No calculators completed yet. Go to Dashboard to calculate your Zakat.</Text>
          )}

          <View style={styles.divider} />

          {/* Custom Amount */}
          <Text style={styles.fieldLabel}>Custom Zakat Amount</Text>
          <View style={styles.customAmountRow}>
            <Text style={styles.currencyPrefix}>S$</Text>
            <TextInput
              style={styles.customAmountInput}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={customAmount > 0 ? customAmount.toString() : ''}
              onChangeText={(text) => setCustomAmount(parseFloat(text) || 0)}
              placeholderTextColor={colors.gray[400]}
            />
          </View>
          <Text style={styles.helperText}>Enter additional amount or leave empty</Text>

          <View style={styles.divider} />

          {/* Totals */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Zakat Amount</Text>
            <Text style={styles.summaryValue}>{formatCurrency(zakatAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabelLight}>Processing Fee (2.39%)</Text>
            <Text style={styles.summaryLabelLight}>+{formatCurrency(processingFee)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>You Pay</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalToPay)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.beneficiaryLabel}>To Beneficiaries</Text>
            <Text style={styles.beneficiaryValue}>{formatCurrency(zakatAmount)}</Text>
          </View>
          <Text style={styles.feeNote}>100% of your zakat goes to beneficiaries. Fees are added on top.</Text>
        </View>

        {/* Select Beneficiaries */}
        <Text style={styles.sectionTitle}>Select Beneficiaries</Text>
        <Text style={styles.sectionSubtitle}>Choose recipients and set allocation percentages</Text>

        <View style={styles.beneficiaryGrid}>
          {BENEFICIARIES.map((beneficiary) => {
            const isSelected = selectedBeneficiaries.includes(beneficiary.id);
            return (
              <TouchableOpacity
                key={beneficiary.id}
                style={[styles.beneficiaryCard, isSelected && styles.beneficiaryCardSelected]}
                onPress={() => toggleBeneficiary(beneficiary.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.avatar, { backgroundColor: beneficiary.color }]}>
                  <Text style={styles.avatarText}>{beneficiary.initials}</Text>
                </View>
                <Text style={styles.beneficiaryName}>{beneficiary.name}</Text>
                {isSelected && (
                  <Text style={styles.beneficiaryAmount}>{formatCurrency(zakatAmount * (allocations[beneficiary.id] || 0) / 100)}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Allocation Controls for Selected */}
        {selectedBeneficiaries.map((benId) => {
          const beneficiary = BENEFICIARIES.find((b) => b.id === benId);
          if (!beneficiary) return null;
          const pct = allocations[benId] || 0;

          return (
            <View key={benId} style={styles.allocationCard}>
              <View style={styles.allocationHeader}>
                <View style={[styles.avatarSmall, { backgroundColor: beneficiary.color }]}>
                  <Text style={styles.avatarSmallText}>{beneficiary.initials}</Text>
                </View>
                <Text style={styles.allocationName}>{beneficiary.name}</Text>
              </View>

              <View style={styles.allocationRow}>
                <Text style={styles.allocationLabel}>Allocation</Text>
                <View style={styles.allocationInputRow}>
                  <TextInput
                    style={styles.allocationInput}
                    keyboardType="number-pad"
                    value={pct.toString()}
                    onChangeText={(text) => setAllocation(benId, parseInt(text) || 0)}
                  />
                  <Text style={styles.allocationPercent}>%</Text>
                </View>
              </View>

              <View style={styles.presetRow}>
                {ALLOCATION_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[styles.presetButton, pct === preset && { backgroundColor: beneficiary.color }]}
                    onPress={() => setAllocation(benId, preset)}
                  >
                    <Text style={[styles.presetText, pct === preset && styles.presetTextActive]}>{preset}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        {/* Total Allocation Bar */}
        {selectedBeneficiaries.length > 0 && (
          <View style={styles.totalAllocationCard}>
            <View style={styles.totalAllocationHeader}>
              <Text style={styles.totalAllocationLabel}>TOTAL ALLOCATION</Text>
              <View style={[styles.totalAllocationBadge, totalAllocation === 100 && styles.totalAllocationBadgeComplete]}>
                <Text style={[styles.totalAllocationBadgeText, totalAllocation === 100 && styles.totalAllocationBadgeTextComplete]}>{totalAllocation}%</Text>
              </View>
            </View>

            <View style={styles.allocationBarBg}>
              <View style={[styles.allocationBarFill, { width: `${Math.min(totalAllocation, 100)}%` }, totalAllocation === 100 && styles.allocationBarComplete]} />
            </View>

            {selectedBeneficiaries.map((benId) => {
              const beneficiary = BENEFICIARIES.find((b) => b.id === benId);
              if (!beneficiary || !allocations[benId]) return null;
              return (
                <View key={benId} style={styles.allocationDistRow}>
                  <View style={[styles.dotIndicator, { backgroundColor: beneficiary.color }]} />
                  <Text style={styles.allocationDistName}>{beneficiary.name}</Text>
                  <Text style={[styles.allocationDistPct, { color: beneficiary.color }]}>{allocations[benId]}%</Text>
                </View>
              );
            })}
          </View>
        )}

        {totalAllocation !== 100 && selectedBeneficiaries.length > 0 && (
          <Text style={styles.warningText}>Total allocation must equal 100% to proceed.</Text>
        )}

        <Text style={styles.refundNote}>Only the zakat amount is refundable. Processing fees are non-refundable.</Text>

        <Button
          title="Proceed to Payment"
          onPress={handleProceed}
          disabled={!canProceed}
          icon={<Feather name="arrow-right" size={16} color={colors.white} />}
          style={styles.proceedButton}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg },
  title: { fontSize: typography.fontSizes['2xl'], fontWeight: typography.fontWeights.bold, color: colors.primary[700], marginBottom: spacing.xs },
  subtitle: { fontSize: typography.fontSizes.base, color: colors.gray[600], marginBottom: spacing.xl },

  // Card
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.xl },
  cardLabel: { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.bold, color: colors.gray[500], letterSpacing: 1, marginBottom: spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  summaryLabel: { fontSize: typography.fontSizes.base, color: colors.gray[700] },
  summaryValue: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.gray[900] },
  summaryLabelLight: { fontSize: typography.fontSizes.sm, color: colors.gray[500] },
  divider: { height: 1, backgroundColor: colors.gray[200], marginVertical: spacing.lg },
  emptyText: { fontSize: typography.fontSizes.sm, color: colors.gray[500], fontStyle: 'italic' },

  // Custom Amount
  fieldLabel: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, color: colors.gray[700], marginBottom: spacing.sm },
  customAmountRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.gray[300], borderRadius: borderRadius.md, paddingHorizontal: spacing.md },
  currencyPrefix: { fontSize: typography.fontSizes.base, color: colors.gray[500], marginRight: spacing.xs },
  customAmountInput: { flex: 1, fontSize: typography.fontSizes.base, color: colors.gray[900], paddingVertical: spacing.md },
  helperText: { fontSize: typography.fontSizes.xs, color: colors.gray[500], marginTop: spacing.xs },

  // Totals
  totalLabel: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.gray[900] },
  totalValue: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.primary[700] },
  beneficiaryLabel: { fontSize: typography.fontSizes.sm, color: colors.gray[600] },
  beneficiaryValue: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, color: colors.emerald[600] },
  feeNote: { fontSize: typography.fontSizes.xs, color: colors.gray[500], marginTop: spacing.sm },

  // Beneficiaries Section
  sectionTitle: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: colors.gray[900], marginBottom: spacing.xs },
  sectionSubtitle: { fontSize: typography.fontSizes.sm, color: colors.gray[600], marginBottom: spacing.lg },
  beneficiaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg },
  beneficiaryCard: { width: '47%', backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.gray[200], alignItems: 'center' },
  beneficiaryCardSelected: { borderColor: colors.primary[400], borderWidth: 2, backgroundColor: colors.primary[50] },
  avatar: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.bold, color: colors.white },
  beneficiaryName: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.gray[900], textAlign: 'center' },
  beneficiaryAmount: { fontSize: typography.fontSizes.xs, color: colors.emerald[600], marginTop: 4 },

  // Allocation
  allocationCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.md },
  allocationHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  avatarSmall: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  avatarSmallText: { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.bold, color: colors.white },
  allocationName: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.gray[900], flex: 1 },
  allocationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  allocationLabel: { fontSize: typography.fontSizes.sm, color: colors.gray[600] },
  allocationInputRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  allocationInput: { width: 56, textAlign: 'center', fontSize: typography.fontSizes.base, borderWidth: 1, borderColor: colors.gray[300], borderRadius: borderRadius.md, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  allocationPercent: { fontSize: typography.fontSizes.sm, color: colors.gray[500] },
  presetRow: { flexDirection: 'row', gap: spacing.sm },
  presetButton: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.gray[300], alignItems: 'center' },
  presetText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.gray[700] },
  presetTextActive: { color: colors.white },

  // Total Allocation
  totalAllocationCard: { backgroundColor: colors.gray[50], borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  totalAllocationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  totalAllocationLabel: { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.bold, color: colors.gray[500], letterSpacing: 1 },
  totalAllocationBadge: { backgroundColor: colors.gray[200], paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  totalAllocationBadgeComplete: { backgroundColor: colors.emerald[100] },
  totalAllocationBadgeText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, color: colors.gray[700] },
  totalAllocationBadgeTextComplete: { color: colors.emerald[800] },
  allocationBarBg: { height: 8, backgroundColor: colors.gray[200], borderRadius: 4, marginBottom: spacing.md, overflow: 'hidden' },
  allocationBarFill: { height: 8, backgroundColor: colors.primary[500], borderRadius: 4 },
  allocationBarComplete: { backgroundColor: colors.emerald[500] },
  allocationDistRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  dotIndicator: { width: 8, height: 8, borderRadius: 4 },
  allocationDistName: { flex: 1, fontSize: typography.fontSizes.sm, color: colors.gray[700] },
  allocationDistPct: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold },

  warningText: { fontSize: typography.fontSizes.sm, color: colors.red[600], marginBottom: spacing.md },
  refundNote: { fontSize: typography.fontSizes.sm, color: colors.gray[500], textAlign: 'center', marginBottom: spacing.lg },
  proceedButton: { marginBottom: spacing.md },
  bottomSpacer: { height: spacing['4xl'] },
});

export default PayZakatScreen;
