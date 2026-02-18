import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  value?: string;
  selectedValue?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
  style?: ViewStyle;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = 'Select an option',
  options,
  value,
  selectedValue,
  onChange,
  onValueChange,
  error,
  containerStyle,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const resolvedValue = selectedValue || value;
  const resolvedOnChange = onValueChange || onChange;
  const selectedOption = options.find((option) => option.value === resolvedValue);

  const handleSelect = (optionValue: string) => {
    resolvedOnChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.trigger, error && styles.triggerError]}
        onPress={() => setIsOpen(true)}
      >
        <Text
          style={[
            styles.triggerText,
            !selectedOption && styles.triggerPlaceholder,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Feather
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.gray[500]}
        />
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || placeholder}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Feather name="x" size={24} color={colors.gray[700]} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === resolvedValue && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === resolvedValue && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === resolvedValue && (
                    <Feather name="check" size={20} color={colors.primary[700]} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  triggerError: {
    borderColor: colors.red[600],
  },
  triggerText: {
    fontSize: typography.fontSizes.base,
    color: colors.text.primary,
  },
  triggerPlaceholder: {
    color: colors.gray[500],
  },
  error: {
    fontSize: typography.fontSizes.xs,
    color: colors.red[600],
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    width: '80%',
    maxHeight: '60%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  optionSelected: {
    backgroundColor: colors.primary[50],
  },
  optionText: {
    fontSize: typography.fontSizes.base,
    color: colors.text.primary,
  },
  optionTextSelected: {
    color: colors.primary[700],
    fontWeight: typography.fontWeights.medium,
  },
});
