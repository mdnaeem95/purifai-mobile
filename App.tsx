import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import AnimatedSplashScreen from './src/components/AnimatedSplashScreen';

// Prevent the native splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);

  const onAppReady = useCallback(async () => {
    // App data has been loaded — hide native splash and show animated one
    setAppReady(true);
    await SplashScreen.hideAsync();
  }, []);

  const onSplashAnimationComplete = useCallback(() => {
    setSplashComplete(true);
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <AppNavigator onReady={onAppReady} />
      {appReady && !splashComplete && (
        <AnimatedSplashScreen onAnimationComplete={onSplashAnimationComplete} />
      )}
      <StatusBar style={appReady && !splashComplete ? 'light' : 'auto'} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
