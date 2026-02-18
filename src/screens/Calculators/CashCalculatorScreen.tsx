import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { CalculatorLayout } from '../../components/calculator/CalculatorLayout';
import { Input } from '../../components/common/Input';
import { Dropdown } from '../../components/common/Dropdown';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useCalculatorStore } from '../../store/calculatorStore';
import { useNisabStore } from '../../store/nisabStore';
import { CashData } from '../../types/calculator';

type FormData = {
  accounts: Array<{
    id: string;
    name: string;
    accountType: 'savings' | 'current' | 'fixed_deposit';
    lowestAmountInYear: number;
    interestEarned?: number;
  }>;
  totalDebts: number;
};

const accountTypeOptions = [
  { label: 'Savings Account', value: 'savings' },
  { label: 'Current Account', value: 'current' },
  { label: 'Fixed Deposit', value: 'fixed_deposit' },
];

const CashCalculatorScreen: React.FC = () => {
  const setCalculatorData = useCalculatorStore((state) => state.setCalculatorData);
  const markAsCalculated = useCalculatorStore((state) => state.markAsCalculated);
  const existingData = useCalculatorStore((state) => state.calculators.cash);
  const nisabMonetary = useNisabStore((state) => state.monetary);

  const { control, watch, setValue, handleSubmit } = useForm<FormData>({
    defaultValues: {
      accounts: existingData?.accounts || [
        { id: '1', name: '', accountType: 'savings', lowestAmountInYear: 0, interestEarned: 0 },
      ],
      totalDebts: existingData?.totalDebts || 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'accounts',
  });

  // Watch form values for real-time calculation
  const accounts = watch('accounts');
  const totalDebtsValue = watch('totalDebts');

  // Calculate in real-time using useMemo
  const calculationSummary = useMemo(() => {
    const totalAssets = accounts.reduce(
      (sum, account) => sum + (Number(account.lowestAmountInYear) || 0),
      0
    );
    const totalDebts = Number(totalDebtsValue) || 0;
    const netAssets = totalAssets - totalDebts;
    const isAboveNisab = netAssets >= nisabMonetary;
    const zakatDue = isAboveNisab ? netAssets * 0.025 : 0;

    return {
      totalAssets,
      totalDebts,
      netAssets,
      zakatDue,
      isAboveNisab,
    };
  }, [accounts, totalDebtsValue, nisabMonetary]);

  const handleAddAccount = () => {
    append({
      id: Date.now().toString(),
      name: '',
      accountType: 'savings',
      lowestAmountInYear: 0,
      interestEarned: 0,
    });
  };

  const handleRemoveAccount = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSave = (data: FormData) => {
    const cashData: CashData = {
      accounts: data.accounts,
      totalDebts: data.totalDebts,
      calculated: true,
      zakatAmount: calculationSummary?.zakatDue || 0,
    };

    // Save to store
    setCalculatorData('cash', cashData);
    markAsCalculated('cash');

    console.log('Cash Calculator Saved:', cashData);
  };

  const importantNotes = [
    'Enter the lowest balance in each account over the past lunar year (12 lunar months, approximately 354 days).',
    'Interest earned should be purified separately and is not part of Zakat calculation.',
    'Deductible debts include immediate debts due for payment (e.g., credit card bills, personal loans due).',
    'Shafi\'i method: Count the balance on the day you calculate Zakat.',
    'Hanafi method: Count the lowest balance during the lunar year (recommended for accuracy).',
  ];

  return (
    <CalculatorLayout
      title="Cash Calculator"
      calculationSummary={calculationSummary}
      importantNotes={importantNotes}
    >
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Bank Accounts</Text>
        <Text style={styles.sectionSubtitle}>
          Add all your bank accounts and enter the lowest balance over the past lunar year
        </Text>

        {fields.map((field, index) => (
          <View key={field.id} style={styles.accountCard}>
            <View style={styles.accountHeader}>
              <Text style={styles.accountNumber}>Account {index + 1}</Text>
              {fields.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemoveAccount(index)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="trash-2" size={18} color={colors.red[600]} />
                </TouchableOpacity>
              )}
            </View>

            {/* Account Name */}
            <Controller
              control={control}
              name={`accounts.${index}.name`}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Account Name (Optional)"
                  placeholder="e.g., DBS Savings"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                />
              )}
            />

            {/* Account Type */}
            <Controller
              control={control}
              name={`accounts.${index}.accountType`}
              render={({ field: { onChange, value } }) => (
                <Dropdown
                  label="Account Type"
                  options={accountTypeOptions}
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.input}
                />
              )}
            />

            {/* Lowest Balance */}
            <Controller
              control={control}
              name={`accounts.${index}.lowestAmountInYear`}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Lowest Balance in Year (S$)"
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={value?.toString()}
                  onChangeText={(text) => {
                    const numValue = parseFloat(text) || 0;
                    onChange(numValue);
                  }}
                  icon={<Feather name="dollar-sign" size={16} color={colors.gray[400]} />}
                  style={styles.input}
                />
              )}
            />

            {/* Interest Earned */}
            <Controller
              control={control}
              name={`accounts.${index}.interestEarned`}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Interest Earned (S$)"
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={value?.toString()}
                  onChangeText={(text) => {
                    const numValue = parseFloat(text) || 0;
                    onChange(numValue);
                  }}
                  icon={<Feather name="percent" size={16} color={colors.gray[400]} />}
                  helperText="Interest should be purified separately (not part of Zakat)"
                  style={styles.input}
                />
              )}
            />
          </View>
        ))}

        {/* Add Account Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddAccount}>
          <Feather name="plus-circle" size={20} color={colors.primary[600]} />
          <Text style={styles.addButtonText}>Add Another Account</Text>
        </TouchableOpacity>
      </View>

      {/* Deductible Debts Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Deductible Debts</Text>
        <Text style={styles.sectionSubtitle}>
          Enter immediate debts due for payment (e.g., credit card bills, loans due)
        </Text>

        <Controller
          control={control}
          name="totalDebts"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Total Deductible Debts (S$)"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={value?.toString()}
              onChangeText={(text) => {
                const numValue = parseFloat(text) || 0;
                onChange(numValue);
              }}
              icon={<Feather name="minus-circle" size={16} color={colors.gray[400]} />}
              helperText="Only include debts that are due immediately"
            />
          )}
        />
      </View>

      {/* Save Button */}
      <Button
        title="Save Calculation"
        onPress={handleSubmit(onSave)}
        icon={<Feather name="save" size={16} color={colors.white} />}
        style={styles.saveButton}
      />
    </CalculatorLayout>
  );
};

const styles = StyleSheet.create({
  formSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[700],
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  accountCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  accountNumber: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary[600],
  },
  input: {
    marginBottom: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary[200],
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.primary[600],
  },
  saveButton: {
    marginTop: spacing.md,
  },
});

export default CashCalculatorScreen;
