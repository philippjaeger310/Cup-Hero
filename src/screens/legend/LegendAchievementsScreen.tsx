import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { colors, spacing, typography } from '../../theme';
import { ACHIEVEMENTS } from '../../data/achievements';
import { useCareer } from '../../engine/CareerContext';
import { useLanguage } from '../../i18n/LanguageContext';

export function LegendAchievementsScreen() {
  const { player } = useCareer();
  const { t, pick } = useLanguage();
  const unlockedIds = new Set(player?.unlockedAchievementIds ?? []);

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
