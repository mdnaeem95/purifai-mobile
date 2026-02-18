import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { CalculatorLayout } from '../../components/calculator/CalculatorLayout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useCalculatorStore } from '../../store/calculatorStore';
import { useNisabStore } from '../../store/nisabStore';
import { SukukData, SukukType } from '../../types/calculator';

const sukukTypes: Array<{
  value: SukukType;
  label: string;
  description: string;
}> = [
  {
    value: 'al_ijarah',
    label: 'Al Ijarah',
    description: 'Rental-based sukuk. Zakat on remaining rental income at due date.',
  },
  {
    value: 'al_musharakah',
    label: 'Al Musharakah',
    description: 'Partnership sukuk. Zakat on sukuk value multiplied by zakatable asset percentage.',
  },
  {
    value: 'al_mudharabah',
    label: 'Al Mudharabah',
    description: 'Profit-sharing sukuk. Zakat on market value plus profit share received.',
  },
  {
    value: 'al_murabahah',
    label: 'Al Murabahah',
    description: 'Cost-plus sukuk. Zakat on total outstanding receivable if collectible.',
  },
  {
    value: 'al_istisna',
    label: 'Al Istisna',
    description: 'Manufacturing sukuk. Zakat on total income from goods (entire cash amount).',
  },
];

type FormData = {
  sukukType: SukukType;
  rentalIncomeReceived: number;
  remainingAtDueDate: number;
  sukukValue: number;
  zakatableAssetPercentage: number;
  marketValue: number;
  profitShareReceived: number;
  outstandingReceivable: number;
  totalIncomeFromGoods: number;
};

const SukukCalculatorScreen: React.FC = () => {
  const setCalculatorData = useCalculatorStore((state) => state.setCalculatorData);
  const markAsCalculated = useCalculatorStore((state) => state.markAsCalculated);
  const existingData = useCalculatorStore((state) => state.calculators.sukuk);
  const nisabMonetary = useNisabStore((state) => state.monetary);

  const { control, watch, handleSubmit } = useForm<FormData>({
    defaultValues: {
      sukukType: existingData?.sukukType || 'al_ijarah',
      rentalIncomeReceived: existingData?.rentalIncomeReceived || 0,
      remainingAtDueDate: existingData?.remainingAtDueDate || 0,
      sukukValue: existingData?.sukukValue || 0,
      zakatableAssetPercentage: existingData?.zakatableAssetPercentage || 0,
      marketValue: existingData?.marketValue || 0,
      profitShareReceived: existingData?.profitShareReceived || 0,
      outstandingReceivable: existingData?.outstandingReceivable || 0,
      totalIncomeFromGoods: existingData?.totalIncomeFromGoods || 0,
    },
  });

  const sukukType = watch('sukukType');
  const rentalIncomeReceived = watch('rentalIncomeReceived');
  const remainingAtDueDate = watch('remainingAtDueDate');
  const sukukValue = watch('sukukValue');
  const zakatableAssetPercentage = watch('zakatableAssetPercentage');
  const marketValue = watch('marketValue');
  const profitShareReceived = watch('profitShareReceived');
  const outstandingReceivable = watch('outstandingReceivable');
  const totalIncomeFromGoods = watch('totalIncomeFromGoods');

  const calculationSummary = useMemo(() => {
    let totalAssets = 0;

    switch (sukukType) {
      case 'al_ijarah':
        totalAssets = Number(remainingAtDueDate) || 0;
        break;
      case 'al_musharakah':
        totalAssets = (Number(sukukValue) || 0) * (Number(zakatableAssetPercentage) || 0);
        break;
      case 'al_mudharabah':
        totalAssets = (Number(marketValue) || 0) + (Number(profitShareReceived) || 0);
        break;
      case 'al_murabahah':
        totalAssets = Number(outstandingReceivable) || 0;
        break;
      case 'al_istisna':
        totalAssets = Number(totalIncomeFromGoods) || 0;
        break;
    }

    const netAssets = totalAssets;
    const isAboveNisab = netAssets >= nisabMonetary;
    const zakatDue = isAboveNisab ? netAssets * 0.025 : 0;

    return { totalAssets, totalDebts: 0, netAssets, zakatDue, isAboveNisab };
  }, [
    sukukType, rentalIncomeReceived, remainingAtDueDate, sukukValue,
    zakatableAssetPercentage, marketValue, profitShareReceived,
    outstandingReceivable, totalIncomeFromGoods, nisabMonetary,
  ]);

  const onSave = (data: FormData) => {
    const sukukData: SukukData = {
      sukukType: data.sukukType,
      rentalIncomeReceived: data.rentalIncomeReceived,
      remainingAtDueDate: data.remainingAtDueDate,
      sukukValue: data.sukukValue,
      zakatableAssetPercentage: data.zakatableAssetPercentage,
      marketValue: data.marketValue,
      profitShareReceived: data.profitShareReceived,
      outstandingReceivable: data.outstandingReceivable,
      totalIncomeFromGoods: data.totalIncomeFromGoods,
      calculated: true,
      zakatAmount: calculationSummary.zakatDue,
    };
    setCalculatorData('sukuk', sukukData);
    markAsCalculated('sukuk');
  };

  const selectedTypeLabel = sukukTypes.find((t) => t.value === sukukType)?.label || '';

  const importantNotes = [
    'Must hold sukuk for one lunar year (355 days).',
    'Different sukuk types have different zakat calculation methods.',
    'Zakat rate is 2.5% applied to the zakatable amount.',
  ];

  return (
    <CalculatorLayout
      title="Sukuk Zakat"
      calculationSummary={calculationSummary}
      importantNotes={importantNotes}
    >
      {/* Select Sukuk Type */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Select Sukuk Type</Text>

        <Controller
          control={control}
          name="sukukType"
          render={({ field: { onChange, value } }) => (
            <View style={styles.typeCard}>
              {sukukTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={styles.typeOption}
                  onPress={() => onChange(type.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioRow}>
                    <View style={[styles.radio, value === type.value && styles.radioSelected]}>
                      {value === type.value && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.typeTextContainer}>
                      <Text style={[
                        styles.typeLabel,
                        value === type.value && styles.typeLabelSelected,
                      ]}>
                        {type.label}
                      </Text>
                      <Text style={styles.typeDescription}>{type.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      {/* Dynamic Details Section */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>{selectedTypeLabel} Details</Text>

        <View style={styles.detailsCard}>
          {/* Al Ijarah */}
          {sukukType === 'al_ijarah' && (
            <>
              <Controller
                control={control}
                name="rentalIncomeReceived"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Rental Income Received (S$)"
                    placeholder="0"
                    keyboardType="decimal-pad"
                    value={value?.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    style={styles.input}
                  />
                )}
              />
              <Controller
                control={control}
                name="remainingAtDueDate"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Remaining at Zakat Due Date (S$)"
                    placeholder="0"
                    keyboardType="decimal-pad"
                    value={value?.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  />
                )}
              />
            </>
          )}

          {/* Al Musharakah */}
          {sukukType === 'al_musharakah' && (
            <>
              <Controller
                control={control}
                name="sukukValue"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Sukuk Value (S$)"
                    placeholder="0"
                    keyboardType="decimal-pad"
                    value={value?.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    style={styles.input}
                  />
                )}
              />
              <Controller
                control={control}
                name="zakatableAssetPercentage"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Zakatable Asset Percentage"
                    placeholder="0.3"
                    keyboardType="decimal-pad"
                    value={value?.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    helperText="Ratio of zakatable assets (0 to 1)"
                  />
                )}
              />
            </>
          )}

          {/* Al Mudharabah */}
          {sukukType === 'al_mudharabah' && (
            <>
              <Controller
                control={control}
                name="marketValue"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Market Value (S$)"
                    placeholder="0"
                    keyboardType="decimal-pad"
                    value={value?.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    style={styles.input}
                  />
                )}
              />
              <Controller
                control={control}
                name="profitShareReceived"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Profit Share Received (S$)"
                    placeholder="0"
                    keyboardType="decimal-pad"
                    value={value?.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  />
                )}
              />
            </>
          )}

          {/* Al Murabahah */}
          {sukukType === 'al_murabahah' && (
            <Controller
              control={control}
              name="outstandingReceivable"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Total Outstanding Receivable (S$)"
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={value?.toString()}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  helperText="Only if collectible"
                />
              )}
            />
          )}

          {/* Al Istisna */}
          {sukukType === 'al_istisna' && (
            <Controller
              control={control}
              name="totalIncomeFromGoods"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Total Income from Goods (S$)"
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={value?.toString()}
                  onChangeText={(text) => onChange(parseFloat(text) || 0)}
                  helperText="Entire cash amount from goods"
                />
              )}
            />
          )}
        </View>
      </View>

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

export default SukukCalculatorScreen;
