import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
}) => {
  const containerStyles: ViewStyle[] = [
    styles.container,
    styles[`container_${variant}`],
    styles[`container_${size}`],
    disabled && styles.containerDisabled,
    fullWidth && styles.fullWidth,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    disabled && styles.textDisabled,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.white : colors.primary[700]}
        />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },

  // Variants
  container_primary: {
    backgroundColor: colors.primary[700],
  },
  container_secondary: {
    backgroundColor: colors.gray[100],
  },
  container_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[700],
  },
  container_danger: {
    backgroundColor: colors.red[600],
  },

  // Sizes
  container_sm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  container_md: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  container_lg: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },

  // Text styles
  text: {
    fontWeight: typography.fontWeights.medium,
  },
  text_primary: {
    color: colors.white,
  },
  text_secondary: {
    color: colors.gray[700],
  },
  text_outline: {
    color: colors.primary[700],
  },
  text_danger: {
    color: colors.white,
  },
  text_sm: {
    fontSize: typography.fontSizes.sm,
  },
  text_md: {
    fontSize: typography.fontSizes.base,
  },
  text_lg: {
    fontSize: typography.fontSizes.lg,
  },

  // Disabled
  containerDisabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.7,
  },

  // Full width
  fullWidth: {
    width: '100%',
  },
});
