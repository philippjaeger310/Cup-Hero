import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors, spacing, typography } from '../../theme';
import { resolveIdeologyProfile } from '../../data/ideologyQuestions';
import { useLanguage } from '../../i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'IdeologyResult'>;

export function IdeologyResultScreen({ route, navigation }: Props) {
  const { t, pick } = useLanguage();
  const scores = route.params;
  const profile = resolveIdeologyProfile(scores);

  return (
    <Screen>
      <Text style={styles.eyebrow}>{t('ideology.result.eyebrow')}</Text>
      <Text style={styles.title}>{pick(profile.name)}</Text>
      <Text style={styles.description}>{pick(profile.description)}</Text>

      <Card style={styles.scoreCard}>
        <ScoreRow label={t('ideology.result.scorePossession')} value={scores.possession - scores.directness} />
        <ScoreRow label={t('ideology.result.scorePressing')} value={scores.pressing} />
        <ScoreRow label={t('ideology.result.scoreIndividualism')} value={scores.individualism} />
      </Card>

      <Button label={t('ideology.result.back')} onPress={() => navigation.navigate('GamesHub')} style={styles.button} />
    </Screen>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <Text style={styles.scoreRow}>
      {label}: {value > 0 ? '+' : ''}
      {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    ...typography.caption,
    color: colors.accent,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  scoreCard: {
    marginBottom: spacing.xl,
  },
  scoreRow: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  button: {
    alignSelf: 'flex-start',
  },
});
