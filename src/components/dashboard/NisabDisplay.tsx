import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { useNisabStore } from '../../store/nisabStore';
import { formatCurrency, formatWeight } from '../../utils/formatters';

export const NisabDisplay: React.FC = () => {
  const monetary = useNisabStore((state) => state.monetary);
  const goldWeight = useNisabStore((state) => state.goldWeight);

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <Feather name="info" size={20} color={colors.emerald[600]} />
        <View style={styles.headerText}>
          <Text style={styles.title}>Current Nisab Threshold</Text>
          <Text style={styles.subtitle}>Minimum amount for Zakat obligation</Text>
        </View>
      </View>

      <View style={styles.badgesRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeValue}>{formatCurrency(monetary)}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeValue}>{formatWeight(goldWeight)} of Gold</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary[500],
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray[600],
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  badge: {
    flex: 1,
    backgroundColor: colors.emerald[100],
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  badgeValue: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.emerald[800],
  },
});
