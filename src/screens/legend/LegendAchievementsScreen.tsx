import React, { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { colors, spacing, typography } from '../../theme';
import { ACHIEVEMENTS } from '../../data/achievements';
import { useCareer } from '../../engine/CareerContext';
import { loadCareerHistory } from '../../storage/careerStorage';
import { useLanguage } from '../../i18n/LanguageContext';

export function LegendAchievementsScreen() {
  const { player } = useCareer();
  const { t, pick } = useLanguage();
  // Bug fix (user feedback): this screen used to read ONLY the current
  // in-progress career's player.unlockedAchievementIds — once a career ends
  // and the player returns home, `player` resets to null (discardCareer) and
  // every achievement earned in that finished career vanished from this
  // screen, even though it was correctly archived. Achievements are now a
  // lifetime, cross-career set: union of the active career's unlocked ids
  // (if any) with every archived past career's ids. Re-read on every focus
  // (not just mount) so finishing a career and coming straight back here
  // shows it immediately.
  const [historicalIds, setHistoricalIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadCareerHistory().then((history) => {
        setHistoricalIds(history.flatMap((p) => p.unlockedAchievementIds ?? []));
      });
    }, [])
  );

  const unlockedIds = new Set([...(player?.unlockedAchievementIds ?? []), ...historicalIds]);

  return (
    <Screen scroll>
      <Text style={styles.title}>{t('achievements.title')}</Text>
      <Text style={styles.subtitle}>
        {t('achievements.subtitle', { unlocked: unlockedIds.size, total: ACHIEVEMENTS.length })}
      </Text>

      {ACHIEVEMENTS.map((a) => {
        const unlocked = unlockedIds.has(a.id);
        return (
          <Card key={a.id} style={[styles.card, !unlocked && styles.cardLocked]}>
            <Text style={[styles.icon, !unlocked && styles.iconLocked]}>{unlocked ? a.icon : '🔒'}</Text>
            <Text style={[styles.name, !unlocked && styles.textLocked]}>{pick(a.name)}</Text>
            <Text style={[styles.description, !unlocked && styles.textLocked]}>{pick(a.description)}</Text>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardLocked: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 26,
    marginBottom: spacing.xs,
  },
  iconLocked: {
    fontSize: 20,
  },
  name: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  textLocked: {
    color: colors.gray,
  },
});
