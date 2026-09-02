import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SeasonHistoryTable } from '../../components/SeasonHistoryTable';
import { TrophyCase } from '../../components/TrophyCase';
import { colors, spacing, typography } from '../../theme';
import { useCareer } from '../../engine/CareerContext';
import { getClub } from '../../data/clubs';
import { getCountry } from '../../data/countries';
import { getAchievement } from '../../data/achievements';
import { getIndividualAward } from '../../data/individualAwards';
import { useLanguage } from '../../i18n/LanguageContext';

function formatValue(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}K`;
  return `€${value}`;
}

type Props = NativeStackScreenProps<RootStackParamList, 'LegendSummary'>;

export function LegendSummaryScreen({ navigation }: Props) {
  const { player, discardCareer } = useCareer();
  const { t, pick } = useLanguage();

  if (!player) {
    navigation.replace('GamesHub');
    return null;
  }

  const country = getCountry(player.identity.nationality);
  const isGk = player.identity.position === 'GK';

  const bestOvrRecord = player.history.reduce(
    (best, r) => (r.ovr > best.ovr ? r : best),
    player.history[0] ?? { ovr: player.ovr, clubId: player.currentClubId }
  );
  const bestValueRecord = player.history.reduce(
    (best, r) => (r.value > best.value ? r : best),
    player.history[0] ?? { value: player.value, clubId: player.currentClubId }
  );

  const handlePlayAgain = async () => {
    await discardCareer();
    navigation.replace('LegendSetup');
  };

  const handleDone = async () => {
    await discardCareer();
    navigation.replace('GamesHub');
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>{t('summary.title')}</Text>

      <Card style={styles.headerCard}>
        <Text style={styles.flag}>{country.flagEmoji}</Text>
        <Text style={styles.playerName}>
          #{player.identity.number} {player.identity.lastName}
        </Text>
        <Text style={styles.playerMeta}>{t(`positionAbbr.${player.identity.position}`)}</Text>
        <View style={styles.bestRow}>
          <View style={styles.bestBox}>
            <Text style={styles.ovrValue}>{bestOvrRecord.ovr}</Text>
            <Text style={styles.ovrLabel}>{t('summary.bestOvr')}</Text>
            {bestOvrRecord.clubId !== bestValueRecord.clubId && (
              <Text style={styles.bestClub}>{getClub(bestOvrRecord.clubId).shortName}</Text>
            )}
          </View>
          <View style={styles.bestBox}>
            <Text style={styles.ovrValue}>{formatValue(bestValueRecord.value)}</Text>
            <Text style={styles.ovrLabel}>{t('summary.bestValue')}</Text>
            {bestOvrRecord.clubId !== bestValueRecord.clubId && (
              <Text style={styles.bestClub}>{getClub(bestValueRecord.clubId).shortName}</Text>
            )}
          </View>
        </View>
        {bestOvrRecord.clubId === bestValueRecord.clubId && (
          <Text style={styles.bestClubCentered}>{getClub(bestOvrRecord.clubId).shortName}</Text>
        )}
        {player.retirementReason && (
          <Text style={styles.retirementReason}>{t(`summary.retirementReason.${player.retirementReason}`)}</Text>
        )}
      </Card>

      <View style={styles.statsGrid}>
        <StatBox label={t('summary.stats.seasons')} value={player.season} />
        <StatBox label={t('summary.stats.appearances')} value={player.careerStats.apps} />
        {isGk ? (
          <>
            <StatBox label={t('summary.gkCleanSheets')} value={player.cleanSheets} />
            <StatBox label={t('summary.gkGoalsConceded')} value={player.goalsConceded} />
          </>
        ) : (
          <>
            <StatBox label={t('summary.stats.goals')} value={player.careerStats.goals} />
            <StatBox label={t('summary.stats.assists')} value={player.careerStats.assists} />
          </>
        )}
        <StatBox label={t('summary.stats.trophies')} value={player.trophies.length} />
        <StatBox label={t('summary.stats.caps')} value={player.nationalTeamCaps} />
      </View>

      {player.trophies.length > 0 && (
        <View style={styles.trophyCaseWrap}>
          <TrophyCase trophies={player.trophies} size={32} />
        </View>
      )}

      <Text style={styles.sectionLabel}>{t('summary.individualAwardsTitle')}</Text>
      {player.individualAwards.length === 0 && (
        <Text style={styles.emptyText}>{t('summary.noIndividualAwards')}</Text>
      )}
      {player.individualAwards.map((award) => {
        const def = getIndividualAward(award.awardId);
        if (!def) return null;
        const c = getClub(award.clubId);
        return (
          <Card key={award.id} style={styles.achievementRow}>
            <Text style={styles.achievementIcon}>{def.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.achievementName}>{pick(def.name)}</Text>
              <Text style={styles.achievementDescription}>
                {t('summary.awardSeason', { season: award.season })} · {c.shortName}
              </Text>
            </View>
          </Card>
        );
      })}

      <Text style={styles.sectionLabel}>{t('summary.nationalTeamTitle')}</Text>
      <Card style={styles.nationalTeamCard}>
        {player.nationalTeamCaps === 0 ? (
          <Text style={styles.emptyText}>{t('summary.nationalTeamEmpty')}</Text>
        ) : (
          <View style={styles.statsRow}>
            <StatBox label={t('summary.nationalTeamCaps')} value={player.nationalTeamCaps} />
            <StatBox label={t('summary.nationalTeamGoals')} value={player.nationalTeamGoals} />
          </View>
        )}
      </Card>

      <Text style={styles.sectionLabel}>{t('summary.seasonsTitle')}</Text>
      <SeasonHistoryTable records={player.history} showSeason showGk={isGk} />
      {player.history.some((h) => h.onLoan) && <Text style={styles.emptyText}>{t('summary.seasonsHeadersFooter')}</Text>}

      <Text style={styles.sectionLabel}>{t('summary.achievementsTitle')}</Text>
      {player.unlockedAchievementIds.length === 0 && (
        <Text style={styles.emptyText}>{t('summary.noAchievements')}</Text>
      )}
      {player.unlockedAchievementIds.map((id) => {
        const a = getAchievement(id);
        if (!a) return null;
        return (
          <Card key={id} style={styles.achievementRow}>
            <Text style={styles.achievementIcon}>{a.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.achievementName}>{pick(a.name)}</Text>
              <Text style={styles.achievementDescription}>{pick(a.description)}</Text>
            </View>
          </Card>
        );
      })}

      <Button label={t('summary.playAgain')} onPress={handlePlayAgain} style={styles.actionButton} />
      <Button label={t('summary.backToGames')} variant="secondary" onPress={handleDone} style={styles.actionButton} />
    </Screen>
  );
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <Card style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  flag: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  playerName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  playerMeta: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  bestRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  bestBox: {
    alignItems: 'center',
  },
  bestClub: {
    ...typography.caption,
    color: colors.accent,
  },
  bestClubCentered: {
    ...typography.caption,
    color: colors.accent,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  ovrValue: {
    ...typography.h1,
    color: colors.accent,
  },
  ovrLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  retirementReason: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  trophyCaseWrap: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBox: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statValue: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  nationalTeamCard: {
    marginBottom: spacing.md,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  achievementName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  achievementDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
});
