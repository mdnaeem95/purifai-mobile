import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { CalculatorLayout } from '../../components/calculator/CalculatorLayout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useCalculatorStore } from '../../store/calculatorStore';
import { useNisabStore } from '../../store/nisabStore';
import { ETFData, ETFCalculationMethod } from '../../types/calculator';
import { formatCurrency } from '../../utils/formatters';

// Liability exemption conditions
const liabilityConditions = [
  {
    id: 'no_zakatable_assets',
    label: 'There are no zakatable assets inside the Exchange-Traded Fund',
    description:
      'The Exchange-Traded Fund only holds fixed assets (like rental real estate or factories) not for resale, or holds shares of companies whose capital is entirely tied up in fixed assets with no significant cash, receivables, or inventory.',
  },
  {
    id: 'below_nisab',
    label: 'Your ownership share does not reach the nisab',
    description:
      'After calculating, your proportion of zakatable assets is less than the zakat nisab (the minimum threshold, about 86 grams of gold).',
  },
  {
    id: 'long_term_hold',
    label: 'You hold the Exchange-Traded Fund long-term, with no trading or liquidity',
    description:
      'The Exchange-Traded Fund is held purely for long-term investment and the underlying assets do not produce cash, receivables, or trading stock.',
  },
  {
    id: 'value_drops',
    label: 'The Exchange-Traded Fund loses value or drops significantly',
    description:
      'If your Exchange-Traded Fund has significant losses, the total value drops and the zakatable portion may be zero or very small, so there may be no zakat due.',
  },
];

const calculationMethods: Array<{
  value: ETFCalculationMethod;
  label: string;
  description: string;
}> = [
  {
    value: 'direct',
    label: 'Direct',
    description: 'Calculate 2.5% of total ETF value',
  },
  {
    value: 'ratio_25',
    label: '25% Ratio',
    description: 'Calculate 25% of value, then apply 2.5% zakat rate (effective 0.625%)',
  },
  {
    value: 'informational',
    label: 'Informational',
    description: 'Other underlying assets consisting of: Crypto, Sukuk & REITs',
  },
];

type FormData = {
  calculationMethod: ETFCalculationMethod;
  holdings: Array<{
    id: string;
    name: string;
    numberOfUnits: number;
    pricePerUnit: number;
  }>;
};

const ETFCalculatorScreen: React.FC = () => {
  const setCalculatorData = useCalculatorStore((state) => state.setCalculatorData);
  const markAsCalculated = useCalculatorStore((state) => state.markAsCalculated);
  const existingData = useCalculatorStore((state) => state.calculators.etf);
  const nisabMonetary = useNisabStore((state) => state.monetary);

  const [showLiabilityCheck, setShowLiabilityCheck] = useState(true);
  const [selectedExemptions, setSelectedExemptions] = useState<string[]>(
    existingData?.liabilityExemptions || []
  );

  const { control, watch, handleSubmit } = useForm<FormData>({
    defaultValues: {
      calculationMethod: existingData?.calculationMethod || 'direct',
      holdings: existingData?.holdings || [
        { id: '1', name: '', numberOfUnits: 0, pricePerUnit: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'holdings',
  });

  const calculationMethod = watch('calculationMethod');
  const holdings = watch('holdings');

  const isExempt = selectedExemptions.length > 0;

  // Calculate in real-time
  const calculationSummary = useMemo(() => {
    if (isExempt) {
      return { totalAssets: 0, totalDebts: 0, netAssets: 0, zakatDue: 0, isAboveNisab: false };
    }

    let totalAssets = 0;
    holdings.forEach((holding) => {
      const units = Number(holding.numberOfUnits) || 0;
      const price = Number(holding.pricePerUnit) || 0;
      const currentValue = units * price;

      if (calculationMethod === 'ratio_25') {
        totalAssets += currentValue * 0.25; // 25% of value
      } else {
        totalAssets += currentValue;
      }
    });

    const totalDebts = 0;
    const netAssets = totalAssets;
    const isAboveNisab = netAssets >= nisabMonetary;
    const zakatDue = isAboveNisab ? netAssets * 0.025 : 0;

    return { totalAssets, totalDebts, netAssets, zakatDue, isAboveNisab };
  }, [holdings, calculationMethod, nisabMonetary, isExempt]);

  const toggleExemption = (id: string) => {
    setSelectedExemptions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleAddHolding = () => {
    append({ id: Date.now().toString(), name: '', numberOfUnits: 0, pricePerUnit: 0 });
  };

  const handleRemoveHolding = (index: number) => {
    if (fields.length > 1) remove(index);
  };

  const onSave = (data: FormData) => {
    const etfData: ETFData = {
      liabilityExemptions: selectedExemptions,
      calculationMethod: data.calculationMethod,
      holdings: data.holdings,
      calculated: true,
      zakatAmount: calculationSummary.zakatDue,
    };
    setCalculatorData('etf', etfData);
    markAsCalculated('etf');
  };

  const importantNotes = [
    'Must hold ETF for one lunar year (355 days).',
    'Direct method applies standard 2.5% zakat rate.',
    '25% ratio method is for specific ETF types (effective 0.625%).',
    'If any exemption condition applies, no Zakat is due on this ETF.',
  ];

  return (
    <>
      {/* Liability Check Modal */}
      <Modal visible={showLiabilityCheck} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>No Zakat Liability Check</Text>
            <TouchableOpacity onPress={() => setShowLiabilityCheck(false)}>
              <Feather name="x" size={24} color={colors.gray[700]} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>
            Check if any of these conditions apply to your ETF
          </Text>

          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              <Text style={styles.warningTextBold}>No zakat is liable</Text> if you meet{' '}
              <Text style={styles.warningTextBold}>any</Text> of the following conditions.
              Select all that apply to you.
            </Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {liabilityConditions.map((condition) => {
              const isChecked = selectedExemptions.includes(condition.id);
              return (
                <TouchableOpacity
                  key={condition.id}
                  style={[styles.conditionCard, isChecked && styles.conditionCardSelected]}
                  onPress={() => toggleExemption(condition.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                    {isChecked && <Feather name="check" size={16} color={colors.white} />}
                  </View>
                  <View style={styles.conditionTextContainer}>
                    <Text style={styles.conditionLabel}>{condition.label}</Text>
                    <Text style={styles.conditionDescription}>{condition.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button
              title={isExempt ? 'No Zakat Due - Continue Anyway' : 'Continue to Calculator'}
              onPress={() => setShowLiabilityCheck(false)}
              variant={isExempt ? 'outline' : 'primary'}
            />
          </View>
        </View>
      </Modal>

      {/* Main Calculator */}
      <CalculatorLayout
        title="ETF Zakat"
        calculationSummary={calculationSummary}
        importantNotes={importantNotes}
      >
        {/* Exemption Status */}
        {isExempt && (
          <View style={styles.exemptBanner}>
            <Feather name="info" size={18} color={colors.amber[900]} />
            <View style={styles.exemptTextContainer}>
              <Text style={styles.exemptLabel}>Exemption Applied</Text>
              <Text style={styles.exemptDescription}>
                Based on your liability check, no Zakat is due on this ETF.
              </Text>
            </View>
            <TouchableOpacity onPress={() => setShowLiabilityCheck(true)}>
              <Text style={styles.exemptEditText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Liability Check Button */}
        {!isExempt && (
          <TouchableOpacity
            style={styles.liabilityButton}
            onPress={() => setShowLiabilityCheck(true)}
          >
            <Feather name="shield" size={18} color={colors.primary[600]} />
            <Text style={styles.liabilityButtonText}>Review Liability Check</Text>
          </TouchableOpacity>
        )}

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
                      <View style={[styles.radio, value === method.value && styles.radioSelected]}>
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

        {/* ETF Holdings */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>ETF Holdings</Text>
          <Text style={styles.sectionSubtitle}>Add your ETF holdings to calculate Zakat</Text>

          {fields.map((field, index) => {
            const units = Number(holdings[index]?.numberOfUnits) || 0;
            const price = Number(holdings[index]?.pricePerUnit) || 0;
            const currentValue = units * price;

            return (
              <View key={field.id} style={styles.holdingCard}>
                <View style={styles.holdingHeader}>
                  <Text style={styles.holdingNumber}>ETF {index + 1}</Text>
                  {fields.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleRemoveHolding(index)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Feather name="trash-2" size={18} color={colors.red[600]} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.row}>
                  <View style={styles.column}>
                    <Controller
                      control={control}
                      name={`holdings.${index}.name`}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label="ETF Name"
                          placeholder="e.g., ETF 1"
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
                      name={`holdings.${index}.numberOfUnits`}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label="Number of Units"
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

                <View style={styles.row}>
                  <View style={styles.column}>
                    <Controller
                      control={control}
                      name={`holdings.${index}.pricePerUnit`}
                      render={({ field: { onChange, value } }) => (
                        <Input
                          label="Price per Unit (S$)"
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
              </View>
            );
          })}

          <TouchableOpacity style={styles.addButton} onPress={handleAddHolding}>
            <Feather name="plus-circle" size={20} color={colors.primary[600]} />
            <Text style={styles.addButtonText}>Add ETF</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Save Calculation"
          onPress={handleSubmit(onSave)}
          icon={<Feather name="save" size={16} color={colors.white} />}
          style={styles.saveButton}
        />
      </CalculatorLayout>
    </>
  );
};

const styles = StyleSheet.create({
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: spacing['4xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.gray[900],
  },
  modalSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  warningBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  warningText: {
    fontSize: typography.fontSizes.sm,
    color: colors.amber[900],
    lineHeight: 20,
  },
  warningTextBold: {
    fontWeight: typography.fontWeights.bold,
    color: '#991B1B',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  conditionCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    gap: spacing.md,
  },
  conditionCardSelected: {
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[700],
    borderColor: colors.primary[700],
  },
  conditionTextContainer: {
    flex: 1,
  },
  conditionLabel: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  conditionDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
    lineHeight: 20,
  },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },

  // Exemption banner
  exemptBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.amber[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.amber[200],
    gap: spacing.md,
  },
  exemptTextContainer: {
    flex: 1,
  },
  exemptLabel: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.amber[900],
  },
  exemptDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.amber[800],
    marginTop: 2,
  },
  exemptEditText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary[600],
  },

  // Liability button
  liabilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary[200],
    marginBottom: spacing.lg,
  },
  liabilityButtonText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.primary[600],
  },

  // Form styles
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

export default ETFCalculatorScreen;
