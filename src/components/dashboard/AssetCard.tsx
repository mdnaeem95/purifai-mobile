import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { useCalculatorStore } from '../../store/calculatorStore';
import { CalculatorType } from '../../types/calculator';

interface AssetCardProps {
  id: CalculatorType;
  name: string;
  icon: string;
  description: string;
  route: string;
}

export const AssetCard: React.FC<AssetCardProps> = ({
  id,
  name,
  icon,
  description,
  route,
}) => {
  const navigation = useNavigation<any>();
  const selectedCalculators = useCalculatorStore((state) => state.selectedCalculators);
  const calculatedCalculators = useCalculatorStore((state) => state.calculatedCalculators);
  const toggleCalculatorSelection = useCalculatorStore(
    (state) => state.toggleCalculatorSelection
  );

  const isSelected = selectedCalculators.includes(id);
  const isCalculated = calculatedCalculators.includes(id);

  const handlePress = () => {
    navigation.navigate(route);
  };

  const handleCheckboxPress = () => {
    toggleCalculatorSelection(id);
  };

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkbox}
          onPress={handleCheckboxPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View
            style={[
              styles.checkboxInner,
              isSelected && styles.checkboxInnerSelected,
            ]}
          >
            {isSelected && (
              <Feather name="check" size={16} color={colors.white} />
            )}
          </View>
        </TouchableOpacity>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <Feather name={icon as any} size={20} color={colors.primary[700]} />
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.status} numberOfLines={1}>
            {isCalculated ? 'Calculated' : 'Not calculated'}
          </Text>
        </View>
      </View>

      {/* Tooltip on hover (description) */}
      {/* Note: Tooltips work better on web, on mobile we can show description on long press */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  containerSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: spacing.sm,
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInnerSelected: {
    backgroundColor: colors.primary[700],
    borderColor: colors.primary[700],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray[900],
    marginBottom: 2,
  },
  status: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[400],
  },
});
