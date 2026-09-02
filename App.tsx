import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { CareerProvider } from './src/engine/CareerContext';
import { LanguageProvider } from './src/i18n/LanguageContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <CareerProvider>
          <RootNavigator />
          <StatusBar style="light" />
        </CareerProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
