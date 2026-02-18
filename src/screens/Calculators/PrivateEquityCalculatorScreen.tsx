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
import { PrivateEquityData } from '../../types/calculator';

const liabilityConditions = [
  {
    id: 'no_net_zakatable',
    label: 'The startup has no net zakatable assets',
    description: 'All capital is tied up in fixed assets (machines, property). No excess cash, receivables, or inventory. Net zakatable assets = 0, so zakat = 0.',
  },
  {
    id: 'below_nisab',
    label: 'Your ownership share does not reach the nisab',
    description: 'Your share of net zakatable assets is less than 86 grams of gold equivalent.',
  },
  {
    id: 'continuous_losses',
    label: 'The startup is continuously making losses',
    description: 'Current assets are fully consumed for operating costs: Cash is negative, receivables are uncollectible, no inventory. Net zakatable assets = 0 or negative. No zakat basis, no zakat due.',
  },
];

type FormData = {
  companyName: string;
  investmentAmount: number;
  companyBookValue: number;
  zakatableAssets: number;
  companyLiabilities: number;
};

const formatCurrency = (value: number) => {
  return `S$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const PrivateEquityCalculatorScreen: React.FC = () => {
  const setCalculatorData = useCalculatorStore((state) => state.setCalculatorData);
  const markAsCalculated = useCalculatorStore((state) => state.markAsCalculated);
  const existingData = useCalculatorStore((state) => state.calculators.private_equity);
  const nisabMonetary = useNisabStore((state) => state.monetary);

  const [showLiabilityCheck, setShowLiabilityCheck] = useState(true);
  const [selectedExemptions, setSelectedExemptions] = useState<string[]>(
    existingData?.liabilityExemptions || []
  );

  const { control, watch, handleSubmit } = useForm<FormData>({
    defaultValues: {
      companyName: existingData?.companyName || '',
      investmentAmount: existingData?.investmentAmount || 0,
      companyBookValue: existingData?.companyBookValue || 0,
      zakatableAssets: existingData?.zakatableAssets || 0,
      companyLiabilities: existingData?.companyLiabilities || 0,
    },
  });

  const investmentAmount = watch('investmentAmount');
  const companyBookValue = watch('companyBookValue');
  const zakatableAssets = watch('zakatableAssets');
  const companyLiabilities = watch('companyLiabilities');
  const isExempt = selectedExemptions.length > 0;

  const calculationSummary = useMemo(() => {
    if (isExempt) {
      return { totalAssets: 0, totalDebts: 0, netAssets: 0, zakatDue: 0, isAboveNisab: false };
    }

    const inv = Number(investmentAmount) || 0;
    const bookVal = Number(companyBookValue) || 0;
    const assets = Number(zakatableAssets) || 0;
    const liabilities = Number(companyLiabilities) || 0;

    // Net zakatable assets = zakatable assets - liabilities
    const netZakatableAssets = Math.max(assets - liabilities, 0);
    // Ratio = net zakatable assets / company book value
    const ratio = bookVal > 0 ? netZakatableAssets / bookVal : 0;
    // Your zakatable portion = investment × ratio
    const totalAssets = inv * ratio;

    const isAboveNisab = totalAssets >= nisabMonetary;
    const zakatDue = isAboveNisab ? totalAssets * 0.025 : 0;
    return { totalAssets, totalDebts: 0, netAssets: totalAssets, zakatDue, isAboveNisab };
  }, [investmentAmount, companyBookValue, zakatableAssets, companyLiabilities, nisabMonetary, isExempt]);

  const toggleExemption = (id: string) => {
    setSelectedExemptions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const onSave = (data: FormData) => {
    const peData: PrivateEquityData = {
      liabilityExemptions: selectedExemptions,
      companyName: data.companyName,
      investmentAmount: data.investmentAmount,
      companyBookValue: data.companyBookValue,
      zakatableAssets: data.zakatableAssets,
      companyLiabilities: data.companyLiabilities,
      calculated: true,
      zakatAmount: calculationSummary.zakatDue,
    };
    setCalculatorData('private_equity', peData);
    markAsCalculated('private_equity');
  };

  const importantNotes = [
    'Step 1: Find the company\'s total book value (from balance sheet).',
    'Step 2: Calculate Net Zakatable Assets = Zakatable Assets - Liabilities.',
    'Step 3: Calculate ratio = Net Zakatable Assets \u00F7 Company Book Value.',
    'Step 4: Your Zakatable Portion = Your Investment \u00D7 Ratio.',
    'Step 5: Zakat = 2.5% \u00D7 Your Zakatable Portion.',
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
          <Text style={styles.modalSubtitle}>Check if any of these conditions apply to your Private Equity</Text>

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

      <CalculatorLayout title="Private Equity Zakat" calculationSummary={calculationSummary} importantNotes={importantNotes}>
        {isExempt && (
          <View style={styles.exemptBanner}>
            <Feather name="info" size={18} color={colors.amber[900]} />
            <View style={styles.exemptTextContainer}>
              <Text style={styles.exemptLabel}>Exemption Applied</Text>
              <Text style={styles.exemptDescription}>Based on your liability check, no Zakat is due on this private equity investment.</Text>
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

        {/* Investment Details */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Investment Details</Text>

          <View style={styles.detailsCard}>
            <Controller
              control={control}
              name="companyName"
              render={({ field: { onChange, value } }) => (
                <Input label="Company/Startup Name" placeholder="e.g., TechCo Pte Ltd" value={value} onChangeText={onChange} style={styles.input} />
              )}
            />

            <Controller
              control={control}
              name="investmentAmount"
              render={({ field: { onChange, value } }) => (
                <Input label="Your Investment Amount (S$)" placeholder="0" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(text) => onChange(parseFloat(text) || 0)} />
              )}
            />
          </View>
        </View>

        {/* Company Financials */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Company Financials</Text>
          <Text style={styles.sectionSubtitle}>Enter the company's financial details from their balance sheet to calculate the zakatable ratio.</Text>

          <View style={styles.detailsCard}>
            <Controller
              control={control}
              name="companyBookValue"
              render={({ field: { onChange, value } }) => (
                <Input label="Company Book Value (S$)" placeholder="0" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(text) => onChange(parseFloat(text) || 0)} style={styles.input} />
              )}
            />

            <Controller
              control={control}
              name="zakatableAssets"
              render={({ field: { onChange, value } }) => (
                <Input label="Zakatable Assets (S$)" placeholder="0" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(text) => onChange(parseFloat(text) || 0)} style={styles.input} />
              )}
            />

            <Controller
              control={control}
              name="companyLiabilities"
              render={({ field: { onChange, value } }) => (
                <Input label="Company Liabilities (S$)" placeholder="0" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(text) => onChange(parseFloat(text) || 0)} />
              )}
            />
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
  sectionSubtitle: { fontSize: typography.fontSizes.sm, color: colors.gray[600], marginBottom: spacing.lg, lineHeight: 20 },
  detailsCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.gray[200] },
  input: { marginBottom: spacing.md },
  saveButton: { marginTop: spacing.md },
});

export default PrivateEquityCalculatorScreen;
