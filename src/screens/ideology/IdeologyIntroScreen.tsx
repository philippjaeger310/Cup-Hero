import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { colors, spacing, typography } from '../../theme';
import { IDEOLOGY_QUESTIONS } from '../../data/ideologyQuestions';
import { useLanguage } from '../../i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'IdeologyIntro'>;

export function IdeologyIntroScreen({ navigation }: Props) {
  const { t } = useLanguage();
  return (
    <Screen>
      <Text style={styles.emoji}>🧭</Text>
      <Text style={styles.title}>{t('ideology.intro.title')}</Text>
      <Text style={styles.body}>{t('ideology.intro.body', { count: IDEOLOGY_QUESTIONS.length })}</Text>
      <Button label={t('ideology.intro.start')} onPress={() => navigation.navigate('IdeologyQuiz')} style={styles.button} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  button: {
    alignSelf: 'flex-start',
  },
});
