import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { usePaymentStore, BENEFICIARIES } from '../../store/paymentStore';

const formatCurrency = (value: number) => {
  return `S$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
};

const PaidZakatScreen: React.FC = () => {
  const { payments, totalPaid, loadPayments } = usePaymentStore();

  useEffect(() => {
    loadPayments();
  }, []);

  const completedPayments = payments.filter((p) => p.status === 'completed');

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Paid Zakat</Text>
        <Text style={styles.subtitle}>Your payment history</Text>

        {/* Total Paid Summary */}
        <View style={styles.totalCard}>
          <Feather name="check-circle" size={24} color={colors.emerald[600]} />
          <View style={styles.totalTextContainer}>
            <Text style={styles.totalLabel}>Total Zakat Paid</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalPaid)}</Text>
          </View>
        </View>

        {/* Payment History */}
        {completedPayments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="inbox" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No payments yet</Text>
            <Text style={styles.emptyText}>Your completed Zakat payments will appear here.</Text>
          </View>
        ) : (
          completedPayments.map((payment) => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <View style={styles.statusBadge}>
                  <Feather name="check" size={12} color={colors.emerald[800]} />
                  <Text style={styles.statusText}>Completed</Text>
                </View>
                <Text style={styles.paymentDate}>{formatDate(payment.completedAt || payment.createdAt)}</Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Zakat Amount</Text>
                <Text style={styles.paymentValue}>{formatCurrency(payment.zakatAmount)}</Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabelLight}>Processing Fee</Text>
                <Text style={styles.paymentLabelLight}>+{formatCurrency(payment.processingFee)}</Text>
              </View>

              <View style={styles.paymentRow}>
                <Text style={styles.paymentTotalLabel}>Total Paid</Text>
                <Text style={styles.paymentTotalValue}>{formatCurrency(payment.totalAmount)}</Text>
              </View>

              {payment.distributions.length > 0 && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.distLabel}>DISTRIBUTION</Text>
                  {payment.distributions.map((dist) => {
                    const beneficiary = BENEFICIARIES.find((b) => b.id === dist.beneficiaryId);
                    if (!beneficiary) return null;
                    return (
                      <View key={dist.beneficiaryId} style={styles.distRow}>
                        <View style={[styles.dot, { backgroundColor: beneficiary.color }]} />
                        <Text style={styles.distName}>{beneficiary.name}</Text>
                        <Text style={styles.distAmount}>{formatCurrency(dist.amount)}</Text>
                      </View>
                    );
                  })}
                </>
              )}
            </View>
          ))
        )}

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

  totalCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.emerald[50], borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.emerald[200] },
  totalTextContainer: { flex: 1 },
  totalLabel: { fontSize: typography.fontSizes.sm, color: colors.emerald[800] },
  totalAmount: { fontSize: typography.fontSizes['2xl'], fontWeight: typography.fontWeights.bold, color: colors.emerald[800] },

  emptyCard: { alignItems: 'center', paddingVertical: spacing['4xl'], backgroundColor: colors.white, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.gray[200] },
  emptyTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.semibold, color: colors.gray[700], marginTop: spacing.md },
  emptyText: { fontSize: typography.fontSizes.sm, color: colors.gray[500], marginTop: spacing.xs },

  paymentCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.md },
  paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.emerald[50], paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  statusText: { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.medium, color: colors.emerald[800] },
  paymentDate: { fontSize: typography.fontSizes.sm, color: colors.gray[500] },

  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  paymentLabel: { fontSize: typography.fontSizes.sm, color: colors.gray[700] },
  paymentValue: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, color: colors.gray[900] },
  paymentLabelLight: { fontSize: typography.fontSizes.xs, color: colors.gray[500] },
  paymentTotalLabel: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.bold, color: colors.gray[900], marginTop: spacing.xs },
  paymentTotalValue: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.bold, color: colors.primary[700], marginTop: spacing.xs },

  divider: { height: 1, backgroundColor: colors.gray[200], marginVertical: spacing.md },
  distLabel: { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.bold, color: colors.gray[500], letterSpacing: 1, marginBottom: spacing.sm },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: 4 },
  distName: { flex: 1, fontSize: typography.fontSizes.sm, color: colors.gray[700] },
  distAmount: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, color: colors.gray[900] },

  bottomSpacer: { height: spacing['4xl'] },
});

export default PaidZakatScreen;
