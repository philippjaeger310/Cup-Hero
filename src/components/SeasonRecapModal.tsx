import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { SeasonRecord, Trophy } from '../types';
import { EVENT_NOTES } from '../data/events';
import { Button } from './Button';
import { TrophyCase } from './TrophyCase';
import { colors, radius, spacing, typography } from '../theme';
import { useLanguage } from '../i18n/LanguageContext';

interface SeasonRecapModalProps {
  record: SeasonRecord | null;
  trophies: Trophy[];
  isGk: boolean;
  onDismiss: () => void;
}

/**
 * Shown after every season (not just a trophy win) so performance doesn't
 * get lost between seasons (user feedback) — goals/apps/assists (or GK
 * clean sheets/conceded), every trophy won that season (plural — a treble
 * is now structurally possible, see rollClubTrophies() in careerEngine.ts),
 * and the outcome of any deferred risk/reward choice (captaincy, mentor
 * role, buying into a new coach) made this season.
 */
export function SeasonRecapModal({ record, trophies, isGk, onDismiss }: SeasonRecapModalProps) {
  const { t, pick } = useLanguage();
  if (!record) return null;

  const outcome = record.riskRewardOutcome;
  const outcomeNote = outcome?.noteKey ? EVENT_NOTES[outcome.noteKey] : null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('career.recap.title', { n: record.season })}</Text>

          <View style={styles.statsRow}>
            {isGk ? (
              <>
                <Stat label={t('career.apps')} value={record.apps} />
                <Stat label={t('career.gk.cleanSheets')} value={record.cleanSheets ?? 0} />
                <Stat label={t('career.gk.goalsConceded')} value={record.goalsConceded ?? 0} />
              </>
            ) : (
              <>
                <Stat label={t('career.apps')} value={record.apps} />
                <Stat label={t('career.goals')} value={record.goals} />
                <Stat label={t('career.assists')} value={record.assists} />
              </>
            )}
          </View>

          {trophies.length > 0 && (
            <View style={styles.trophySection}>
              <Text style={styles.trophyLine}>
                {t('career.recap.trophiesThisSeason', { count: trophies.length })}
              </Text>
              <View style={styles.trophyRow}>
                <TrophyCase trophies={trophies} size={28} />
              </View>
            </View>
          )}

          {outcomeNote && (
            <Text style={[styles.outcomeNote, outcome?.success ? styles.outcomeSuccess : styles.outcomeFailure]}>
              {outcome?.success ? '✓ ' : '✗ '}
              {pick(outcomeNote)}
            </Text>
          )}

          <Button label={t('career.recap.continueButton')} onPress={onDismiss} style={styles.button} />
        </View>
      </View>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.accent,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  trophySection: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  trophyLine: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  trophyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  outcomeNote: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  outcomeSuccess: {
    color: colors.success,
  },
  outcomeFailure: {
    color: colors.danger,
  },
  button: {
    minWidth: 160,
    marginTop: spacing.md,
  },
});
