import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { colors, radius, spacing, typography } from '../theme';
import { useCareer } from '../engine/CareerContext';
import { useLanguage } from '../i18n/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'GamesHub'>;

export function GamesHubScreen({ navigation }: Props) {
  const { player } = useCareer();
  const { t, lang, toggleLang } = useLanguage();

  return (
    <Screen scroll>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.brand}>{t('gamesHub.brand')}</Text>
          <Text style={styles.title}>{t('gamesHub.title')}</Text>
        </View>
        <Pressable onPress={toggleLang} style={styles.langSwitch} accessibilityLabel={t('gamesHub.language')}>
          <Text style={[styles.langOption, lang === 'de' && styles.langOptionActive]}>DE</Text>
          <Text style={styles.langDivider}>/</Text>
          <Text style={[styles.langOption, lang === 'en' && styles.langOptionActive]}>EN</Text>
        </Pressable>
      </View>
      <Text style={styles.subtitle}>{t('gamesHub.subtitle')}</Text>

      <Card
        style={styles.card}
        onPress={() => navigation.navigate(player ? 'LegendCareer' : 'LegendSetup')}
      >
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardIcon}>🏆</Text>
          <Text style={styles.cardTitle}>{t('gamesHub.legend.title')}</Text>
        </View>
        <Text style={styles.cardDescription}>
          {t('gamesHub.legend.description')}
          {player ? t('gamesHub.legend.inProgress') : ''}
        </Text>
        <Text style={styles.cardCta}>{player ? t('gamesHub.legend.ctaContinue') : t('gamesHub.legend.ctaStart')}</Text>
      </Card>

      <Card style={styles.card} onPress={() => navigation.navigate('IdeologyIntro')}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardIcon}>🧭</Text>
          <Text style={styles.cardTitle}>{t('gamesHub.ideology.title')}</Text>
        </View>
        <Text style={styles.cardDescription}>{t('gamesHub.ideology.description')}</Text>
        <Text style={styles.cardCta}>{t('gamesHub.ideology.cta')}</Text>
      </Card>

      <Card style={styles.card} onPress={() => navigation.navigate('LegendAchievements')}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardIcon}>🎖️</Text>
          <Text style={styles.cardTitle}>{t('gamesHub.achievements.title')}</Text>
        </View>
        <Text style={styles.cardDescription}>{t('gamesHub.achievements.description')}</Text>
        <Text style={styles.cardCta}>{t('gamesHub.achievements.cta')}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brand: {
    ...typography.caption,
    color: colors.accent,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  langSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  langOption: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: 2,
  },
  langOptionActive: {
    color: colors.accent,
    fontWeight: '800',
  },
  langDivider: {
    ...typography.caption,
    color: colors.border,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  cardDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardCta: {
    ...typography.bodyBold,
    color: colors.accent,
  },
});
