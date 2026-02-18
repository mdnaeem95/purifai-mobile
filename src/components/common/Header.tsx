import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from '../../constants/theme';
import { useUserStore } from '../../store/userStore';

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

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

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

        {/* Right: Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="log-out" size={20} color={colors.gray[600]} />
        </TouchableOpacity>
      </View>
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
    paddingVertical: spacing.lg,
    minHeight: 60,
  },
  menuButton: {
    padding: spacing.xs,
  },
  centerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primary[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  logoText: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.base,
  },
  title: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[500],
  },
  logoutButton: {
    padding: spacing.xs,
  },
});
