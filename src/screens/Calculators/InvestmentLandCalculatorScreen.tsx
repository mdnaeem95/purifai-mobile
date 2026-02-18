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
import { InvestmentLandData } from '../../types/calculator';

const liabilityConditions = [
  {
    id: 'personal_use',
    label: 'The land is bought for personal use',
    description:
      'The land is bought for personal use (e.g., to build a house). Land held for personal purposes is not subject to zakat.',
  },
  {
    id: 'passive_investment',
    label: 'The land is kept only as a store of value or passive investment',
    description:
      'The land is kept only as a store of value or passive investment, with no active plan to resell for profit. Only trading stock (land actively intended for resale) is zakatable.',
  },
  {
    id: 'no_rental_income',
    label: 'The land generates no rental income',
    description:
      'The land generates no rental income. If there is rental income, then the rental income would be zakatable as cash, not the land itself.',
  },
];

type FormData = {
  holdings: Array<{ id: string; name: string; marketValue: number }>;
};

const InvestmentLandCalculatorScreen: React.FC = () => {
  const setCalculatorData = useCalculatorStore((state) => state.setCalculatorData);
  const markAsCalculated = useCalculatorStore((state) => state.markAsCalculated);
  const existingData = useCalculatorStore((state) => state.calculators.investment_land);
  const nisabMonetary = useNisabStore((state) => state.monetary);

  const [showLiabilityCheck, setShowLiabilityCheck] = useState(true);
  const [selectedExemptions, setSelectedExemptions] = useState<string[]>(
    existingData?.liabilityExemptions || []
  );

  const { control, watch, handleSubmit } = useForm<FormData>({
    defaultValues: {
      holdings: existingData?.holdings || [{ id: '1', name: '', marketValue: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'holdings' });
  const holdings = watch('holdings');
  const isExempt = selectedExemptions.length > 0;

  const calculationSummary = useMemo(() => {
    if (isExempt) {
      return { totalAssets: 0, totalDebts: 0, netAssets: 0, zakatDue: 0, isAboveNisab: false };
    }
    const totalAssets = holdings.reduce((sum, h) => sum + (Number(h.marketValue) || 0), 0);
    const isAboveNisab = totalAssets >= nisabMonetary;
    const zakatDue = isAboveNisab ? totalAssets * 0.025 : 0;
    return { totalAssets, totalDebts: 0, netAssets: totalAssets, zakatDue, isAboveNisab };
  }, [holdings, nisabMonetary, isExempt]);

  const toggleExemption = (id: string) => {
    setSelectedExemptions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const onSave = (data: FormData) => {
    const landData: InvestmentLandData = {
      liabilityExemptions: selectedExemptions,
      holdings: data.holdings,
      calculated: true,
      zakatAmount: calculationSummary.zakatDue,
    };
    setCalculatorData('investment_land', landData);
    markAsCalculated('investment_land');
  };

  const importantNotes = [
    'Only land held as trading stock (intended for resale) is zakatable.',
    'Land for personal use or passive investment is exempt.',
    'If generating rental income, the income is zakatable as cash instead.',
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
            Check if any of these conditions apply to your Investment Land
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
            <View style={styles.modalFooterButtons}>
              <Button title="Cancel" onPress={() => setShowLiabilityCheck(false)} variant="outline" style={styles.modalButton} />
              <Button title={isExempt ? 'Continue Anyway' : 'None Apply - Proceed'} onPress={() => setShowLiabilityCheck(false)} style={styles.modalButton} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Main Calculator */}
      <CalculatorLayout title="Investment Land Zakat" calculationSummary={calculationSummary} importantNotes={importantNotes}>
        {isExempt && (
          <View style={styles.exemptBanner}>
            <Feather name="info" size={18} color={colors.amber[900]} />
            <View style={styles.exemptTextContainer}>
              <Text style={styles.exemptLabel}>Exemption Applied</Text>
              <Text style={styles.exemptDescription}>Based on your liability check, no Zakat is due on this investment land.</Text>
            </View>
            <TouchableOpacity onPress={() => setShowLiabilityCheck(true)}>
              <Text style={styles.exemptEditText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isExempt && (
          <TouchableOpacity style={styles.liabilityButton} onPress={() => setShowLiabilityCheck(true)}>
            <Feather name="shield" size={18} color={colors.primary[600]} />
            <Text style={styles.liabilityButtonText}>Review Liability Check</Text>
          </TouchableOpacity>
        )}

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Land Holdings</Text>
          <Text style={styles.sectionSubtitle}>Pay Zakat on land held as trading stock (intended for resale).</Text>

          {fields.map((field, index) => (
            <View key={field.id} style={styles.holdingCard}>
              <View style={styles.holdingHeader}>
                <Text style={styles.holdingNumber}>Land {index + 1}</Text>
                {fields.length > 1 && (
                  <TouchableOpacity onPress={() => remove(index)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
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
                      <Input label="Land Name / Description" placeholder="e.g., Land 1" value={value} onChangeText={onChange} style={styles.input} />
                    )}
                  />
                </View>
                <View style={styles.column}>
                  <Controller
                    control={control}
                    name={`holdings.${index}.marketValue`}
                    render={({ field: { onChange, value } }) => (
                      <Input label="Market Value (S$)" placeholder="0" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(text) => onChange(parseFloat(text) || 0)} style={styles.input} />
                    )}
                  />
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={() => append({ id: Date.now().toString(), name: '', marketValue: 0 })}>
            <Feather name="plus-circle" size={20} color={colors.primary[600]} />
            <Text style={styles.addButtonText}>Add Land</Text>
          </TouchableOpacity>
        </View>

        <Button title="Save Calculation" onPress={handleSubmit(onSave)} icon={<Feather name="save" size={16} color={colors.white} />} style={styles.saveButton} />
      </CalculatorLayout>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: colors.white, paddingTop: spacing['4xl'] },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  modalTitle: { fontSize: typography.fontSizes['2xl'], fontWeight: typography.fontWeights.bold, color: colors.gray[900] },
  modalSubtitle: { fontSize: typography.fontSizes.sm, color: colors.gray[600], paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  warningBanner: { backgroundColor: colors.amber[50], borderWidth: 1, borderColor: colors.amber[200], borderRadius: borderRadius.lg, padding: spacing.lg, marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  warningText: { fontSize: typography.fontSizes.sm, color: colors.amber[900], lineHeight: 20 },
  warningTextBold: { fontWeight: typography.fontWeights.bold, color: '#991B1B' },
  modalContent: { flex: 1, paddingHorizontal: spacing.lg },
  conditionCard: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.gray[200], gap: spacing.md },
  conditionCardSelected: { borderColor: colors.primary[300], backgroundColor: colors.primary[50] },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.gray[300], backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxChecked: { backgroundColor: colors.primary[700], borderColor: colors.primary[700] },
  conditionTextContainer: { flex: 1 },
  conditionLabel: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.gray[900], marginBottom: spacing.xs },
  conditionDescription: { fontSize: typography.fontSizes.sm, color: colors.gray[600], lineHeight: 20 },
  modalFooter: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.gray[200] },
  modalFooterButtons: { flexDirection: 'row', gap: spacing.md },
  modalButton: { flex: 1 },
  exemptBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.amber[50], borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.amber[200], gap: spacing.md },
  exemptTextContainer: { flex: 1 },
  exemptLabel: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.amber[900] },
  exemptDescription: { fontSize: typography.fontSizes.sm, color: colors.amber[800], marginTop: 2 },
  exemptEditText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.semibold, color: colors.primary[600] },
  liabilityButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.primary[50], borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.primary[200], marginBottom: spacing.lg },
  liabilityButtonText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.primary[600] },
  formSection: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: colors.primary[700], marginBottom: spacing.xs },
  sectionSubtitle: { fontSize: typography.fontSizes.sm, color: colors.gray[600], marginBottom: spacing.lg, lineHeight: 20 },
  holdingCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.gray[200] },
  holdingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  holdingNumber: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.primary[600] },
  row: { flexDirection: 'row', gap: spacing.md },
  column: { flex: 1 },
  input: { marginBottom: spacing.md },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.primary[50], borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.primary[200], borderStyle: 'dashed' },
  addButtonText: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.medium, color: colors.primary[600] },
  saveButton: { marginTop: spacing.md },
});

export default InvestmentLandCalculatorScreen;
