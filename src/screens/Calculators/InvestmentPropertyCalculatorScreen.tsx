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
import { InvestmentPropertyData, PropertyType } from '../../types/calculator';

const liabilityConditions = [
  {
    id: 'store_of_value',
    label: 'The property is kept only as a store of value',
    description: 'The property is kept only as a store of value, with no active plan to sell now. Properties held passively without intention to trade are not subject to zakat on the building value.',
  },
  {
    id: 'personal_use',
    label: 'The property is for personal use',
    description: 'The property is for personal use (e.g., your own house). Personal residences are exempt from zakat.',
  },
  {
    id: 'rental_no_building_zakat',
    label: 'A rental property: no zakat on the building itself',
    description: 'For rental properties, there is no zakat on the building itself \u2014 only the rental income is zakatable if you still own it when your zakat date arrives.',
  },
];

const propertyTypes: Array<{ value: PropertyType; label: string; description: string }> = [
  {
    value: 'bought_to_resell',
    label: 'Type 1: Bought to Resell',
    description: 'Property bought with clear intention to resell for profit. Zakat on current market value.',
  },
  {
    value: 'rental_income',
    label: 'Type 2: Rental Income',
    description: 'Property is leased and you have rental income on hand at zakat date. Zakat on rental income only.',
  },
  {
    value: 'redevelop_resell',
    label: 'Type 3: Redevelop & Resell',
    description: 'Property purchased to redevelop and resell for profit. Zakat on market value after refurbishment.',
  },
];

type FormData = {
  propertyType: PropertyType;
  propertyName: string;
  currentMarketValue: number;
  rentalIncomeOnHand: number;
  marketValueAfterRefurbishment: number;
};

const InvestmentPropertyCalculatorScreen: React.FC = () => {
  const setCalculatorData = useCalculatorStore((state) => state.setCalculatorData);
  const markAsCalculated = useCalculatorStore((state) => state.markAsCalculated);
  const existingData = useCalculatorStore((state) => state.calculators.investment_property);
  const nisabMonetary = useNisabStore((state) => state.monetary);

  const [showLiabilityCheck, setShowLiabilityCheck] = useState(true);
  const [selectedExemptions, setSelectedExemptions] = useState<string[]>(
    existingData?.liabilityExemptions || []
  );

  const { control, watch, handleSubmit } = useForm<FormData>({
    defaultValues: {
      propertyType: existingData?.propertyType || 'bought_to_resell',
      propertyName: existingData?.propertyName || '',
      currentMarketValue: existingData?.currentMarketValue || 0,
      rentalIncomeOnHand: existingData?.rentalIncomeOnHand || 0,
      marketValueAfterRefurbishment: existingData?.marketValueAfterRefurbishment || 0,
    },
  });

  const propertyType = watch('propertyType');
  const currentMarketValue = watch('currentMarketValue');
  const rentalIncomeOnHand = watch('rentalIncomeOnHand');
  const marketValueAfterRefurbishment = watch('marketValueAfterRefurbishment');
  const isExempt = selectedExemptions.length > 0;

  const calculationSummary = useMemo(() => {
    if (isExempt) {
      return { totalAssets: 0, totalDebts: 0, netAssets: 0, zakatDue: 0, isAboveNisab: false };
    }

    let totalAssets = 0;
    switch (propertyType) {
      case 'bought_to_resell':
        totalAssets = Number(currentMarketValue) || 0;
        break;
      case 'rental_income':
        totalAssets = Number(rentalIncomeOnHand) || 0;
        break;
      case 'redevelop_resell':
        totalAssets = Number(marketValueAfterRefurbishment) || 0;
        break;
    }

    const isAboveNisab = totalAssets >= nisabMonetary;
    const zakatDue = isAboveNisab ? totalAssets * 0.025 : 0;
    return { totalAssets, totalDebts: 0, netAssets: totalAssets, zakatDue, isAboveNisab };
  }, [propertyType, currentMarketValue, rentalIncomeOnHand, marketValueAfterRefurbishment, nisabMonetary, isExempt]);

  const toggleExemption = (id: string) => {
    setSelectedExemptions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const onSave = (data: FormData) => {
    const propData: InvestmentPropertyData = {
      liabilityExemptions: selectedExemptions,
      propertyType: data.propertyType,
      propertyName: data.propertyName,
      currentMarketValue: data.currentMarketValue,
      rentalIncomeOnHand: data.rentalIncomeOnHand,
      marketValueAfterRefurbishment: data.marketValueAfterRefurbishment,
      calculated: true,
      zakatAmount: calculationSummary.zakatDue,
    };
    setCalculatorData('investment_property', propData);
    markAsCalculated('investment_property');
  };

  const importantNotes = [
    'Only property held as trading stock (for resale) is zakatable on its full value.',
    'Personal residence and passive investments are exempt.',
    'Rental properties: only the rental income is zakatable, not the building.',
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
          <Text style={styles.modalSubtitle}>Check if any of these conditions apply to your Investment Property</Text>

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

      <CalculatorLayout title="Investment Property Zakat" calculationSummary={calculationSummary} importantNotes={importantNotes}>
        {isExempt && (
          <View style={styles.exemptBanner}>
            <Feather name="info" size={18} color={colors.amber[900]} />
            <View style={styles.exemptTextContainer}>
              <Text style={styles.exemptLabel}>Exemption Applied</Text>
              <Text style={styles.exemptDescription}>Based on your liability check, no Zakat is due on this property.</Text>
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

        {/* Property Type */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Select Property Type</Text>

          <Controller
            control={control}
            name="propertyType"
            render={({ field: { onChange, value } }) => (
              <View style={styles.typeCard}>
                {propertyTypes.map((type) => (
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

        {/* Property Details */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Property Details</Text>

          <View style={styles.detailsCard}>
            <Controller
              control={control}
              name="propertyName"
              render={({ field: { onChange, value } }) => (
                <Input label="Property Name / Description" placeholder="e.g., Condo at Orchard" value={value} onChangeText={onChange} style={styles.input} />
              )}
            />

            {propertyType === 'bought_to_resell' && (
              <Controller
                control={control}
                name="currentMarketValue"
                render={({ field: { onChange, value } }) => (
                  <Input label="Current Market Value (S$)" placeholder="0" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(text) => onChange(parseFloat(text) || 0)} />
                )}
              />
            )}

            {propertyType === 'rental_income' && (
              <Controller
                control={control}
                name="rentalIncomeOnHand"
                render={({ field: { onChange, value } }) => (
                  <Input label="Rental Income on Hand at Zakat Date (S$)" placeholder="0" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(text) => onChange(parseFloat(text) || 0)} helperText="Only income remaining at your zakat date" />
                )}
              />
            )}

            {propertyType === 'redevelop_resell' && (
              <Controller
                control={control}
                name="marketValueAfterRefurbishment"
                render={({ field: { onChange, value } }) => (
                  <Input label="Market Value After Refurbishment (S$)" placeholder="0" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(text) => onChange(parseFloat(text) || 0)} />
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
  saveButton: { marginTop: spacing.md },
});

export default InvestmentPropertyCalculatorScreen;
