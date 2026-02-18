import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { CALCULATORS } from '../constants/calculators';

// Map calculator route names to their icons (matching the drawer screen options)
const CALCULATOR_ICONS: Record<string, string> = {};
CALCULATORS.forEach((calc) => {
  CALCULATOR_ICONS[calc.route] = calc.icon;
});

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const [calculatorsExpanded, setCalculatorsExpanded] = useState(false);
  const insets = useSafeAreaInsets();

  const { state, navigation } = props;
  const activeRoute = state.routes[state.index]?.name;

  // Check if any calculator screen is currently active
  const isCalculatorActive = CALCULATORS.some((c) => c.route === activeRoute);

  const navigateTo = (route: string) => {
    navigation.navigate(route);
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.sm }]}
    >
      {/* Main Section */}
      <View style={styles.section}>
        <DrawerItem
          label="Dashboard"
          icon={({ color, size }) => <Feather name="grid" size={size} color={color} />}
          focused={activeRoute === 'Dashboard'}
          activeTintColor={colors.primary[700]}
          activeBackgroundColor={colors.primary[50]}
          inactiveTintColor={colors.gray[700]}
          onPress={() => navigateTo('Dashboard')}
          style={styles.drawerItem}
          labelStyle={styles.drawerLabel}
        />
        <DrawerItem
          label="Paid Zakat"
          icon={({ color, size }) => <Feather name="file-text" size={size} color={color} />}
          focused={activeRoute === 'PaidZakat'}
          activeTintColor={colors.primary[700]}
          activeBackgroundColor={colors.primary[50]}
          inactiveTintColor={colors.gray[700]}
          onPress={() => navigateTo('PaidZakat')}
          style={styles.drawerItem}
          labelStyle={styles.drawerLabel}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Calculators Section (Collapsible) */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[
            styles.sectionHeader,
            isCalculatorActive && !calculatorsExpanded && styles.sectionHeaderActive,
          ]}
          onPress={() => setCalculatorsExpanded(!calculatorsExpanded)}
          activeOpacity={0.7}
        >
          <View style={styles.sectionHeaderLeft}>
            <Feather
              name="layers"
              size={20}
              color={isCalculatorActive ? colors.primary[700] : colors.gray[600]}
            />
            <Text
              style={[
                styles.sectionHeaderText,
                isCalculatorActive && styles.sectionHeaderTextActive,
              ]}
            >
              Calculators
            </Text>
          </View>
          <View style={styles.sectionHeaderRight}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>16</Text>
            </View>
            <Feather
              name={calculatorsExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={colors.gray[500]}
            />
          </View>
        </TouchableOpacity>

        {calculatorsExpanded && (
          <View style={styles.collapsibleContent}>
            {CALCULATORS.map((calc) => {
              const isActive = activeRoute === calc.route;
              return (
                <TouchableOpacity
                  key={calc.id}
                  style={[styles.nestedItem, isActive && styles.nestedItemActive]}
                  onPress={() => navigateTo(calc.route)}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={calc.icon as any}
                    size={16}
                    color={isActive ? colors.primary[700] : colors.gray[500]}
                  />
                  <Text
                    style={[styles.nestedItemLabel, isActive && styles.nestedItemLabelActive]}
                    numberOfLines={1}
                  >
                    {calc.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Payment Section */}
      <View style={styles.section}>
        <DrawerItem
          label="Pay Zakat"
          icon={({ color, size }) => <Feather name="credit-card" size={size} color={color} />}
          focused={activeRoute === 'PayZakat'}
          activeTintColor={colors.primary[700]}
          activeBackgroundColor={colors.primary[50]}
          inactiveTintColor={colors.gray[700]}
          onPress={() => navigateTo('PayZakat')}
          style={styles.drawerItem}
          labelStyle={styles.drawerLabel}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Settings Section */}
      <View style={styles.section}>
        <DrawerItem
          label="Settings"
          icon={({ color, size }) => <Feather name="settings" size={size} color={color} />}
          focused={activeRoute === 'Settings'}
          activeTintColor={colors.primary[700]}
          activeBackgroundColor={colors.primary[50]}
          inactiveTintColor={colors.gray[700]}
          onPress={() => navigateTo('Settings')}
          style={styles.drawerItem}
          labelStyle={styles.drawerLabel}
        />
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.md,
  },
  sectionHeaderActive: {
    backgroundColor: colors.primary[50],
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionHeaderText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.gray[700],
  },
  sectionHeaderTextActive: {
    color: colors.primary[700],
    fontWeight: typography.fontWeights.semibold,
  },
  badge: {
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray[600],
  },
  drawerItem: {
    borderRadius: borderRadius.md,
    marginVertical: 1,
  },
  drawerLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
  },
  collapsibleContent: {
    paddingLeft: spacing.xl,
    paddingRight: spacing.xs,
    paddingTop: spacing.xs,
  },
  nestedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  nestedItemActive: {
    backgroundColor: colors.primary[50],
  },
  nestedItemLabel: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.gray[700],
  },
  nestedItemLabelActive: {
    color: colors.primary[700],
    fontWeight: typography.fontWeights.semibold,
  },
});

export default CustomDrawerContent;
