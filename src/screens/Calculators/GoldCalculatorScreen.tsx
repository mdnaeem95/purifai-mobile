import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { CalculatorLayout } from '../../components/calculator/CalculatorLayout';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useCalculatorStore } from '../../store/calculatorStore';
import { useNisabStore } from '../../store/nisabStore';
import { GoldData } from '../../types/calculator';

type FormData = {
  currentPricePerGram: number;
  personalUseGold: number;
  investmentGold: number;
  applyZakatOnPersonalGold: boolean;
};

const GoldCalculatorScreen: React.FC = () => {
  const setCalculatorData = useCalculatorStore((state) => state.setCalculatorData);
  const markAsCalculated = useCalculatorStore((state) => state.markAsCalculated);
  const existingData = useCalculatorStore((state) => state.calculators.gold);
  const goldWeight = useNisabStore((state) => state.goldWeight); // 86 grams

  const { control, watch, handleSubmit } = useForm<FormData>({
    defaultValues: {
      currentPricePerGram: existingData?.currentPricePerGram || 200.35,
      personalUseGold: existingData?.personalUseGold || 0,
      investmentGold: existingData?.investmentGold || 0,
      applyZakatOnPersonalGold: existingData?.applyZakatOnPersonalGold || false,
    },
  });

  // Watch form values for real-time calculation
  const currentPricePerGram = watch('currentPricePerGram');
  const personalUseGold = watch('personalUseGold');
  const investmentGold = watch('investmentGold');
  const applyZakatOnPersonalGold = watch('applyZakatOnPersonalGold');

  // Calculate in real-time using useMemo
  const calculationSummary = useMemo(() => {
    const personalGold = Number(personalUseGold) || 0;
    const investGold = Number(investmentGold) || 0;
    const pricePerGram = Number(currentPricePerGram) || 0;

    // Total zakatable gold based on whether personal gold is included
    const zakatableGold = applyZakatOnPersonalGold
      ? personalGold + investGold
      : investGold;

    const totalAssets = zakatableGold * pricePerGram;
    const totalDebts = 0; // No debts for gold
    const netAssets = totalAssets;
    const isAboveNisab = zakatableGold >= goldWeight; // 86 grams threshold
    const zakatDue = isAboveNisab ? netAssets * 0.025 : 0;

    return {
      totalAssets,
      totalDebts,
      netAssets,
      zakatDue,
      isAboveNisab,
    };
  }, [currentPricePerGram, personalUseGold, investmentGold, applyZakatOnPersonalGold, goldWeight]);

  const onSave = (data: FormData) => {
    const goldData: GoldData = {
      currentPricePerGram: data.currentPricePerGram,
      personalUseGold: data.personalUseGold,
      investmentGold: data.investmentGold,
      applyZakatOnPersonalGold: data.applyZakatOnPersonalGold,
      calculated: true,
      zakatAmount: calculationSummary.zakatDue,
    };

    // Save to store
    setCalculatorData('gold', goldData);
    markAsCalculated('gold');

    console.log('Gold Calculator Saved:', goldData);
  };

  const importantNotes = [
    'Nisab for gold is 86 grams (approximately 7.5 tolas).',
    'Investment gold (bars, coins) is always subject to Zakat.',
    'Personal jewelry: scholars differ on whether it\'s zakatable.',
    'Gold must be owned for a full lunar year (355 days).',
    'Use the checkbox to include personal jewelry if you follow the Hanafi opinion.',
  ];

  return (
    <CalculatorLayout
      title="Gold Calculator"
      calculationSummary={calculationSummary}
      importantNotes={importantNotes}
    >
      {/* Current Gold Price */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Current Gold Price</Text>
        <Text style={styles.sectionSubtitle}>
          Enter the current market price of gold per gram
        </Text>

        <Controller
          control={control}
          name="currentPricePerGram"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Current Gold Price per Gram (S$)"
              placeholder="200.35"
              keyboardType="decimal-pad"
              value={value?.toString()}
              onChangeText={(text) => {
                const numValue = parseFloat(text) || 0;
                onChange(numValue);
              }}
              icon={<Feather name="dollar-sign" size={16} color={colors.gray[400]} />}
              helperText="Current market price of gold per gram"
            />
          )}
        />
      </View>

      {/* Gold Details */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Gold Details</Text>
        <Text style={styles.sectionSubtitle}>
          Enter the weight of your gold holdings in grams
        </Text>

        <View style={styles.row}>
          <View style={styles.column}>
            <Controller
              control={control}
              name="personalUseGold"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Gold for Personal Use (grams)"
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={value?.toString()}
                  onChangeText={(text) => {
                    const numValue = parseFloat(text) || 0;
                    onChange(numValue);
                  }}
                  helperText="Jewelry and gold for personal use"
                  style={styles.input}
                />
              )}
            />
          </View>

          <View style={styles.column}>
            <Controller
              control={control}
              name="investmentGold"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Gold for Investment (grams)"
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={value?.toString()}
                  onChangeText={(text) => {
                    const numValue = parseFloat(text) || 0;
                    onChange(numValue);
                  }}
                  helperText="Gold bars, coins, investment gold"
                  style={styles.input}
                />
              )}
            />
          </View>
        </View>

        {/* Hanafi Method Checkbox */}
        <Controller
          control={control}
          name="applyZakatOnPersonalGold"
          render={({ field: { onChange, value } }) => (
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  value && styles.checkboxChecked,
                ]}
                onTouchEnd={() => onChange(!value)}
              >
                {value && (
                  <Feather name="check" size={16} color={colors.white} />
                )}
              </View>
              <View style={styles.checkboxTextContainer}>
                <Text style={styles.checkboxLabel}>
                  Apply Zakat on Personal Use Gold
                </Text>
                <Text style={styles.checkboxHelper}>
                  The Hanafi madhhab includes personal jewelry in Zakat calculation. Check this if you follow this opinion.
                </Text>
              </View>
            </View>
          )}
        />
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  column: {
    flex: 1,
  },
  input: {
    marginBottom: spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    backgroundColor: colors.amber[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.amber[200],
    gap: spacing.md,
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
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.amber[900],
    marginBottom: spacing.xs,
  },
  checkboxHelper: {
    fontSize: typography.fontSizes.sm,
    color: colors.amber[800],
    lineHeight: 20,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});

export default GoldCalculatorScreen;
