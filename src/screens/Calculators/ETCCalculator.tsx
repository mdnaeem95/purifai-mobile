import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/common/Header';
import { colors, spacing, typography } from '../../constants/theme';

const ETCCalculator: React.FC = () => {
  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>ETC Zakat Calculator</Text>
        <Text style={styles.subtitle}>Coming soon - ETC calculator form will appear here</Text>
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

export default ETCCalculator;
