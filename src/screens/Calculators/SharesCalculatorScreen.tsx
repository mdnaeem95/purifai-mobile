import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { CalculatorLayout } from '../../components/calculator/CalculatorLayout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useCalculatorStore } from '../../store/calculatorStore';
import { useNisabStore } from '../../store/nisabStore';
import { SharesData, SharesCalculationMethod } from '../../types/calculator';
import { formatCurrency } from '../../utils/formatters';

type FormData = {
  calculationMethod: SharesCalculationMethod;
  holdings: Array<{
    id: string;
    companyName: string;
    numberOfShares: number;
    pricePerShare: number;
    zakatableAssetRatio: number;
  }>;
};

const calculationMethods: Array<{
  value: SharesCalculationMethod;
  label: string;
  description: string;
}> = [
  {
    value: 'asset_based',
    label: 'Asset Based',
    description: "Method based on company's approximate zakatable assets",
  },
  {
    value: 'market_value',
    label: 'Market Value',
    description: 'Full market value for investment-focused portfolios',
  },
  {
    value: 'detailed',
    label: 'Detailed Zakatable Asset Method',
    description:
      '(Zakatable Assets (Cash + Short-term investments + Receivables) - Corresponding debt) × 2.5% ÷ Outstanding number of shares',
  },
];

const SharesCalculatorScreen: React.FC = () => {
  const setCalculatorData = useCalculatorStore((state) => state.setCalculatorData);
  const markAsCalculated = useCalculatorStore((state) => state.markAsCalculated);
  const existingData = useCalculatorStore((state) => state.calculators.shares);
  const nisabMonetary = useNisabStore((state) => state.monetary);

  const { control, watch, handleSubmit } = useForm<FormData>({
    defaultValues: {
      calculationMethod: existingData?.calculationMethod || 'asset_based',
      holdings: existingData?.holdings || [
        { id: '1', companyName: '', numberOfShares: 0, pricePerShare: 0, zakatableAssetRatio: 0.3 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'holdings',
  });

  const calculationMethod = watch('calculationMethod');
  const holdings = watch('holdings');

  // Calculate in real-time
  const calculationSummary = useMemo(() => {
    let totalAssets = 0;

    holdings.forEach((holding) => {
      const shares = Number(holding.numberOfShares) || 0;
      const price = Number(holding.pricePerShare) || 0;
      const currentValue = shares * price;

      if (calculationMethod === 'market_value') {
        totalAssets += currentValue;
      } else {
        // Asset-based or detailed: use zakatable asset ratio
        const ratio = Number(holding.zakatableAssetRatio) || 0;
        totalAssets += currentValue * ratio;
      }
    });

    const totalDebts = 0;
    const netAssets = totalAssets;
    const isAboveNisab = netAssets >= nisabMonetary;
    const zakatDue = isAboveNisab ? netAssets * 0.025 : 0;

    return {
      totalAssets,
      totalDebts,
      netAssets,
      zakatDue,
      isAboveNisab,
    };
  }, [holdings, calculationMethod, nisabMonetary]);

  const handleAddHolding = () => {
    append({
      id: Date.now().toString(),
      companyName: '',
      numberOfShares: 0,
      pricePerShare: 0,
      zakatableAssetRatio: 0.3,
    });
  };

  const handleRemoveHolding = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSave = (data: FormData) => {
    const sharesData: SharesData = {
      calculationMethod: data.calculationMethod,
      holdings: data.holdings,
      calculated: true,
      zakatAmount: calculationSummary.zakatDue,
    };

    setCalculatorData('shares', sharesData);
    markAsCalculated('shares');
  };

  const importantNotes = [
    'Must hold shares for one lunar year (355 days).',
    'Asset-based method uses company zakatable asset ratio.',
    'Market value method for investment-focused portfolios.',
    'Detailed method requires company financial data.',
  ];

  return (
    <CalculatorLayout
      title="Shares Zakat"
      calculationSummary={calculationSummary}
      importantNotes={importantNotes}
    >
      {/* Calculation Method */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Calculation Method</Text>

        <Controller
          control={control}
          name="calculationMethod"
          render={({ field: { onChange, value } }) => (
            <View style={styles.methodCard}>
              {calculationMethods.map((method) => (
                <TouchableOpacity
                  key={method.value}
                  style={styles.methodOption}
                  onPress={() => onChange(method.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioRow}>
                    <View style={[
                      styles.radio,
                      value === method.value && styles.radioSelected,
                    ]}>
                      {value === method.value && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.methodTextContainer}>
                      <Text style={[
                        styles.methodLabel,
                        value === method.value && styles.methodLabelSelected,
                      ]}>
                        {method.label}
                      </Text>
                      <Text style={styles.methodDescription}>{method.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      {/* Investment Holdings */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Investment Holdings</Text>
        <Text style={styles.sectionSubtitle}>
          Add your stock holdings to calculate Zakat
        </Text>

        {fields.map((field, index) => {
          const shares = Number(holdings[index]?.numberOfShares) || 0;
          const price = Number(holdings[index]?.pricePerShare) || 0;
          const currentValue = shares * price;

          return (
            <View key={field.id} style={styles.holdingCard}>
              <View style={styles.holdingHeader}>
                <Text style={styles.holdingNumber}>Holding {index + 1}</Text>
                {fields.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveHolding(index)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather name="trash-2" size={18} color={colors.red[600]} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Row: Company Name + Number of Shares */}
              <View style={styles.row}>
                <View style={styles.column}>
                  <Controller
                    control={control}
                    name={`holdings.${index}.companyName`}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Company Name"
                        placeholder="e.g., Company A"
                        value={value}
                        onChangeText={onChange}
                        style={styles.input}
                      />
                    )}
                  />
                </View>
                <View style={styles.column}>
                  <Controller
                    control={control}
                    name={`holdings.${index}.numberOfShares`}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Number of Shares"
                        placeholder="0"
                        keyboardType="numeric"
                        value={value?.toString()}
                        onChangeText={(text) => onChange(parseFloat(text) || 0)}
                        style={styles.input}
                      />
                    )}
                  />
                </View>
              </View>

              {/* Row: Price per Share + Current Value */}
              <View style={styles.row}>
                <View style={styles.column}>
                  <Controller
                    control={control}
                    name={`holdings.${index}.pricePerShare`}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Price per Share (S$)"
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        value={value?.toString()}
                        onChangeText={(text) => onChange(parseFloat(text) || 0)}
                        style={styles.input}
                      />
                    )}
                  />
                </View>
                <View style={styles.column}>
                  <View style={styles.calculatedField}>
                    <Text style={styles.calculatedLabel}>Current Value (S$)</Text>
                    <View style={styles.calculatedValueBox}>
                      <Text style={styles.calculatedValue}>
                        {formatCurrency(currentValue).replace('S$', '')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Zakatable Asset Ratio - only for asset_based and detailed methods */}
              {calculationMethod !== 'market_value' && (
                <Controller
                  control={control}
                  name={`holdings.${index}.zakatableAssetRatio`}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Zakatable Asset Ratio"
                      placeholder="0.3"
                      keyboardType="decimal-pad"
                      value={value?.toString()}
                      onChangeText={(text) => onChange(parseFloat(text) || 0)}
                      helperText="Ratio of company's zakatable assets (0 to 1)"
                      style={styles.input}
                    />
                  )}
                />
              )}
            </View>
          );
        })}

        {/* Add Holding Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddHolding}>
          <Feather name="plus-circle" size={20} color={colors.primary[600]} />
          <Text style={styles.addButtonText}>Add Holding</Text>
        </TouchableOpacity>
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
  methodCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginTop: spacing.sm,
  },
  methodOption: {
    paddingVertical: spacing.md,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioSelected: {
    borderColor: colors.primary[600],
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary[600],
  },
  methodTextContainer: {
    flex: 1,
  },
  methodLabel: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray[900],
    marginBottom: 4,
  },
  methodLabelSelected: {
    color: colors.primary[700],
  },
  methodDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },
  holdingCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  holdingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  holdingNumber: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary[600],
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  column: {
    flex: 1,
  },
  input: {
    marginBottom: spacing.md,
  },
  calculatedField: {
    marginBottom: spacing.md,
  },
  calculatedLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  calculatedValueBox: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  calculatedValue: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray[900],
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

export default SharesCalculatorScreen;
