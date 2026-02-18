import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useUserStore } from '../store/userStore';
import { useCalculatorStore } from '../store/calculatorStore';
import { usePaymentStore } from '../store/paymentStore';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import MainDrawerNavigator from './MainDrawerNavigator';

const Stack = createStackNavigator();

interface AppNavigatorProps {
  onReady?: () => void;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ onReady }) => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const loadUser = useUserStore((state) => state.loadUser);
  const loadCalculators = useCalculatorStore((state) => state.loadCalculators);
  const loadPayments = usePaymentStore((state) => state.loadPayments);

  useEffect(() => {
    const initializeApp = async () => {
      await loadUser();
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
        ) : (
          <Stack.Screen name="Main" component={MainDrawerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
