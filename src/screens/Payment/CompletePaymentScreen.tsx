import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useCalculatorStore } from '../../store/calculatorStore';
import { usePaymentStore, BENEFICIARIES, PROCESSING_FEE_RATE } from '../../store/paymentStore';
import { BeneficiaryAllocation } from '../../types/payment';

const formatCurrency = (value: number) => {
  return `S$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const CompletePaymentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const totalZakatDue = useCalculatorStore((state) => state.totalZakatDue);
  const calculatedCalculators = useCalculatorStore((state) => state.calculatedCalculators);

  const {
    selectedBeneficiaries,
    allocations,
    customAmount,
    addPayment,
    resetPaymentSetup,
  } = usePaymentStore();

  const zakatAmount = totalZakatDue + (Number(customAmount) || 0);
  const processingFee = zakatAmount * PROCESSING_FEE_RATE;
  const totalToPay = zakatAmount + processingFee;

  const distributions: BeneficiaryAllocation[] = useMemo(() => {
    return selectedBeneficiaries.map((benId) => ({
      beneficiaryId: benId,
      percentage: allocations[benId] || 0,
      amount: zakatAmount * ((allocations[benId] || 0) / 100),
    }));
  }, [selectedBeneficiaries, allocations, zakatAmount]);

  const handlePay = async () => {
    try {
      await addPayment({
        zakatAmount,
        customAmount: Number(customAmount) || 0,
        processingFee,
        totalAmount: totalToPay,
        currency: 'SGD',
        calculators: calculatedCalculators,
        distributions,
        paymentMethod: 'paynow',
        status: 'completed',
      });

      resetPaymentSetup();

      Alert.alert(
        'Payment Successful',
        `Your Zakat payment of ${formatCurrency(zakatAmount)} has been processed successfully.`,
        [
          {
            text: 'View History',
            onPress: () => navigation.navigate('PaidZakat'),
          },
          {
            text: 'Back to Dashboard',
            onPress: () => navigation.navigate('Dashboard'),
          },
        ]
      );
    } catch {
      Alert.alert('Payment Failed', 'There was an error processing your payment. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={16} color={colors.primary[600]} />
          <Text style={styles.backText}>Back to Payment Setup</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Complete Payment</Text>
        <Text style={styles.subtitle}>Enter your payment details below</Text>

        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>

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

          <Text style={styles.feeNote}>100% of your zakat goes to beneficiaries</Text>

          <View style={styles.divider} />

          {/* Distribution */}
          <Text style={styles.distributionLabel}>DISTRIBUTION</Text>
          {distributions.map((dist) => {
            const beneficiary = BENEFICIARIES.find((b) => b.id === dist.beneficiaryId);
            if (!beneficiary) return null;
            return (
              <View key={dist.beneficiaryId} style={styles.distributionRow}>
                <View style={[styles.avatarSmall, { backgroundColor: beneficiary.color }]}>
                  <Text style={styles.avatarSmallText}>{beneficiary.initials}</Text>
                </View>
                <Text style={styles.distributionName}>{beneficiary.name}</Text>
                <Text style={styles.distributionAmount}>{formatCurrency(dist.amount)}</Text>
              </View>
            );
          })}
        </View>

        {/* PayNow Payment Info */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentTitle}>Zakat Payment</Text>
          <Text style={styles.paymentAmount}>SGD {totalToPay.toFixed(2)}</Text>
          <Text style={styles.paymentSplit}>Split among {distributions.length} beneficiar{distributions.length === 1 ? 'y' : 'ies'}</Text>
        </View>

        <View style={styles.paymentMethodCard}>
          <Text style={styles.methodTitle}>Payment method</Text>

          <View style={styles.paynowCard}>
            <Text style={styles.paynowBrand}>PAYN<Text style={styles.paynowO}>O</Text>W</Text>
            <Text style={styles.paynowDescription}>PayNow is supported by bank apps and payment apps such as DBS, POSB, OCBC and UOB</Text>
            <View style={styles.paynowDivider} />
            <View style={styles.paynowInfoRow}>
              <Feather name="smartphone" size={20} color={colors.gray[500]} />
              <Text style={styles.paynowInfoText}>You will be shown a QR code to scan using your preferred banking or payment app</Text>
            </View>
          </View>
        </View>

        <Button
          title="Pay"
          onPress={handlePay}
          style={styles.payButton}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  backText: { fontSize: typography.fontSizes.sm, color: colors.primary[600], fontWeight: typography.fontWeights.medium },
  title: { fontSize: typography.fontSizes['2xl'], fontWeight: typography.fontWeights.bold, color: colors.primary[700], marginBottom: spacing.xs },
  subtitle: { fontSize: typography.fontSizes.base, color: colors.gray[600], marginBottom: spacing.xl },

  // Summary Card
  summaryCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.gray[200], borderLeftWidth: 4, borderLeftColor: colors.primary[500], marginBottom: spacing.xl },
  summaryTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.gray[900], marginBottom: spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  summaryLabel: { fontSize: typography.fontSizes.base, color: colors.gray[700] },
  summaryValue: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.gray[900] },
  summaryLabelLight: { fontSize: typography.fontSizes.sm, color: colors.gray[500] },
  divider: { height: 1, backgroundColor: colors.gray[200], marginVertical: spacing.lg },
  totalLabel: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.gray[900] },
  totalValue: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.primary[700] },
  beneficiaryLabel: { fontSize: typography.fontSizes.sm, color: colors.gray[600] },
  beneficiaryValue: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, color: colors.emerald[600] },
  feeNote: { fontSize: typography.fontSizes.xs, color: colors.gray[500], marginTop: spacing.xs },

  // Distribution
  distributionLabel: { fontSize: typography.fontSizes.xs, fontWeight: typography.fontWeights.bold, color: colors.gray[500], letterSpacing: 1, marginBottom: spacing.md },
  distributionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  avatarSmall: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  avatarSmallText: { fontSize: 10, fontWeight: typography.fontWeights.bold, color: colors.white },
  distributionName: { flex: 1, fontSize: typography.fontSizes.sm, color: colors.gray[700] },
  distributionAmount: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, color: colors.gray[900] },

  // Payment Card
  paymentCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.xl, borderWidth: 1, borderColor: colors.gray[200], alignItems: 'center', marginBottom: spacing.lg },
  paymentTitle: { fontSize: typography.fontSizes.sm, color: colors.gray[500], marginBottom: spacing.xs },
  paymentAmount: { fontSize: typography.fontSizes['3xl'], fontWeight: typography.fontWeights.bold, color: colors.gray[900], marginBottom: spacing.xs },
  paymentSplit: { fontSize: typography.fontSizes.sm, color: colors.gray[500] },

  // Payment Method
  paymentMethodCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.gray[200], marginBottom: spacing.xl },
  methodTitle: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.gray[900], marginBottom: spacing.md },
  paynowCard: { borderWidth: 1, borderColor: colors.gray[200], borderRadius: borderRadius.lg, padding: spacing.lg },
  paynowBrand: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: '#6B21A8', marginBottom: spacing.sm },
  paynowO: { color: '#E11D48' },
  paynowDescription: { fontSize: typography.fontSizes.sm, color: colors.gray[600], lineHeight: 20, marginBottom: spacing.md },
  paynowDivider: { height: 1, backgroundColor: colors.gray[200], marginBottom: spacing.md },
  paynowInfoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  paynowInfoText: { flex: 1, fontSize: typography.fontSizes.sm, color: colors.gray[600], lineHeight: 20 },

  payButton: { backgroundColor: '#3B82F6' },
  bottomSpacer: { height: spacing['4xl'] },
});

export default CompletePaymentScreen;
