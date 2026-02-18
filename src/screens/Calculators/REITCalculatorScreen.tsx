import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { CalculatorLayout } from '../../components/calculator/CalculatorLayout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useCalculatorStore } from '../../store/calculatorStore';
import { useNisabStore } from '../../store/nisabStore';
import { REITData, REITType } from '../../types/calculator';

const liabilityConditions = [
  {
    id: 'long_term_income',
    label: 'Hold REIT units for long-term income (not for trading)',
    description: 'Your REIT units are not treated as trade stock. So, no Zakat on the market value of the REIT units themselves \u2014 only on rental income received and cash balance.',
  },
  {
    id: 'not_shariah_compliant',
    label: 'REIT structure is not Shariah-compliant',
    description: 'If the REIT holds non-compliant assets (like interest-bearing loans, conventional debt), many scholars say the entire investment is questionable for Zakat purposes \u2014 you may only pay Zakat on any lawful dividends you actually receive.',
  },
];

const reitTypes: Array<{ value: REITType; label: string; description: string }> = [
  {
    value: 'unit_value',
    label: 'Type 1: REIT Unit Value',
    description: 'Find the current value of your REIT units on your Zakat date, then apply 2.5% Zakat rate.',
  },
  {
    value: 'rental_income',
    label: 'Type 2: Rental Income',
    description: 'Find and check rental income you still own on your Zakat date, then apply 2.5% Zakat rate.',
  },
];

type FormData = {
  reitType: REITType;
  reitName: string;
  numberOfUnits: number;
  pricePerUnit: number;
  rentalIncomeOnHand: number;
};

const formatCurrency = (value: number) => {
  return `S$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const REITCalculatorScreen: React.FC = () => {
  const setCalculatorData = useCalculatorStore((state) => state.setCalculatorData);
  const markAsCalculated = useCalculatorStore((state) => state.markAsCalculated);
  const existingData = useCalculatorStore((state) => state.calculators.reit);
  const nisabMonetary = useNisabStore((state) => state.monetary);

  const [showLiabilityCheck, setShowLiabilityCheck] = useState(true);
  const [selectedExemptions, setSelectedExemptions] = useState<string[]>(
    existingData?.liabilityExemptions || []
  );

  const { control, watch, handleSubmit } = useForm<FormData>({
    defaultValues: {
      reitType: existingData?.reitType || 'unit_value',
      reitName: existingData?.reitName || '',
      numberOfUnits: existingData?.numberOfUnits || 0,
      pricePerUnit: existingData?.pricePerUnit || 0,
      rentalIncomeOnHand: existingData?.rentalIncomeOnHand || 0,
    },
  });

  const reitType = watch('reitType');
  const numberOfUnits = watch('numberOfUnits');
  const pricePerUnit = watch('pricePerUnit');
  const rentalIncomeOnHand = watch('rentalIncomeOnHand');
  const isExempt = selectedExemptions.length > 0;

  const currentValue = (Number(numberOfUnits) || 0) * (Number(pricePerUnit) || 0);

  const calculationSummary = useMemo(() => {
    if (isExempt) {
      return { totalAssets: 0, totalDebts: 0, netAssets: 0, zakatDue: 0, isAboveNisab: false };
    }

    let totalAssets = 0;
    if (reitType === 'unit_value') {
      totalAssets = currentValue;
    } else {
      totalAssets = Number(rentalIncomeOnHand) || 0;
    }

    const isAboveNisab = totalAssets >= nisabMonetary;
    const zakatDue = isAboveNisab ? totalAssets * 0.025 : 0;
    return { totalAssets, totalDebts: 0, netAssets: totalAssets, zakatDue, isAboveNisab };
  }, [reitType, currentValue, rentalIncomeOnHand, nisabMonetary, isExempt]);

  const toggleExemption = (id: string) => {
    setSelectedExemptions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const onSave = (data: FormData) => {
    const reitData: REITData = {
      liabilityExemptions: selectedExemptions,
      reitType: data.reitType,
      reitName: data.reitName,
      numberOfUnits: data.numberOfUnits,
      pricePerUnit: data.pricePerUnit,
      rentalIncomeOnHand: data.rentalIncomeOnHand,
      calculated: true,
      zakatAmount: calculationSummary.zakatDue,
    };
    setCalculatorData('reit', reitData);
    markAsCalculated('reit');
  };

  const importantNotes = [
    'Type 1: Zakat on current value of REIT units (for trading).',
    'Type 2: Zakat on rental income received (for long-term holding).',
    'Check if REIT is Shariah-compliant before calculating.',
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
          <Text style={styles.modalSubtitle}>Check if any of these conditions apply to your Real Estate Investment Trusts</Text>

          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              <Text style={styles.warningTextBold}>No zakat is liable</Text> if you meet{' '}
              <Text style={styles.warningTextBold}>any</Text> of the following conditions. Select all that apply to you.
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

      <CalculatorLayout title="REIT Zakat" calculationSummary={calculationSummary} importantNotes={importantNotes}>
        {isExempt && (
          <View style={styles.exemptBanner}>
            <Feather name="info" size={18} color={colors.amber[900]} />
            <View style={styles.exemptTextContainer}>
              <Text style={styles.exemptLabel}>Exemption Applied</Text>
              <Text style={styles.exemptDescription}>Based on your liability check, no Zakat is due on this REIT.</Text>
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

        {/* REIT Type */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Select REIT Type</Text>

          <Controller
            control={control}
            name="reitType"
            render={({ field: { onChange, value } }) => (
              <View style={styles.typeCard}>
                {reitTypes.map((type) => (
                  <TouchableOpacity key={type.value} style={styles.typeOption} onPress={() => onChange(type.value)} activeOpacity={0.7}>
                    <View style={styles.radioRow}>
                      <View style={[styles.radio, value === type.value && styles.radioSelected]}>
                        {value === type.value && <View style={styles.radioInner} />}
                      </View>
                      <View style={styles.typeTextContainer}>
                        <Text style={[styles.typeLabel, value === type.value && styles.typeLabelSelected]}>{type.label}</Text>
                        <Text style={styles.typeDescription}>{type.description}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* REIT Details */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>REIT Details</Text>

          <View style={styles.detailsCard}>
            <Controller
              control={control}
              name="reitName"
              render={({ field: { onChange, value } }) => (
                <Input label="REIT Name" placeholder="e.g., CapitaLand Mall Trust" value={value} onChangeText={onChange} style={styles.input} />
              )}
            />

            {reitType === 'unit_value' && (
              <>
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Controller
                      control={control}
                      name="numberOfUnits"
                      render={({ field: { onChange, value } }) => (
                        <Input label="Number of Units" placeholder="0" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(text) => onChange(parseFloat(text) || 0)} style={styles.input} />
                      )}
                    />
                  </View>
                  <View style={styles.column}>
                    <Controller
                      control={control}
                      name="pricePerUnit"
                      render={({ field: { onChange, value } }) => (
                        <Input label="Price per Unit (S$)" placeholder="0" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(text) => onChange(parseFloat(text) || 0)} style={styles.input} />
                      )}
                    />
                  </View>
                </View>

                <View style={styles.currentValueRow}>
                  <Text style={styles.currentValueLabel}>Current Value (S$)</Text>
                  <Text style={styles.currentValueAmount}>{formatCurrency(currentValue)}</Text>
                </View>
              </>
            )}

            {reitType === 'rental_income' && (
              <Controller
                control={control}
                name="rentalIncomeOnHand"
                render={({ field: { onChange, value } }) => (
                  <Input label="Rental Income on Hand at Zakat Date (S$)" placeholder="0" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(text) => onChange(parseFloat(text) || 0)} helperText="Only income remaining at your zakat date" />
                )}
              />
            )}
          </View>
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
  typeCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.gray[200], marginTop: spacing.sm },
  typeOption: { paddingVertical: spacing.md },
  radioRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.gray[300], alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  radioSelected: { borderColor: colors.primary[600] },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary[600] },
  typeTextContainer: { flex: 1 },
  typeLabel: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.gray[900], marginBottom: 4 },
  typeLabelSelected: { color: colors.primary[700] },
  typeDescription: { fontSize: typography.fontSizes.sm, color: colors.gray[600], lineHeight: 20 },
  detailsCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.gray[200] },
  input: { marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  column: { flex: 1 },
  currentValueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.gray[50], borderRadius: borderRadius.md, padding: spacing.md, marginTop: spacing.xs },
  currentValueLabel: { fontSize: typography.fontSizes.sm, color: colors.gray[600] },
  currentValueAmount: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.gray[900] },
  saveButton: { marginTop: spacing.md },
});

export default REITCalculatorScreen;
