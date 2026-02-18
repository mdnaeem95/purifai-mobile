import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { colors, spacing, typography } from '../../constants/theme';
import { useCalculatorStore } from '../../store/calculatorStore';
import { formatCurrency } from '../../utils/formatters';

export const PaymentSummary: React.FC = () => {
  const selectedCalculators = useCalculatorStore((state) => state.selectedCalculators);
  const calculatedCalculators = useCalculatorStore((state) => state.calculatedCalculators);
  const totalZakatDue = useCalculatorStore((state) => state.totalZakatDue);

  const handlePayNow = () => {
    // TODO: Navigate to payment screen
    console.log('Pay Now pressed');
  };

  return (
    <Card variant="elevated" style={styles.container}>
      <Text style={styles.title}>Pay your zakat after calculations</Text>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {/* Selected */}
        <View style={styles.statBox}>
          <View style={styles.statIcon}>
            <Feather name="list" size={24} color={colors.primary[500]} />
          </View>
          <View style={styles.statText}>
            <Text style={styles.statLabel}>Selected:</Text>
            <Text style={styles.statValue}>{selectedCalculators.length}/16</Text>
          </View>
        </View>

        {/* Calculated */}
        <View style={styles.statBox}>
          <View style={styles.statIcon}>
            <Feather name="check-circle" size={24} color={colors.emerald[500]} />
          </View>
          <View style={styles.statText}>
            <Text style={styles.statLabel}>Calculated:</Text>
            <Text style={styles.statValue}>{calculatedCalculators.length}/16</Text>
          </View>
        </View>
      </View>

      {/* Payment Row */}
      <View style={styles.paymentRow}>
        <View style={styles.paymentInfo}>
          <View style={styles.paymentColumn}>
            <Text style={styles.paymentLabel}>Total Zakat Due</Text>
            <Text style={styles.paymentAmount}>
              {formatCurrency(totalZakatDue)}
            </Text>
          </View>

          <View style={[styles.paymentColumn, styles.paymentColumnBordered]}>
            <Text style={styles.paymentLabel}>To Pay</Text>
            <Text style={styles.paymentAmountPrimary}>
              {formatCurrency(totalZakatDue)}
            </Text>
          </View>
        </View>

        <Button
          title="Pay Now"
          onPress={handlePayNow}
          disabled={totalZakatDue === 0}
          icon={<Feather name="arrow-right" size={16} color={colors.white} />}
          style={styles.payButton}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    color: colors.gray[600],
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  statIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    flex: 1,
  },
  statLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[500],
  },
  statValue: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary[700],
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  paymentInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.lg,
  },
  paymentColumn: {
    flex: 1,
  },
  paymentColumnBordered: {
    paddingLeft: spacing.lg,
    borderLeftWidth: 1,
    borderLeftColor: colors.gray[200],
  },
  paymentLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  paymentAmount: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray[700],
  },
  paymentAmountPrimary: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[700],
  },
  payButton: {
    minWidth: 120,
  },
});

// Add missing import
import { borderRadius } from '../../constants/theme';
