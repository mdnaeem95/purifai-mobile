import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../common/Header';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { useNisabStore } from '../../store/nisabStore';
import { formatCurrency } from '../../utils/formatters';
import { Feather } from '@expo/vector-icons';

interface CalculatorLayoutProps {
  title: string;
  children: React.ReactNode;
  calculationSummary?: {
    totalAssets: number;
    totalDebts: number;
    netAssets: number;
    zakatDue: number;
    isAboveNisab: boolean;
  };
  importantNotes?: string[];
}

export const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({
  title,
  children,
  calculationSummary,
  importantNotes,
}) => {
  const monetary = useNisabStore((state) => state.monetary);

  return (
    <View style={styles.container}>
      <Header title={title} />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Nisab Threshold Info */}
        <View style={styles.nisabCard}>
          <View style={styles.nisabHeader}>
            <Feather name="info" size={18} color={colors.emerald[600]} />
            <Text style={styles.nisabText}>
              Nisab Threshold: <Text style={styles.nisabValue}>{formatCurrency(monetary)}</Text>
            </Text>
          </View>
          <Text style={styles.nisabSubtext}>
            Zakat is due if net assets exceed this amount
          </Text>
        </View>

        {/* Form Content */}
        {children}

        {/* Calculation Summary */}
        {calculationSummary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Calculation Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Assets:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(calculationSummary.totalAssets)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Deductible Debts:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(calculationSummary.totalDebts)}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelBold}>Net Assets:</Text>
              <Text style={styles.summaryValueBold}>
                {formatCurrency(calculationSummary.netAssets)}
              </Text>
            </View>

            <View style={[styles.summaryRow, styles.summaryRowHighlight]}>
              <View style={styles.zakatLabelContainer}>
                <Feather name="check-circle" size={20} color={colors.primary[600]} />
                <Text style={styles.zakatLabel}>Zakat Due (2.5%):</Text>
              </View>
              <Text style={styles.zakatValue}>
                {formatCurrency(calculationSummary.zakatDue)}
              </Text>
            </View>

            {/* Nisab Status */}
            <View style={[
              styles.statusBadge,
              calculationSummary.isAboveNisab ? styles.statusBadgeSuccess : styles.statusBadgeWarning
            ]}>
              <Feather
                name={calculationSummary.isAboveNisab ? "check-circle" : "info"}
                size={16}
                color={calculationSummary.isAboveNisab ? colors.emerald[700] : colors.gray[700]}
              />
              <Text style={[
                styles.statusBadgeText,
                calculationSummary.isAboveNisab ? styles.statusBadgeTextSuccess : styles.statusBadgeTextWarning
              ]}>
                {calculationSummary.isAboveNisab
                  ? "Above Nisab - Zakat is due"
                  : "Below Nisab - Zakat not obligatory"}
              </Text>
            </View>
          </View>
        )}

        {/* Important Notes */}
        {importantNotes && importantNotes.length > 0 && (
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Feather name="alert-circle" size={18} color={colors.primary[600]} />
              <Text style={styles.notesTitle}>Important Notes</Text>
            </View>
            {importantNotes.map((note, index) => (
              <View key={index} style={styles.noteItem}>
                <Text style={styles.noteBullet}>•</Text>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  nisabCard: {
    backgroundColor: colors.emerald[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.emerald[200],
  },
  nisabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  nisabText: {
    fontSize: typography.fontSizes.sm,
    color: colors.emerald[800],
  },
  nisabValue: {
    fontWeight: typography.fontWeights.semibold,
  },
  nisabSubtext: {
    fontSize: typography.fontSizes.xs,
    color: colors.emerald[700],
    marginLeft: 26,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  summaryTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[700],
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSizes.base,
    color: colors.gray[600],
  },
  summaryValue: {
    fontSize: typography.fontSizes.base,
    color: colors.gray[900],
    fontWeight: typography.fontWeights.medium,
  },
  summaryLabelBold: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray[700],
  },
  summaryValueBold: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.gray[900],
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: spacing.sm,
  },
  summaryRowHighlight: {
    backgroundColor: colors.primary[50],
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  zakatLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  zakatLabel: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[700],
  },
  zakatValue: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[700],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  statusBadgeSuccess: {
    backgroundColor: colors.emerald[100],
  },
  statusBadgeWarning: {
    backgroundColor: colors.gray[100],
  },
  statusBadgeText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  statusBadgeTextSuccess: {
    color: colors.emerald[800],
  },
  statusBadgeTextWarning: {
    color: colors.gray[700],
  },
  notesCard: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  notesTitle: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary[700],
  },
  noteItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  noteBullet: {
    fontSize: typography.fontSizes.base,
    color: colors.primary[600],
    marginRight: spacing.sm,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.primary[800],
    lineHeight: 20,
  },
});
