import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { CareerProvider } from './src/engine/CareerContext';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { AnimatedSplash } from './src/components/AnimatedSplash';

// Keep the native (static) splash visible until we explicitly hide it below,
// so there's no blank-white flash before our branded JS splash takes over.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <CareerProvider>
          <RootNavigator />
          <StatusBar style="light" />
        </CareerProvider>
      </LanguageProvider>
      {showSplash && <AnimatedSplash onFinish={() => setShowSplash(false)} />}
    </SafeAreaProvider>
  );
}
