import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useUserStore } from '../../store/userStore';
import { useFamilyStore } from '../../store/familyStore';
import { useCalculatorStore } from '../../store/calculatorStore';
import { usePaymentStore } from '../../store/paymentStore';
import { RELATIONSHIP_LABELS } from '../../types/family';
import type { FamilyMember } from '../../types/family';

interface HeaderProps {
  title?: string;
  showMenu?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Purifai',
  showMenu = true,
}) => {
  const navigation = useNavigation();
  const logout = useUserStore((state) => state.logout);
  const insets = useSafeAreaInsets();

  const members = useFamilyStore((s) => s.members);
  const currentMemberId = useFamilyStore((s) => s.currentMemberId);
  const switchMember = useFamilyStore((s) => s.switchMember);
  const loadCalculators = useCalculatorStore((s) => s.loadCalculators);
  const loadPayments = usePaymentStore((s) => s.loadPayments);

  const currentMember = members.find((m) => m.id === currentMemberId);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleSwitchMember = async (memberId: string) => {
    if (memberId === currentMemberId) {
      setDropdownOpen(false);
      return;
    }
    await switchMember(memberId);
    await loadCalculators();
    await loadPayments();
    setDropdownOpen(false);
  };

  const renderMemberOption = ({ item }: { item: FamilyMember }) => (
    <TouchableOpacity
      style={[styles.memberOption, item.id === currentMemberId && styles.memberOptionActive]}
      onPress={() => handleSwitchMember(item.id)}
      activeOpacity={0.6}
    >
      <View style={[styles.memberAvatar, item.id === currentMemberId && styles.memberAvatarActive]}>
        <Text style={[styles.memberAvatarText, item.id === currentMemberId && styles.memberAvatarTextActive]}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberOptionInfo}>
        <Text style={styles.memberOptionName}>{item.name}</Text>
        <Text style={styles.memberOptionRelationship}>
          {RELATIONSHIP_LABELS[item.relationship]}
        </Text>
      </View>
      {item.id === currentMemberId && (
        <Feather name="check" size={18} color={colors.primary[700]} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Left: Menu Button */}
        {showMenu && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleMenuPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="menu" size={24} color={colors.gray[700]} />
          </TouchableOpacity>
        )}

        {/* Center: Logo and Title */}
        <View style={styles.centerContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>P</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Member Switcher Pill */}
        {members.length > 0 && (
          <TouchableOpacity
            style={styles.memberPill}
            onPress={() => setDropdownOpen(true)}
            activeOpacity={0.7}
          >
            <Feather name="user" size={12} color={colors.primary[700]} />
            <Text style={styles.memberPillText} numberOfLines={1}>
              {currentMember?.name || 'Self'}
            </Text>
            <Feather name="chevron-down" size={12} color={colors.gray[400]} />
          </TouchableOpacity>
        )}

        {/* Right: Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="log-out" size={20} color={colors.gray[600]} />
        </TouchableOpacity>
      </View>

      {/* Member Dropdown Modal */}
      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setDropdownOpen(false)}
        >
          <View style={[styles.memberDropdown, { marginTop: insets.top + 70 }]}>
            <Text style={styles.memberDropdownTitle}>Switch Member</Text>
            <FlatList
              data={members}
              keyExtractor={(item) => item.id}
              renderItem={renderMemberOption}
              scrollEnabled={members.length > 5}
              style={members.length > 5 ? { maxHeight: 300 } : undefined}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    ...shadows.sm,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 52,
    gap: spacing.sm,
  },
  menuButton: {
    padding: spacing.xs,
  },
  centerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  logoText: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.sm,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[500],
  },
  logoutButton: {
    padding: spacing.xs,
  },

  // Member Pill
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 4,
    maxWidth: 120,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  memberPillText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
    color: colors.primary[700],
    maxWidth: 70,
  },

  // Dropdown Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  memberDropdown: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  memberDropdownTitle: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  memberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  memberOptionActive: {
    backgroundColor: colors.primary[50],
  },
  memberAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarActive: {
    backgroundColor: colors.primary[700],
  },
  memberAvatarText: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray[600],
  },
  memberAvatarTextActive: {
    color: colors.white,
  },
  memberOptionInfo: {
    flex: 1,
  },
  memberOptionName: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  memberOptionRelationship: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
});
