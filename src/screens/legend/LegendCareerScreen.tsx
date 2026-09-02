import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ClubBadge } from '../../components/ClubBadge';
import { SeasonHistoryTable } from '../../components/SeasonHistoryTable';
import { TrophyModal } from '../../components/TrophyModal';
import { IndividualAwardModal } from '../../components/IndividualAwardModal';
import { TrophyCase } from '../../components/TrophyCase';
import { colors, radius, spacing, typography } from '../../theme';
import { useCareer } from '../../engine/CareerContext';
import { getClub } from '../../data/clubs';
import { getCountry } from '../../data/countries';
import { CareerEvent, EventChoiceEffect, PlayerState } from '../../types';
import { MAX_SEASON_APPS, nextEventFor, shouldTriggerEvent } from '../../engine/careerEngine';
import { getAchievement } from '../../data/achievements';
import { useLanguage } from '../../i18n/LanguageContext';

type EffectChip = { key: string; text: string; tone: 'positive' | 'negative' | 'neutral' };

// Turns a choice's raw EventChoiceEffect into short, legible preview chips
// (playing time, OVR, market value) so the player can see the actual
// trade-off before picking — not just flavor text. Only renders a chip for
// a field the effect actually sets; a field left undefined falls back to
// the engine's normal season formula and is deliberately not shown here.
function effectChips(effect: EventChoiceEffect, t: (key: string, vars?: Record<string, string | number>) => string): EffectChip[] {
  const chips: EffectChip[] = [];
  if (effect.appsShare !== undefined) {
    const apps = Math.round(effect.appsShare * MAX_SEASON_APPS);
    chips.push({
      key: 'apps',
      text: `~${apps} ${t('career.appsWord')}`,
      tone: effect.appsShare >= 0.65 ? 'positive' : effect.appsShare < 0.5 ? 'negative' : 'neutral',
    });
  }
  if (effect.ovrDelta !== undefined) {
    chips.push({
      key: 'ovr',
      text: `${effect.ovrDelta > 0 ? '+' : ''}${effect.ovrDelta} OVR`,
      tone: effect.ovrDelta > 0 ? 'positive' : effect.ovrDelta < 0 ? 'negative' : 'neutral',
    });
  }
  if (effect.valueMultiplier !== undefined && effect.valueMultiplier !== 1) {
    const pct = Math.round((effect.valueMultiplier - 1) * 100);
    chips.push({
      key: 'value',
      text: `${pct > 0 ? '+' : ''}${pct}% ${t('career.valueWord')}`,
      tone: pct > 0 ? 'positive' : 'negative',
    });
  }
  return chips;
}

type Props = NativeStackScreenProps<RootStackParamList, 'LegendCareer'>;

export function LegendCareerScreen({ navigation }: Props) {
  const {
    player,
    advanceSeason,
    lastNewAchievements,
    lastTrophy,
    dismissTrophy,
    lastIndividualAward,
    dismissAward,
    postSeason,
    chooseOffer,
    stay,
    chooseLoan,
    retire,
    discardCareer,
  } = useCareer();
  const { t, pick } = useLanguage();
  const [pendingEvent, setPendingEvent] = useState<CareerEvent | null>(null);
  // The player state a pending event's choice should apply on top of. Only
  // needed when the event was triggered right after a stay/transfer/loan
  // decision — see proceedToNextSeason — since the context's own `player`
  // hasn't necessarily re-rendered with that decision yet at that point.
  const [pendingBaseState, setPendingBaseState] = useState<PlayerState | null>(null);

  useEffect(() => {
    if (!player) {
      navigation.replace('LegendSetup');
    }
  }, [player, navigation]);

  useEffect(() => {
    if (player && player.retired) {
      navigation.replace('LegendSummary');
    }
  }, [player, navigation]);

  if (!player) return null;

  const club = getClub(player.currentClubId);
  const country = getCountry(player.identity.nationality);
  const isGk = player.identity.position === 'GK';

  const handleNextSeason = () => {
    proceedToNextSeason(player);
  };

  // Shared by the manual "Play Next Season" button and by the
  // stay/transfer/loan decision handlers below — either shows the next
  // career event (if one is due) or simulates the season immediately, so
  // choosing where to play never needs a separate extra tap to continue.
  const proceedToNextSeason = (baseState: PlayerState) => {
    const upcomingSeason = baseState.season + 1;
    if (shouldTriggerEvent(upcomingSeason, baseState.identity.difficulty)) {
      const event = nextEventFor(baseState);
      if (event) {
        setPendingEvent(event);
        setPendingBaseState(baseState);
        return;
      }
    }
    advanceSeason(undefined, baseState);
  };

  const handleChoice = (effect: CareerEvent['choices'][number]['effect']) => {
    setPendingEvent(null);
    advanceSeason(effect, pendingBaseState ?? undefined);
    setPendingBaseState(null);
  };

  const handleStay = async () => {
    const updated = await stay();
    if (updated) proceedToNextSeason(updated);
  };

  const handleChooseOffer = async (clubId: string) => {
    const updated = await chooseOffer(clubId);
    if (updated) proceedToNextSeason(updated);
  };

  const handleChooseLoan = async () => {
    const updated = await chooseLoan();
    if (updated) proceedToNextSeason(updated);
  };

  const recentHistory = [...player.history].reverse().slice(0, 8);

  const forcedTitle =
    postSeason?.forcedNote === 'contract-not-renewed'
      ? t('career.contractNotRenewed.title')
      : postSeason?.forcedNote === 'loan-return-not-retained'
      ? t('career.loanReturnNotRetained.title')
      : null;
  const forcedSubtitle =
    postSeason?.forcedNote === 'contract-not-renewed'
      ? t('career.contractNotRenewed.subtitle', { club: club.shortName })
      : postSeason?.forcedNote === 'loan-return-not-retained'
      ? t('career.loanReturnNotRetained.subtitle', { club: club.shortName })
      : null;

  const hasOptionalDecision =
    !!postSeason && !postSeason.forcedNote && (postSeason.offers.length > 0 || !!postSeason.loanOffer);

  return (
    <Screen scroll style={styles.screenContent}>
      <TrophyModal trophy={lastTrophy} onDismiss={dismissTrophy} />
      <IndividualAwardModal award={lastIndividualAward} onDismiss={dismissAward} />

      <View style={styles.headerRow}>
        <Text style={styles.brand}>{t('career.brand')}</Text>
        <Text style={styles.season}>{t('career.season', { n: player.season || 1 })}</Text>
      </View>

      <Card style={styles.statusCard}>
        <View style={styles.statusTopRow}>
          <Text style={styles.flag}>{country.flagEmoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.playerName}>
              #{player.identity.number} {player.identity.lastName}
            </Text>
            <Text style={styles.playerMeta}>
              {t(`positionAbbr.${player.identity.position}`)} · {player.age} · {club.shortName}
            </Text>
            {player.onLoanAtClubId && (
              <Text style={styles.loanBadge}>
                {t('career.onLoanBadge', { club: getClub(player.parentClubId ?? '').shortName })}
              </Text>
            )}
          </View>
          <View style={styles.ovrBadge}>
            <Text style={styles.ovrValue}>{player.ovr}</Text>
            <Text style={styles.ovrLabel}>{t('career.ovr')}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {isGk ? (
            <>
              <StatBlock label={t('career.apps')} value={player.careerStats.apps} />
              <StatBlock label={t('career.gk.cleanSheets')} value={player.cleanSheets} />
              <StatBlock label={t('career.gk.goalsConceded')} value={player.goalsConceded} />
              <StatBlock label={t('career.value')} value={formatValue(player.value)} />
            </>
          ) : (
            <>
              <StatBlock label={t('career.apps')} value={player.careerStats.apps} />
              <StatBlock label={t('career.goals')} value={player.careerStats.goals} />
              <StatBlock label={t('career.assists')} value={player.careerStats.assists} />
              <StatBlock label={t('career.value')} value={formatValue(player.value)} />
            </>
          )}
        </View>

        <Text style={styles.trophyLine}>
          {t('career.trophiesCapsLine', { trophies: player.trophies.length, caps: player.nationalTeamCaps })}
        </Text>

        {player.trophies.length > 0 && (
          <View style={styles.trophyCaseRow}>
            <TrophyCase trophies={player.trophies} size={22} />
          </View>
        )}
      </Card>

      {pendingEvent ? (
        <Card style={styles.eventCard}>
          <Text style={styles.eventTitle}>{pick(pendingEvent.title)}</Text>
          <Text style={styles.eventDescription}>{pick(pendingEvent.description)}</Text>
          {pendingEvent.choices.map((choice) => (
            <Card
              key={choice.id}
              onPress={() => handleChoice({ ...choice.effect, eventId: pendingEvent.id })}
              style={[styles.choiceCard, choice.id === 'accept' && styles.choiceCardAccent]}
            >
              <Text style={styles.choiceLabel}>{pick(choice.label)}</Text>
              <Text style={styles.choiceDescription}>{pick(choice.description)}</Text>
              <Text style={styles.choiceEffectLabel}>{t('career.expectedEffect')}</Text>
              <View style={styles.chipRow}>
                {effectChips(choice.effect, t).map((chip) => (
                  <View
                    key={chip.key}
                    style={[
                      styles.chip,
                      chip.tone === 'positive' && styles.chipPositive,
                      chip.tone === 'negative' && styles.chipNegative,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        chip.tone === 'positive' && styles.chipTextPositive,
                        chip.tone === 'negative' && styles.chipTextNegative,
                      ]}
                    >
                      {chip.text}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          ))}
        </Card>
      ) : forcedTitle ? (
        <Card style={[styles.eventCard, styles.forcedCard]}>
          <Text style={styles.eventTitle}>{forcedTitle}</Text>
          <Text style={styles.eventDescription}>{forcedSubtitle}</Text>

          {postSeason!.offers.map((offer) => (
            <Card key={offer.id} style={styles.offerCard} onPress={() => handleChooseOffer(offer.id)}>
              <View style={styles.offerRow}>
                <ClubBadge club={offer} size={36} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.offerClubName}>{offer.name}</Text>
                  <Text style={styles.offerLeague}>{offer.league}</Text>
                  <Text style={styles.offerMeta}>{t('career.offers.reputation', { rep: offer.reputation })}</Text>
                </View>
              </View>
            </Card>
          ))}

          <Button label={t('career.retireButton')} variant="secondary" onPress={retire} style={styles.choiceButton} />
        </Card>
      ) : hasOptionalDecision ? (
        <Card style={styles.eventCard}>
          <Text style={styles.eventTitle}>{t('career.offers.title')}</Text>
          <Text style={styles.eventDescription}>{t('career.offers.subtitle')}</Text>

          <Card style={styles.offerCard} onPress={handleStay}>
            <View style={styles.offerRow}>
              <ClubBadge club={club} size={36} />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <Text style={styles.offerClubName}>{t('career.offers.stayAt', { club: club.shortName })}</Text>
                <Text style={styles.offerLeague}>{club.league}</Text>
              </View>
            </View>
          </Card>
          {postSeason!.offers.map((offer) => (
            <Card key={offer.id} style={styles.offerCard} onPress={() => handleChooseOffer(offer.id)}>
              <View style={styles.offerRow}>
                <ClubBadge club={offer} size={36} />
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Text style={styles.offerClubName}>{offer.name}</Text>
                  <Text style={styles.offerLeague}>{offer.league}</Text>
                  <Text style={styles.offerMeta}>{t('career.offers.reputation', { rep: offer.reputation })}</Text>
                </View>
              </View>
            </Card>
          ))}

          {postSeason!.loanOffer && (
            <>
              <Text style={styles.loanSectionTitle}>{t('career.loanOffer.title')}</Text>
              <Card style={styles.offerCard} onPress={handleChooseLoan}>
                <View style={styles.offerRow}>
                  <ClubBadge club={postSeason!.loanOffer} size={36} />
                  <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <Text style={styles.offerClubName}>
                      {t('career.loanOffer.accept', { club: postSeason!.loanOffer.name })}
                    </Text>
                    <Text style={styles.offerLeague}>{postSeason!.loanOffer.league}</Text>
                    <Text style={styles.offerMeta}>
                      {t('career.offers.reputation', { rep: postSeason!.loanOffer.reputation })}
                    </Text>
                  </View>
                </View>
              </Card>
            </>
          )}

          {postSeason!.canRetire && (
            <Button label={t('career.retireButton')} variant="ghost" onPress={retire} style={styles.choiceButton} />
          )}
        </Card>
      ) : (
        <>
          <Button label={t('career.playNextSeason')} onPress={handleNextSeason} style={styles.nextButton} />
          {postSeason?.canRetire && (
            <Button label={t('career.retireButton')} variant="ghost" onPress={retire} style={styles.retireGhostButton} />
          )}
        </>
      )}

      {lastNewAchievements.length > 0 && (
        <Card style={styles.achievementCard}>
          <Text style={styles.achievementHeader}>
            {lastNewAchievements.length > 1 ? t('career.newAchievements') : t('career.newAchievement')}
          </Text>
          {lastNewAchievements.map((id) => {
            const a = getAchievement(id);
            if (!a) return null;
            return (
              <Text key={id} style={styles.achievementLine}>
                {a.icon} {pick(a.name)}
              </Text>
            );
          })}
        </Card>
      )}

      <Text style={styles.sectionLabel}>{t('career.historyTitle')}</Text>
      <SeasonHistoryTable records={recentHistory} showGk={isGk} emptyText={t('career.historyEmpty')} />

      <Button
        label={t('career.viewAchievements')}
        variant="ghost"
        onPress={() => navigation.navigate('LegendAchievements')}
        style={styles.viewAchievementsButton}
      />

      <Button
        label={t('career.abandonCareer')}
        variant="ghost"
        onPress={discardCareer}
        style={styles.abandonButton}
      />
    </Screen>
  );
}

function StatBlock({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function formatValue(value: number): string {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}K`;
  return `€${value}`;
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  brand: {
    ...typography.caption,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  season: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
  statusCard: {
    marginBottom: spacing.md,
  },
  statusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  flag: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  playerName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  playerMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  loanBadge: {
    ...typography.caption,
    color: colors.warning,
    marginTop: 2,
  },
  ovrBadge: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  ovrValue: {
    ...typography.stat,
    color: colors.black,
  },
  ovrLabel: {
    ...typography.caption,
    color: colors.black,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBlock: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  trophyLine: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  trophyCaseRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  eventCard: {
    marginBottom: spacing.md,
    borderColor: colors.accent,
  },
  forcedCard: {
    borderColor: colors.warning,
  },
  eventTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  eventDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  choiceButton: {
    marginBottom: spacing.sm,
  },
  choiceCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderColor: colors.border,
  },
  choiceCardAccent: {
    borderColor: colors.accent,
  },
  choiceLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  choiceDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  choiceEffectLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    opacity: 0.7,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipPositive: {
    backgroundColor: 'rgba(61, 220, 132, 0.12)',
    borderColor: colors.success,
  },
  chipNegative: {
    backgroundColor: 'rgba(229, 72, 77, 0.12)',
    borderColor: colors.danger,
  },
  chipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chipTextPositive: {
    color: colors.success,
  },
  chipTextNegative: {
    color: colors.danger,
  },
  loanSectionTitle: {
    ...typography.caption,
    color: colors.accent,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  offerCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerClubName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  offerLeague: {
    ...typography.caption,
    color: colors.accent,
  },
  offerMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  nextButton: {
    marginBottom: spacing.sm,
  },
  retireGhostButton: {
    marginBottom: spacing.md,
  },
  achievementCard: {
    marginBottom: spacing.md,
    borderColor: colors.warning,
  },
  achievementHeader: {
    ...typography.bodyBold,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  achievementLine: {
    ...typography.body,
    color: colors.textPrimary,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  viewAchievementsButton: {
    marginBottom: spacing.sm,
  },
  abandonButton: {
    marginBottom: spacing.xl,
  },
});
