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
import { ETCData, ETCCalculationType } from '../../types/calculator';

const liabilityConditions = [
  {
    id: 'long_term_non_zakatable',
    label: 'Hold ETC for long-term investment (not for trade)',
    description: 'When you hold an ETC for long-term investment, not for trade, and the underlying commodity is not inherently Zakatable (e.g., oil).',
  },
];

const calculationTypes: Array<{ value: ETCCalculationType; label: string; description: string }> = [
  {
    value: 'market_value',
    label: 'Type 1: Market Value',
    description: 'Find market value on your Zakat date, then apply 2.5% Zakat rate.',
  },
  {
    value: 'underlying_asset',
    label: 'Type 2: Underlying Zakatable Asset',
    description: 'For ETCs backed by zakatable commodities (gold/silver). Check current market value of total ETC holding, then apply 2.5% Zakat rate.',
  },
];

type FormData = {
  calculationType: ETCCalculationType;
  holdings: Array<{ id: string; name: string; numberOfUnits: number; pricePerUnit: number }>;
};

const formatCurrency = (value: number) => {
  return `S$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const ETCCalculatorScreen: React.FC = () => {
  const setCalculatorData = useCalculatorStore((state) => state.setCalculatorData);
  const markAsCalculated = useCalculatorStore((state) => state.markAsCalculated);
  const existingData = useCalculatorStore((state) => state.calculators.etc);
  const nisabMonetary = useNisabStore((state) => state.monetary);

  const [showLiabilityCheck, setShowLiabilityCheck] = useState(true);
  const [selectedExemptions, setSelectedExemptions] = useState<string[]>(
    existingData?.liabilityExemptions || []
  );

  const { control, watch, handleSubmit } = useForm<FormData>({
    defaultValues: {
      calculationType: existingData?.calculationType || 'market_value',
      holdings: existingData?.holdings || [{ id: '1', name: '', numberOfUnits: 0, pricePerUnit: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'holdings' });
  const calculationType = watch('calculationType');
  const holdings = watch('holdings');
  const isExempt = selectedExemptions.length > 0;

  const calculationSummary = useMemo(() => {
    if (isExempt) {
      return { totalAssets: 0, totalDebts: 0, netAssets: 0, zakatDue: 0, isAboveNisab: false };
    }

    const totalAssets = holdings.reduce((sum, h) => {
      return sum + (Number(h.numberOfUnits) || 0) * (Number(h.pricePerUnit) || 0);
    }, 0);

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
    const etcData: ETCData = {
      liabilityExemptions: selectedExemptions,
      calculationType: data.calculationType,
      holdings: data.holdings,
      calculated: true,
      zakatAmount: calculationSummary.zakatDue,
    };
    setCalculatorData('etc', etcData);
    markAsCalculated('etc');
  };

  const importantNotes = [
    'Type 1: Zakat on market value of ETC holdings (for trading).',
    'Type 2: Zakat on ETC backed by zakatable assets (gold/silver).',
    'Must hold ETC for one lunar year (355 days).',
    'Check if underlying commodity is zakatable.',
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
          <Text style={styles.modalSubtitle}>Check if any of these conditions apply to your Exchange-Traded Commodities</Text>

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

      <CalculatorLayout title="Exchange-Traded Commodities Zakat" calculationSummary={calculationSummary} importantNotes={importantNotes}>
        {isExempt && (
          <View style={styles.exemptBanner}>
            <Feather name="info" size={18} color={colors.amber[900]} />
            <View style={styles.exemptTextContainer}>
              <Text style={styles.exemptLabel}>Exemption Applied</Text>
              <Text style={styles.exemptDescription}>Based on your liability check, no Zakat is due on this ETC.</Text>
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

        {/* Calculation Method */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Select Calculation Method</Text>

          <Controller
            control={control}
            name="calculationType"
            render={({ field: { onChange, value } }) => (
              <View style={styles.typeCard}>
                {calculationTypes.map((type) => (
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

        {/* ETC Holdings */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>ETC Holdings</Text>
            <TouchableOpacity
              style={styles.addButtonSmall}
              onPress={() => append({ id: Date.now().toString(), name: '', numberOfUnits: 0, pricePerUnit: 0 })}
            >
              <Feather name="plus" size={14} color={colors.white} />
              <Text style={styles.addButtonSmallText}>Add ETC</Text>
            </TouchableOpacity>
          </View>

          {fields.map((field, index) => {
            const units = Number(holdings[index]?.numberOfUnits) || 0;
            const price = Number(holdings[index]?.pricePerUnit) || 0;
            const currentVal = units * price;

            return (
              <View key={field.id} style={styles.holdingCard}>
                <View style={styles.holdingHeader}>
                  <Text style={styles.holdingNumber}>ETC {index + 1}</Text>
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
                        <Input label="ETC Name" placeholder="e.g., ETC 1" value={value} onChangeText={onChange} style={styles.input} />
                      )}
                    />
                  </View>
                  <View style={styles.column}>
                    <Controller
                      control={control}
                      name={`holdings.${index}.numberOfUnits`}
                      render={({ field: { onChange, value } }) => (
                        <Input label="Number of Units" placeholder="0" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(text) => onChange(parseFloat(text) || 0)} style={styles.input} />
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
                        <Input label="Price per Unit (S$)" placeholder="0" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(text) => onChange(parseFloat(text) || 0)} style={styles.input} />
                      )}
                    />
                  </View>
                  <View style={styles.column}>
                    <View style={styles.currentValueContainer}>
                      <Text style={styles.currentValueLabel}>Current Value (S$)</Text>
                      <View style={styles.currentValueBox}>
                        <Text style={styles.currentValueAmount}>{formatCurrency(currentVal)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
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
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
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
  holdingCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.gray[200] },
  holdingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  holdingNumber: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.primary[600] },
  row: { flexDirection: 'row', gap: spacing.md },
  column: { flex: 1 },
  input: { marginBottom: spacing.md },
  currentValueContainer: { marginBottom: spacing.md },
  currentValueLabel: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.gray[700], marginBottom: spacing.xs },
  currentValueBox: { backgroundColor: colors.gray[50], borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.gray[200] },
  currentValueAmount: { fontSize: typography.fontSizes.base, color: colors.gray[900] },
  addButtonSmall: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary[700], paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.md },
  addButtonSmallText: { fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.medium, color: colors.white },
  saveButton: { marginTop: spacing.md },
});

export default ETCCalculatorScreen;
