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
import { CryptoData, CryptoType } from '../../types/calculator';

const liabilityConditions = [
  {
    id: 'security_non_zakatable',
    label: 'Holding a Security token whose underlying asset is non-zakatable',
    description: 'Holding a Security token whose underlying asset is non-zakatable (e.g., real estate kept as store of value). If the underlying asset is not subject to zakat, the token representing it is also exempt.',
  },
  {
    id: 'utility_tokens',
    label: 'Holding utility/platform tokens for actual use in a system',
    description: 'Holding utility/platform tokens for actual use in a system \u2014 not for trading or resale. Tokens used as access keys or for platform functionality are not trading stock.',
  },
  {
    id: 'asset_backed_non_zakatable',
    label: 'Holding an asset-backed token whose underlying asset is non-zakatable',
    description: 'Holding an asset-backed token whose underlying asset is non-zakatable (e.g., real estate kept as store of value). The zakat status follows the underlying asset.',
  },
  {
    id: 'governance_tokens',
    label: 'Holding governance tokens just for voting rights',
    description: 'Holding governance tokens just for voting rights. Tokens held purely for governance participation without trading intent are not zakatable.',
  },
];

const cryptoTypes: Array<{ value: CryptoType; label: string; badge: string; description: string }> = [
  {
    value: 'trading',
    label: 'Crypto for Trading',
    badge: 'Trading',
    description: 'Crypto assets held for trading. Zakat on 100% of market value.',
  },
  {
    value: 'security_tokens',
    label: 'Security Tokens (Dividends)',
    badge: 'Buy-and-Hold',
    description: 'Buy-and-hold security tokens for dividends. Zakat on holding value \u00d7 zakatable asset ratio.',
  },
  {
    value: 'asset_backed',
    label: 'Asset-Backed Tokens',
    badge: 'Buy-and-Hold',
    description: 'Buy-and-hold asset-backed tokens. Zakat on full holding value if underlying is zakatable.',
  },
];

type FormData = {
  cryptoType: CryptoType;
  cryptoName: string;
  marketValue: number;
  zakatableAssetRatio: number;
};

const CryptoCalculatorScreen: React.FC = () => {
  const setCalculatorData = useCalculatorStore((state) => state.setCalculatorData);
  const markAsCalculated = useCalculatorStore((state) => state.markAsCalculated);
  const existingData = useCalculatorStore((state) => state.calculators.crypto);
  const nisabMonetary = useNisabStore((state) => state.monetary);

  const [showLiabilityCheck, setShowLiabilityCheck] = useState(true);
  const [selectedExemptions, setSelectedExemptions] = useState<string[]>(
    existingData?.liabilityExemptions || []
  );

  const { control, watch, handleSubmit } = useForm<FormData>({
    defaultValues: {
      cryptoType: existingData?.cryptoType || 'trading',
      cryptoName: existingData?.cryptoName || '',
      marketValue: existingData?.marketValue || 0,
      zakatableAssetRatio: existingData?.zakatableAssetRatio || 0.3,
    },
  });

  const cryptoType = watch('cryptoType');
  const marketValue = watch('marketValue');
  const zakatableAssetRatio = watch('zakatableAssetRatio');
  const isExempt = selectedExemptions.length > 0;

  const calculationSummary = useMemo(() => {
    if (isExempt) {
      return { totalAssets: 0, totalDebts: 0, netAssets: 0, zakatDue: 0, isAboveNisab: false };
    }

    const mv = Number(marketValue) || 0;
    let totalAssets = mv;

    if (cryptoType === 'security_tokens') {
      totalAssets = mv * (Number(zakatableAssetRatio) || 0);
    }

    const isAboveNisab = totalAssets >= nisabMonetary;
    const zakatDue = isAboveNisab ? totalAssets * 0.025 : 0;
    return { totalAssets, totalDebts: 0, netAssets: totalAssets, zakatDue, isAboveNisab };
  }, [cryptoType, marketValue, zakatableAssetRatio, nisabMonetary, isExempt]);

  const toggleExemption = (id: string) => {
    setSelectedExemptions((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const onSave = (data: FormData) => {
    const cryptoData: CryptoData = {
      liabilityExemptions: selectedExemptions,
      cryptoType: data.cryptoType,
      cryptoName: data.cryptoName,
      marketValue: data.marketValue,
      zakatableAssetRatio: data.zakatableAssetRatio,
      calculated: true,
      zakatAmount: calculationSummary.zakatDue,
    };
    setCalculatorData('crypto', cryptoData);
    markAsCalculated('crypto');
  };

  const importantNotes = [
    'Crypto for trading: 100% of market value is zakatable.',
    'Security tokens: Apply zakatable asset ratio of underlying company.',
    'Asset-backed tokens: Full value zakatable if underlying asset is zakatable.',
    'Must hold for one lunar year (355 days).',
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
          <Text style={styles.modalSubtitle}>Check if any of these conditions apply to your Crypto Asset</Text>

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

      <CalculatorLayout title="Crypto Asset Zakat" calculationSummary={calculationSummary} importantNotes={importantNotes}>
        {isExempt && (
          <View style={styles.exemptBanner}>
            <Feather name="info" size={18} color={colors.amber[900]} />
            <View style={styles.exemptTextContainer}>
              <Text style={styles.exemptLabel}>Exemption Applied</Text>
              <Text style={styles.exemptDescription}>Based on your liability check, no Zakat is due on this crypto asset.</Text>
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

        {/* Crypto Type */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Select Crypto Type</Text>

          <Controller
            control={control}
            name="cryptoType"
            render={({ field: { onChange, value } }) => (
              <View style={styles.typeCard}>
                {cryptoTypes.map((type) => (
                  <TouchableOpacity key={type.value} style={styles.typeOption} onPress={() => onChange(type.value)} activeOpacity={0.7}>
                    <View style={styles.radioRow}>
                      <View style={[styles.radio, value === type.value && styles.radioSelected]}>
                        {value === type.value && <View style={styles.radioInner} />}
                      </View>
                      <View style={styles.typeTextContainer}>
                        <View style={styles.typeLabelRow}>
                          <Text style={[styles.typeLabel, value === type.value && styles.typeLabelSelected]}>{type.label}</Text>
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>{type.badge}</Text>
                          </View>
                        </View>
                        <Text style={styles.typeDescription}>{type.description}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* Crypto Details */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Crypto Details</Text>

          <View style={styles.detailsCard}>
            <Controller
              control={control}
              name="cryptoName"
              render={({ field: { onChange, value } }) => (
                <Input label="Crypto Name / Token" placeholder="e.g., Bitcoin" value={value} onChangeText={onChange} style={styles.input} />
              )}
            />

            <Controller
              control={control}
              name="marketValue"
              render={({ field: { onChange, value } }) => (
                <Input label="Market Value (S$)" placeholder="0" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(text) => onChange(parseFloat(text) || 0)} style={styles.input} />
              )}
            />

            {cryptoType === 'security_tokens' && (
              <Controller
                control={control}
                name="zakatableAssetRatio"
                render={({ field: { onChange, value } }) => (
                  <Input label="Zakatable Asset Ratio" placeholder="0.3" keyboardType="decimal-pad" value={value?.toString()} onChangeText={(text) => onChange(parseFloat(text) || 0)} helperText="Ratio of company's zakatable assets (0 to 1)" />
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
  typeLabelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4, flexWrap: 'wrap' },
  typeLabel: { fontSize: typography.fontSizes.base, fontWeight: typography.fontWeights.semibold, color: colors.gray[900] },
  typeLabelSelected: { color: colors.primary[700] },
  badge: { backgroundColor: colors.gray[100], paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  badgeText: { fontSize: typography.fontSizes.xs, color: colors.gray[700], fontWeight: typography.fontWeights.medium },
  typeDescription: { fontSize: typography.fontSizes.sm, color: colors.gray[600], lineHeight: 20 },
  detailsCard: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.gray[200] },
  input: { marginBottom: spacing.md },
  saveButton: { marginTop: spacing.md },
});

export default CryptoCalculatorScreen;
