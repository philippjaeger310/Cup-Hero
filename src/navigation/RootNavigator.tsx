import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { colors } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';
import { StartScreen } from '../screens/StartScreen';
import { GamesHubScreen } from '../screens/GamesHubScreen';
import { LegendSetupScreen } from '../screens/legend/LegendSetupScreen';
import { LegendCareerScreen } from '../screens/legend/LegendCareerScreen';
import { LegendSummaryScreen } from '../screens/legend/LegendSummaryScreen';
import { LegendAchievementsScreen } from '../screens/legend/LegendAchievementsScreen';
import { IdeologyIntroScreen } from '../screens/ideology/IdeologyIntroScreen';
import { IdeologyQuizScreen } from '../screens/ideology/IdeologyQuizScreen';
import { IdeologyResultScreen } from '../screens/ideology/IdeologyResultScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.accent,
  },
};

export function RootNavigator() {
  const { t } = useLanguage();

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Start"
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Start" component={StartScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GamesHub" component={GamesHubScreen} options={{ title: t('nav.gamesHub'), headerBackVisible: false }} />
        <Stack.Screen name="LegendSetup" component={LegendSetupScreen} options={{ title: t('nav.legendSetup') }} />
        <Stack.Screen name="LegendCareer" component={LegendCareerScreen} options={{ title: t('nav.legendCareer') }} />
        <Stack.Screen name="LegendSummary" component={LegendSummaryScreen} options={{ title: t('nav.legendSummary'), headerBackVisible: false }} />
        <Stack.Screen name="LegendAchievements" component={LegendAchievementsScreen} options={{ title: t('nav.legendAchievements') }} />
        <Stack.Screen name="IdeologyIntro" component={IdeologyIntroScreen} options={{ title: t('nav.ideologyIntro') }} />
        <Stack.Screen name="IdeologyQuiz" component={IdeologyQuizScreen} options={{ title: t('nav.ideologyQuiz') }} />
        <Stack.Screen name="IdeologyResult" component={IdeologyResultScreen} options={{ title: t('nav.ideologyResult') }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
