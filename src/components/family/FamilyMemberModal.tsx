import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Input } from '../common/Input';
import { Dropdown } from '../common/Dropdown';
import { Button } from '../common/Button';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { Relationship, RELATIONSHIP_OPTIONS } from '../../types/family';

interface FamilyMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, relationship: Relationship) => void;
  onDelete?: () => void;
  initialName?: string;
  initialRelationship?: Relationship;
  mode: 'add' | 'edit';
}

export const FamilyMemberModal: React.FC<FamilyMemberModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  initialName = '',
  initialRelationship = 'son',
  mode,
}) => {
  const [name, setName] = useState(initialName);
  const [relationship, setRelationship] = useState<Relationship>(initialRelationship);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setRelationship(initialRelationship);
    }
  }, [visible, initialName, initialRelationship]);

  // Exclude 'self' from options when adding/editing
  const relationshipOptions = RELATIONSHIP_OPTIONS
    .filter((o) => o.value !== 'self')
    .map((o) => ({ label: o.label, value: o.value }));

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Name Required', 'Please enter a name for this family member.');
      return;
    }
    onSave(trimmedName, relationship);
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove Family Member',
      `Are you sure you want to remove this member? All their calculator data and payment history will be permanently deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            onDelete?.();
            onClose();
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container} onStartShouldSetResponder={() => true}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {mode === 'add' ? 'Add Family Member' : 'Edit Family Member'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.gray[700]} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Name"
              placeholder="Enter name"
              value={name}
              onChangeText={setName}
            />
            <Dropdown
              label="Relationship"
              options={relationshipOptions}
              value={relationship}
              onChange={(val) => setRelationship(val as Relationship)}
              placeholder="Select relationship"
            />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title={mode === 'add' ? 'Add Member' : 'Save Changes'}
              onPress={handleSave}
              variant="primary"
              size="lg"
              fullWidth
            />
            {mode === 'edit' && onDelete && (
              <Button
                title="Remove Member"
                onPress={handleDelete}
                variant="danger"
                size="md"
                fullWidth
                style={{ marginTop: spacing.md }}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    width: '85%',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
});
