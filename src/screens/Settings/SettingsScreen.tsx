import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Header } from '../../components/common/Header';
import { colors, spacing, typography, borderRadius, shadows } from '../../constants/theme';
import { useUserStore } from '../../store/userStore';
import { useCalculatorStore } from '../../store/calculatorStore';
import { usePaymentStore } from '../../store/paymentStore';
import { useNisabStore } from '../../store/nisabStore';
import { ZAKAT_RATE } from '../../constants/nisab';

// --- Setting Row Component ---

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  showChevron?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({
  icon,
  label,
  value,
  onPress,
  danger = false,
  showChevron = false,
}) => {
  const content = (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, danger && styles.settingIconDanger]}>
        <Feather
          name={icon as any}
          size={18}
          color={danger ? colors.red[600] : colors.primary[600]}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>
          {label}
        </Text>
        {value ? (
          <Text style={styles.settingValue} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
      </View>
      {showChevron && (
        <Feather name="chevron-right" size={18} color={colors.gray[400]} />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

// --- Section Component ---

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

const Divider = () => <View style={styles.divider} />;

// --- Main Screen ---

const SettingsScreen: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);
  const calculatedCalculators = useCalculatorStore((s) => s.calculatedCalculators);
  const resetAll = useCalculatorStore((s) => s.resetAll);
  const payments = usePaymentStore((s) => s.payments);
  const clearPayments = usePaymentStore((s) => s.clearPayments);
  const nisab = useNisabStore();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-SG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) =>
    `SGD ${amount.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // --- Handlers ---

  const handleResetCalculators = () => {
    Alert.alert(
      'Reset All Calculators',
      'This will clear all your calculator data and Zakat calculations. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetAll();
            Alert.alert('Done', 'All calculator data has been reset.');
          },
        },
      ],
    );
  };

  const handleClearPayments = () => {
    Alert.alert(
      'Clear Payment History',
      'This will remove all payment records. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearPayments();
            Alert.alert('Done', 'Payment history has been cleared.');
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data including calculators and payment history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await resetAll();
            await clearPayments();
            logout();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Settings</Text>

        {/* --- Profile --- */}
        <Section title="Profile">
          <SettingRow icon="user" label="Name" value={user?.name || '—'} />
          <Divider />
          <SettingRow icon="mail" label="Email" value={user?.email || '—'} />
          <Divider />
          <SettingRow
            icon="calendar"
            label="Member Since"
            value={user?.createdAt ? formatDate(user.createdAt) : '—'}
          />
        </Section>

        {/* --- Zakat Configuration --- */}
        <Section title="Zakat Configuration">
          <SettingRow
            icon="target"
            label="Nisab Threshold"
            value={formatCurrency(nisab.monetary)}
          />
          <Divider />
          <SettingRow
            icon="database"
            label="Gold Price"
            value={`SGD ${nisab.goldPrice.toFixed(2)} / gram`}
          />
          <Divider />
          <SettingRow
            icon="package"
            label="Gold Weight (Nisab)"
            value={`${nisab.goldWeight}g`}
          />
          <Divider />
          <SettingRow
            icon="percent"
            label="Zakat Rate"
            value={`${(ZAKAT_RATE * 100).toFixed(1)}%`}
          />
          <Divider />
          <SettingRow
            icon="clock"
            label="Last Updated"
            value={nisab.updatedDate ? formatDate(nisab.updatedDate) : '—'}
          />
        </Section>

        {/* --- Data Management --- */}
        <Section title="Data Management">
          <SettingRow
            icon="layers"
            label="Calculators Used"
            value={`${calculatedCalculators.length} of 16`}
          />
          <Divider />
          <SettingRow
            icon="credit-card"
            label="Payment Records"
            value={`${payments.length}`}
          />
          <Divider />
          <SettingRow
            icon="refresh-cw"
            label="Reset All Calculators"
            onPress={handleResetCalculators}
            danger
            showChevron
          />
          <Divider />
          <SettingRow
            icon="trash-2"
            label="Clear Payment History"
            onPress={handleClearPayments}
            danger
            showChevron
          />
        </Section>

        {/* --- About --- */}
        <Section title="About">
          <SettingRow icon="info" label="Version" value="1.0.0" />
          <Divider />
          <SettingRow icon="code" label="Built with" value="React Native & Expo" />
          <Divider />
          <SettingRow icon="heart" label="Tagline" value="Zakat Made Simple" />
        </Section>

        {/* --- Account --- */}
        <Section title="Account">
          <SettingRow
            icon="log-out"
            label="Logout"
            onPress={handleLogout}
            showChevron
          />
          <Divider />
          <SettingRow
            icon="trash"
            label="Delete Account"
            onPress={handleDeleteAccount}
            danger
            showChevron
          />
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Purifai v1.0.0</Text>
          <Text style={styles.footerText}>Zakat Made Simple</Text>
        </View>
      </ScrollView>
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  pageTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },

  // Section
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.semibold,
    color: colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingIconDanger: {
    backgroundColor: colors.red[50],
  },
  settingContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  settingLabel: {
    fontSize: typography.fontSizes.base,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
  },
  settingLabelDanger: {
    color: colors.red[600],
  },
  settingValue: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.gray[200],
    marginLeft: spacing.lg + 34 + spacing.md, // align with text, after icon
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontSize: typography.fontSizes.xs,
    color: colors.gray[400],
    marginBottom: spacing.xs,
  },
});

export default SettingsScreen;
