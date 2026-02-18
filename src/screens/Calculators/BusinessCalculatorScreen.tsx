import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { CalculatorLayout } from '../../components/calculator/CalculatorLayout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useCalculatorStore } from '../../store/calculatorStore';
import { useNisabStore } from '../../store/nisabStore';
import { BusinessData } from '../../types/calculator';

type FormData = {
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
};

const defaultValues: FormData = {
  bankBalance: 0,
  cashInHand: 0,
  fixedDeposit: 0,
  prepaidExpenses: 0,
  closingStocks: 0,
  tradeStocks: 0,
  tradeDebtors: 0,
  loanReceivable: 0,
  staffWelfareFund: 0,
  staffLoan: 0,
  otherDeposits: 0,
  bankInterestReceived: 0,
  latePaymentInterest: 0,
  utilitiesDeposit: 0,
  badDebts: 0,
  obsoleteStocks: 0,
  donationsLastQuarter: 0,
  fixedAssetsPurchased: 0,
  personalDrawings: 0,
  tradeCreditors: 0,
  financialLoans: 0,
  accruedExpenses: 0,
  incomeTaxProvision: 0,
  overdraft: 0,
  directorsFees: 0,
  muslimOwnershipPercentage: 100,
};

const NumberField: React.FC<{
  control: any;
  name: string;
  label: string;
  helperText?: string;
  style?: any;
}> = ({ control, name, label, helperText, style }) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { onChange, value } }) => (
      <Input
        label={label}
        placeholder="0"
        keyboardType="decimal-pad"
        value={value?.toString()}
        onChangeText={(text) => onChange(parseFloat(text) || 0)}
        helperText={helperText}
        style={style}
      />
    )}
  />
);

const BusinessCalculatorScreen: React.FC = () => {
  const setCalculatorData = useCalculatorStore((state) => state.setCalculatorData);
  const markAsCalculated = useCalculatorStore((state) => state.markAsCalculated);
  const existingData = useCalculatorStore((state) => state.calculators.business);
  const nisabMonetary = useNisabStore((state) => state.monetary);

  const { control, watch, handleSubmit } = useForm<FormData>({
    defaultValues: existingData
      ? {
          bankBalance: existingData.bankBalance,
          cashInHand: existingData.cashInHand,
          fixedDeposit: existingData.fixedDeposit,
          prepaidExpenses: existingData.prepaidExpenses,
          closingStocks: existingData.closingStocks,
          tradeStocks: existingData.tradeStocks,
          tradeDebtors: existingData.tradeDebtors,
          loanReceivable: existingData.loanReceivable,
          staffWelfareFund: existingData.staffWelfareFund,
          staffLoan: existingData.staffLoan,
          otherDeposits: existingData.otherDeposits,
          bankInterestReceived: existingData.bankInterestReceived,
          latePaymentInterest: existingData.latePaymentInterest,
          utilitiesDeposit: existingData.utilitiesDeposit,
          badDebts: existingData.badDebts,
          obsoleteStocks: existingData.obsoleteStocks,
          donationsLastQuarter: existingData.donationsLastQuarter,
          fixedAssetsPurchased: existingData.fixedAssetsPurchased,
          personalDrawings: existingData.personalDrawings,
          tradeCreditors: existingData.tradeCreditors,
          financialLoans: existingData.financialLoans,
          accruedExpenses: existingData.accruedExpenses,
          incomeTaxProvision: existingData.incomeTaxProvision,
          overdraft: existingData.overdraft,
          directorsFees: existingData.directorsFees,
          muslimOwnershipPercentage: existingData.muslimOwnershipPercentage,
        }
      : defaultValues,
  });

  const allValues = watch();

  const calculationSummary = useMemo(() => {
    const v = allValues;

    // Current Assets total
    const currentAssets =
      (Number(v.bankBalance) || 0) +
      (Number(v.cashInHand) || 0) +
      (Number(v.fixedDeposit) || 0) +
      (Number(v.prepaidExpenses) || 0) +
      (Number(v.closingStocks) || 0) +
      (Number(v.tradeStocks) || 0) +
      (Number(v.tradeDebtors) || 0) +
      (Number(v.loanReceivable) || 0) +
      (Number(v.staffWelfareFund) || 0) +
      (Number(v.staffLoan) || 0) +
      (Number(v.otherDeposits) || 0);

    // Adjustments to Remove
    const adjustmentsRemove =
      (Number(v.bankInterestReceived) || 0) +
      (Number(v.latePaymentInterest) || 0) +
      (Number(v.utilitiesDeposit) || 0) +
      (Number(v.badDebts) || 0) +
      (Number(v.obsoleteStocks) || 0);

    // Adjustments to Add
    const adjustmentsAdd =
      (Number(v.donationsLastQuarter) || 0) +
      (Number(v.fixedAssetsPurchased) || 0) +
      (Number(v.personalDrawings) || 0);

    // Current Liabilities total
    const currentLiabilities =
      (Number(v.tradeCreditors) || 0) +
      (Number(v.financialLoans) || 0) +
      (Number(v.accruedExpenses) || 0) +
      (Number(v.incomeTaxProvision) || 0) +
      (Number(v.overdraft) || 0) +
      (Number(v.directorsFees) || 0);

    const ownershipPct = Math.min(Math.max(Number(v.muslimOwnershipPercentage) || 0, 0), 100) / 100;

    const netZakatable = (currentAssets - adjustmentsRemove + adjustmentsAdd - currentLiabilities) * ownershipPct;
    const totalAssets = Math.max(netZakatable, 0);
    const isAboveNisab = totalAssets >= nisabMonetary;
    const zakatDue = isAboveNisab ? totalAssets * 0.025 : 0;

    return { totalAssets, totalDebts: currentLiabilities, netAssets: totalAssets, zakatDue, isAboveNisab };
  }, [allValues, nisabMonetary]);

  const onSave = (data: FormData) => {
    const businessData: BusinessData = {
      ...data,
      calculated: true,
      zakatAmount: calculationSummary.zakatDue,
    };
    setCalculatorData('business', businessData);
    markAsCalculated('business');
  };

  const importantNotes = [
    'Based on AAOIFI Financial Accounting Standard 9.',
    'Only Muslim ownership share is zakatable.',
    'Current assets minus current liabilities.',
    'Adjustments for non-halal income.',
  ];

  return (
    <CalculatorLayout title="Business Zakat" calculationSummary={calculationSummary} importantNotes={importantNotes}>
      {/* Current Assets */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Current Assets</Text>

        <View style={styles.detailsCard}>
          <View style={styles.row}>
            <View style={styles.column}>
              <NumberField control={control} name="bankBalance" label="Bank Balance" helperText="Current account and savings balance" style={styles.input} />
            </View>
            <View style={styles.column}>
              <NumberField control={control} name="cashInHand" label="Cash in Hand" helperText="Physical cash holdings" style={styles.input} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <NumberField control={control} name="fixedDeposit" label="Fixed Deposit" helperText="Fixed deposit accounts" style={styles.input} />
            </View>
            <View style={styles.column}>
              <NumberField control={control} name="prepaidExpenses" label="Prepaid Expenses" helperText="Expenses paid in advance" style={styles.input} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <NumberField control={control} name="closingStocks" label="Closing Stocks" helperText="Inventory at period end" style={styles.input} />
            </View>
            <View style={styles.column}>
              <NumberField control={control} name="tradeStocks" label="Trade Stocks" helperText="Trading inventory" style={styles.input} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <NumberField control={control} name="tradeDebtors" label="Trade Debtors" helperText="Amounts owed by customers" style={styles.input} />
            </View>
            <View style={styles.column}>
              <NumberField control={control} name="loanReceivable" label="Loan Receivable" helperText="Loans given to others" style={styles.input} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <NumberField control={control} name="staffWelfareFund" label="Staff Welfare Fund" helperText="Employee welfare contributions" style={styles.input} />
            </View>
            <View style={styles.column}>
              <NumberField control={control} name="staffLoan" label="Staff Loan" helperText="Loans given to staff" style={styles.input} />
            </View>
          </View>

          <NumberField control={control} name="otherDeposits" label="Other Deposits" helperText="Other deposit amounts" />
        </View>
      </View>

      {/* Adjustments to Remove */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitleRemove}>Adjustments to Remove</Text>

        <View style={styles.detailsCard}>
          <View style={styles.row}>
            <View style={styles.column}>
              <NumberField control={control} name="bankInterestReceived" label="Bank Interest Received" helperText="Interest income (non-halal)" style={styles.input} />
            </View>
            <View style={styles.column}>
              <NumberField control={control} name="latePaymentInterest" label="Late Payment Interest" helperText="Interest from late payments" style={styles.input} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <NumberField control={control} name="utilitiesDeposit" label="Utilities Deposit" helperText="Deposits for utilities" style={styles.input} />
            </View>
            <View style={styles.column}>
              <NumberField control={control} name="badDebts" label="Bad Debts" helperText="Uncollectable debts" style={styles.input} />
            </View>
          </View>

          <NumberField control={control} name="obsoleteStocks" label="Obsolete Stocks" helperText="Unsellable inventory" />
        </View>
      </View>

      {/* Adjustments to Add */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitleAdd}>Adjustments to Add</Text>

        <View style={styles.detailsCard}>
          <View style={styles.row}>
            <View style={styles.column}>
              <NumberField control={control} name="donationsLastQuarter" label="Donations Last Quarter" helperText="Charitable donations made" style={styles.input} />
            </View>
            <View style={styles.column}>
              <NumberField control={control} name="fixedAssetsPurchased" label="Fixed Assets Purchased" helperText="Equipment/property purchased" style={styles.input} />
            </View>
          </View>

          <NumberField control={control} name="personalDrawings" label="Personal Drawings" helperText="Owner drawings from business" />
        </View>
      </View>

      {/* Current Liabilities */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitleRemove}>Current Liabilities</Text>

        <View style={styles.detailsCard}>
          <View style={styles.row}>
            <View style={styles.column}>
              <NumberField control={control} name="tradeCreditors" label="Trade Creditors" helperText="Amounts owed to suppliers" style={styles.input} />
            </View>
            <View style={styles.column}>
              <NumberField control={control} name="financialLoans" label="Financial Loans" helperText="Bank loans and financing" style={styles.input} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <NumberField control={control} name="accruedExpenses" label="Accrued Expenses" helperText="Expenses incurred but not paid" style={styles.input} />
            </View>
            <View style={styles.column}>
              <NumberField control={control} name="incomeTaxProvision" label="Income Tax Provision" helperText="Tax liability provision" style={styles.input} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <NumberField control={control} name="overdraft" label="Overdraft" helperText="Bank overdraft facility used" style={styles.input} />
            </View>
            <View style={styles.column}>
              <NumberField control={control} name="directorsFees" label="Directors Fees" helperText="Fees payable to directors" style={styles.input} />
            </View>
          </View>
        </View>
      </View>

      {/* Business Details */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Business Details</Text>

        <View style={styles.detailsCard}>
          <NumberField control={control} name="muslimOwnershipPercentage" label="Muslim Ownership Percentage" helperText="Percentage of business owned by Muslims (0-100%)" />
        </View>
      </View>

      <Button title="Save Calculation" onPress={handleSubmit(onSave)} icon={<Feather name="save" size={16} color={colors.white} />} style={styles.saveButton} />
    </CalculatorLayout>
  );
};

const styles = StyleSheet.create({
  formSection: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.primary[700], marginBottom: spacing.xs },
  sectionTitleRemove: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.red[600], marginBottom: spacing.xs },
  sectionTitleAdd: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.primary[600], marginBottom: spacing.xs },
  detailsCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.gray[200] },
  row: { flexDirection: 'row', gap: spacing.md },
  column: { flex: 1 },
  input: { marginBottom: spacing.md },
  saveButton: { marginTop: spacing.md },
});

export default BusinessCalculatorScreen;
