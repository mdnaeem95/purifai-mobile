import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { colors, spacing, typography } from '../../constants/theme';
import { useUserStore } from '../../store/userStore';
import { validateEmail, validateRequired } from '../../utils/validators';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const login = useUserStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Validate
    const newErrors: { email?: string; password?: string } = {};

    if (!validateRequired(email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!validateRequired(password)) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>P</Text>
            </View>
            <Text style={styles.title}>Purifai</Text>
            <Text style={styles.subtitle}>Modern Investments, Timeless Obligations</Text>
          </View>

          {/* Login Form */}
          <Card variant="elevated" style={styles.card}>
            <Text style={styles.cardTitle}>Login to Your Account</Text>

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            <Button
              title="Login"
              onPress={handleLogin}
              loading={loading}
              fullWidth
              style={styles.loginButton}
            />

            <Button
              title="Don't have an account? Register"
              onPress={() => navigation.navigate('Register')}
              variant="outline"
              fullWidth
            />
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['4xl'],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['5xl'],
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.primary[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
    fontSize: 40,
  },
  title: {
    fontSize: typography.fontSizes['3xl'],
    fontWeight: typography.fontWeights.bold,
    color: colors.primary[500],
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  card: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  loginButton: {
    marginBottom: spacing.md,
  },
});

export default LoginScreen;
