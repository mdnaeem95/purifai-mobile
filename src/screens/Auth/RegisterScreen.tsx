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
import { validateEmail, validateRequired, validatePassword } from '../../utils/validators';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const register = useUserStore((state) => state.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validate
    const newErrors: any = {};

    if (!validateRequired(name)) {
      newErrors.name = 'Name is required';
    }

    if (!validateRequired(email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address';
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await register(name, email, password);
    } catch (error) {
      console.error('Registration error:', error);
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

          {/* Register Form */}
          <Card variant="elevated" style={styles.card}>
            <Text style={styles.cardTitle}>Create Your Account</Text>

            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              error={errors.name}
            />

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

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
            />

            <Button
              title="Register"
              onPress={handleRegister}
              loading={loading}
              fullWidth
              style={styles.registerButton}
            />

            <Button
              title="Already have an account? Login"
              onPress={() => navigation.navigate('Login')}
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
  registerButton: {
    marginBottom: spacing.md,
  },
});

export default RegisterScreen;
