import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/common/Header';
import { colors, spacing, typography } from '../../constants/theme';

const SukukCalculator: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Sukuk Zakat Calculator</Text>
        <Text style={styles.subtitle}>Coming soon - Sukuk calculator form will appear here</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg },
  title: { fontSize: typography.fontSizes['2xl'], fontWeight: typography.fontWeights.bold, color: colors.primary[500], marginBottom: spacing.sm },
  subtitle: { fontSize: typography.fontSizes.base, color: colors.text.secondary },
});

export default SukukCalculator;
