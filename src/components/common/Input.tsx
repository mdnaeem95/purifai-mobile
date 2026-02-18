import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  helperText,
  containerStyle,
  icon,
  style,
  ...rest
}) => {
  const hintText = helperText || hint;
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            icon ? styles.inputWithIcon : undefined,
            error ? styles.inputError : undefined,
            style,
          ]}
          placeholderTextColor={colors.gray[500]}
          {...rest}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {hintText && !error && <Text style={styles.hint}>{hintText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSizes.base,
    color: colors.text.primary,
    backgroundColor: colors.white,
  },
  inputWithIcon: {
    paddingLeft: spacing['4xl'],
  },
  inputError: {
    borderColor: colors.red[600],
  },
  icon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  error: {
    fontSize: typography.fontSizes.xs,
    color: colors.red[600],
    marginTop: spacing.xs,
  },
  hint: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
});
