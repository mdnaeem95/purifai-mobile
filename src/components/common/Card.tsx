import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof spacing;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'lg',
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        styles[`container_${variant}`],
        { padding: spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    backgroundColor: colors.white,
  },
  container_default: {
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  container_elevated: {
    ...shadows.lg,
  },
  container_outlined: {
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
});
