import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useUserStore } from '../store/userStore';
import { useFamilyStore } from '../store/familyStore';
import { useCalculatorStore } from '../store/calculatorStore';
import { usePaymentStore } from '../store/paymentStore';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import MainDrawerNavigator from './MainDrawerNavigator';

const Stack = createStackNavigator();

interface AppNavigatorProps {
  onReady?: () => void;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ onReady }) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const hasCompletedOnboarding = useUserStore((state) => state.user?.hasCompletedOnboarding ?? true);
  const loadUser = useUserStore((state) => state.loadUser);
  const loadCalculators = useCalculatorStore((state) => state.loadCalculators);
  const loadPayments = usePaymentStore((state) => state.loadPayments);

  useEffect(() => {
    const initializeApp = async () => {
      // 1. Load user first (needed for family migration)
      await loadUser();

      // 2. Load family state, migrate legacy data if needed
      const { loadFamily, migrateIfNeeded } = useFamilyStore.getState();
      await loadFamily();
      const user = useUserStore.getState().user;
      if (user) {
        await migrateIfNeeded(user.name);
      }

      // 3. Load member-scoped calculator and payment data
      await loadCalculators();
      await loadPayments();
      onReady?.();
    };

    initializeApp();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : !hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainDrawerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
