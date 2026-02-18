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
import { InsuranceData } from '../../types/calculator';

type FormData = {
  policies: Array<{
    id: string;
    policyName: string;
    policyType: 'endowment' | 'whole_life' | 'term_life' | 'health' | 'auto';
    surrenderValue: number;
  }>;
};

const policyTypeOptions = [
  { label: 'Endowment Policy', value: 'endowment' },
  { label: 'Whole Life Policy', value: 'whole_life' },
  { label: 'Term Life Policy', value: 'term_life' },
  { label: 'Health Insurance', value: 'health' },
  { label: 'Auto Insurance', value: 'auto' },
];

const InsuranceCalculatorScreen: React.FC = () => {
  const setCalculatorData = useCalculatorStore((state) => state.setCalculatorData);
  const markAsCalculated = useCalculatorStore((state) => state.markAsCalculated);
  const existingData = useCalculatorStore((state) => state.calculators.insurance);
  const nisabMonetary = useNisabStore((state) => state.monetary);

  const { control, watch, handleSubmit } = useForm<FormData>({
    defaultValues: {
      policies: existingData?.policies || [
        { id: '1', policyName: '', policyType: 'whole_life', surrenderValue: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'policies',
  });

  // Watch form values for real-time calculation
  const policies = watch('policies');

  // Calculate in real-time
  const calculationSummary = useMemo(() => {
    const totalAssets = policies.reduce(
      (sum, policy) => sum + (Number(policy.surrenderValue) || 0),
      0
    );
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
  }, [policies, nisabMonetary]);

  const handleAddPolicy = () => {
    append({
      id: Date.now().toString(),
      policyName: '',
      policyType: 'whole_life',
      surrenderValue: 0,
    });
  };

  const handleRemovePolicy = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSave = (data: FormData) => {
    const insuranceData: InsuranceData = {
      policies: data.policies,
      calculated: true,
      zakatAmount: calculationSummary.zakatDue,
    };

    setCalculatorData('insurance', insuranceData);
    markAsCalculated('insurance');
  };

  const importantNotes = [
    'Only policies with a surrender value are generally subject to Zakat.',
    'Term Life and Health Insurance typically have no surrender value, so Zakat may not apply.',
    'Endowment and Whole Life policies accumulate a cash/surrender value over time.',
    'Enter the current surrender value as stated by your insurance provider.',
    'Consult your policy documents or insurance agent for the exact surrender value.',
  ];

  return (
    <CalculatorLayout
      title="Insurance Zakat"
      calculationSummary={calculationSummary}
      importantNotes={importantNotes}
    >
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Insurance Policies</Text>
        <Text style={styles.sectionSubtitle}>
          Pay Zakat on your insurance policies. Only policies with a surrender value are generally subject to Zakat.
        </Text>

        {fields.map((field, index) => (
          <View key={field.id} style={styles.policyCard}>
            <View style={styles.policyHeader}>
              <Text style={styles.policyNumber}>Policy {index + 1}</Text>
              {fields.length > 1 && (
                <TouchableOpacity
                  onPress={() => handleRemovePolicy(index)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name="trash-2" size={18} color={colors.red[600]} />
                </TouchableOpacity>
              )}
            </View>

            {/* Policy Name */}
            <Controller
              control={control}
              name={`policies.${index}.policyName`}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Policy Name"
                  placeholder="e.g., Life Insurance Policy"
                  value={value}
                  onChangeText={onChange}
                  style={styles.input}
                />
              )}
            />

            {/* Policy Type */}
            <Controller
              control={control}
              name={`policies.${index}.policyType`}
              render={({ field: { onChange, value } }) => (
                <Dropdown
                  label="Policy Type"
                  options={policyTypeOptions}
                  selectedValue={value}
                  onValueChange={onChange}
                  style={styles.input}
                />
              )}
            />

            {/* Surrender Value */}
            <Controller
              control={control}
              name={`policies.${index}.surrenderValue`}
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Surrender Value (S$)"
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={value?.toString()}
                  onChangeText={(text) => {
                    const numValue = parseFloat(text) || 0;
                    onChange(numValue);
                  }}
                  icon={<Feather name="dollar-sign" size={16} color={colors.gray[400]} />}
                  helperText="Based on policy type"
                  style={styles.input}
                />
              )}
            />
          </View>
        ))}

        {/* Add Policy Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddPolicy}>
          <Feather name="plus-circle" size={20} color={colors.primary[600]} />
          <Text style={styles.addButtonText}>Add Policy</Text>
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
  policyCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  policyNumber: {
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

export default InsuranceCalculatorScreen;
