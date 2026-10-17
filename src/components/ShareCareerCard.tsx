import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlayerState } from '../types';
import { getClub } from '../data/clubs';
import { getCountry } from '../data/countries';
import { colors, radius, spacing, typography } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';
import { CupHeroMark } from './CupHeroMark';
import { TrophyCase } from './TrophyCase';

interface ShareCareerCardProps {
  player: PlayerState;
}

export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1350;

function formatValue(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}K`;
  return `€${value}`;
}

/**
 * Vertical (4:5, story/post friendly) career recap card, rendered off-screen
 * and rasterized via react-native-view-shot (see captureShareCareerImage in
 * LegendSummaryScreen.tsx) into a PNG that's handed to the native share
 * sheet. Kept as a standalone component — rather than inlined in the
 * screen — so its layout only has to make sense as a square-ish image, not
 * also as a scrollable in-app section.
 */
export function ShareCareerCard({ player }: ShareCareerCardProps) {
  const { t, pick } = useLanguage();
  const country = getCountry(player.identity.nationality);
  const club = getClub(player.currentClubId);
  const isGk = player.identity.position === 'GK';

  const bestOvrRecord = player.history.reduce(
    (best, r) => (r.ovr > best.ovr ? r : best),
    player.history[0] ?? { ovr: player.ovr }
  );
  const bestValueRecord = player.history.reduce(
    (best, r) => (r.value > best.value ? r : best),
    player.history[0] ?? { value: player.value }
  );

  return (
    <View style={styles.card}>
      <View style={styles.brandRow}>
        <CupHeroMark size={56} />
        <Text style={styles.brandWordmark}>CUP HERO</Text>
      </View>

      <Text style={styles.flag}>{country.flagEmoji}</Text>
      <Text style={styles.playerName}>
        #{player.identity.number} {player.identity.lastName}
      </Text>
      <Text style={styles.playerMeta}>
        {t(`positionAbbr.${player.identity.position}`)} · {pick(country.name)}
      </Text>

      <View style={styles.bestRow}>
        <View style={styles.bestBox}>
          <Text style={styles.bestValue}>{bestOvrRecord.ovr}</Text>
          <Text style={styles.bestLabel}>{t('summary.bestOvr')}</Text>
        </View>
        <View style={styles.bestBox}>
          <Text style={styles.bestValue}>{formatValue(bestValueRecord.value)}</Text>
          <Text style={styles.bestLabel}>{t('summary.bestValue')}</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCell label={t('summary.stats.seasons')} value={player.season} />
        <StatCell label={t('summary.stats.appearances')} value={player.careerStats.apps} />
        {isGk ? (
          <StatCell label={t('summary.gkCleanSheets')} value={player.cleanSheets} />
        ) : (
          <StatCell label={t('summary.stats.goals')} value={player.careerStats.goals} />
        )}
        <StatCell label={t('summary.stats.trophies')} value={player.trophies.length} />
        <StatCell label={t('summary.stats.caps')} value={player.nationalTeamCaps} />
      </View>

      {player.trophies.length > 0 && (
        <View style={styles.trophyRow}>
          <TrophyCase trophies={player.trophies} size={36} />
        </View>
      )}

      <Text style={styles.footer}>{club.shortName}</Text>
    </View>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: SHARE_CARD_WIDTH,
    height: SHARE_CARD_HEIGHT,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingTop: 72,
    paddingHorizontal: 64,
  },
  brandRow: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brandWordmark: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 5,
    color: colors.textPrimary,
  },
  flag: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  playerName: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  playerMeta: {
    fontSize: 24,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: 48,
  },
  bestRow: {
    flexDirection: 'row',
    gap: 64,
    marginBottom: 48,
  },
  bestBox: {
    alignItems: 'center',
  },
  bestValue: {
    fontSize: 64,
    fontWeight: '800',
    color: colors.accent,
  },
  bestLabel: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: 40,
  },
  statCell: {
    width: 200,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 20,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: 4,
  },
  trophyRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  footer: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 'auto',
    marginBottom: 40,
  },
});
