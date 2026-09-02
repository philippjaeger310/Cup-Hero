import {
  CareerEvent,
  Club,
  CompetitionId,
  DevelopmentProfile,
  EventChoiceEffect,
  IndividualAward,
  Position,
  PlayerIdentity,
  PlayerState,
  PostSeasonOptions,
  SeasonRecord,
  Trophy,
} from '../types';
import { CLUBS, clubsByTier, getClub, starterClubFor } from '../data/clubs';
import { pickWeightedEvent } from '../data/events';
import { evaluateAchievements } from '../data/achievements';
import { getRealCompetition } from '../data/countryCompetitions';

const FORWARD_POSITIONS: Position[] = ['ST', 'LW', 'RW', 'CAM'];
const CREATIVE_POSITIONS: Position[] = ['CAM', 'CM', 'LW', 'RW', 'CDM', 'LM', 'RM'];
const DEFENSIVE_POSITIONS: Position[] = ['GK', 'CB', 'LB', 'RB', 'CDM'];
// 'europa-league' and 'club-world-cup' are rolled alongside the original 4
// but are conditionally excluded per-club in maybeTrophy() below — see there.
const COMPETITION_IDS: CompetitionId[] = [
  'league',
  'domestic-cup',
  'super-cup',
  'continental-cup',
  'europa-league',
  'club-world-cup',
];

const START_AGE = 16;
// Exported so the UI can turn an EventChoiceEffect's appsShare into an
// approximate "games this season" number when previewing event choices —
// see effectChips() in LegendCareerScreen.tsx.
export const MAX_SEASON_APPS = 34;
const RETIREMENT_HARD_AGE = 40;
const RETIREMENT_ELIGIBLE_AGE = 33;
const NATIONAL_TEAM_MIN_AGE = 18;
const MAX_OFFERS = 3;

// Own thresholds — how many consecutive rough seasons before a club risks
// not renewing the contract. Intense pace (1-season decision periods) is
// more lenient per period since checkpoints come around more often.
function rotationLimits(difficulty: PlayerIdentity['difficulty']) {
  return difficulty === 'intense' ? { bench: 2, lowRotation: 3 } : { bench: 1, lowRotation: 2 };
}
const BENCH_APPS_CUTOFF = 8; // apps below this in a season count as "bench"
const LOW_ROTATION_APPS_CUTOFF = 18; // apps below this count as "low rotation"

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Difficulty controls how often the player faces an explicit decision event. */
export function decisionIntervalFor(difficulty: PlayerIdentity['difficulty']): number {
  switch (difficulty) {
    case 'intense':
      return 1;
    case 'normal':
      return 2;
    case 'express':
      return 3;
  }
}

export function shouldTriggerEvent(season: number, difficulty: PlayerIdentity['difficulty']): boolean {
  return season % decisionIntervalFor(difficulty) === 0;
}

// ---- Development profile & starting OVR (own values) ----

/** Roll a development profile at career start. Goalkeepers always get their own curve. */
function rollDevelopmentProfile(position: Position): DevelopmentProfile {
  if (position === 'GK') return 'goalkeeper';
  const r = Math.random();
  if (r < 0.15) return 'early';
  if (r < 0.3) return 'late';
  return 'normal';
}

// Potential tiers -1..5 -> starting OVR. Weighted so most careers start
// mid-pack; tier itself has no further gameplay effect beyond this.
const POTENTIAL_STARTING_OVR: Record<number, number> = {
  [-1]: 46,
  0: 51,
  1: 58,
  2: 64,
  3: 70,
  4: 76,
  5: 82,
};
const POTENTIAL_WEIGHTS: [number, number][] = [
  [-1, 6],
  [0, 16],
  [1, 30],
  [2, 25],
  [3, 14],
  [4, 6],
  [5, 3],
];

function rollPotentialTier(): number {
  const total = POTENTIAL_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [tier, w] of POTENTIAL_WEIGHTS) {
    roll -= w;
    if (roll <= 0) return tier;
  }
  return 0;
}

// Every career now starts at a fixed age/rating (own decision, no longer
// derived from potentialTier — POTENTIAL_STARTING_OVR/rollPotentialTier
// are kept only because potentialTier is still stored on PlayerState; they
// no longer drive the starting OVR).
const FIXED_START_OVR = 50;

export function initializePlayer(identity: PlayerIdentity, clubId?: string): PlayerState {
  const startClub = clubId ? getClub(clubId) : starterClubFor(identity.nationality);
  const developmentProfile = rollDevelopmentProfile(identity.position);
  const potentialTier = rollPotentialTier();
  const baseOvr = FIXED_START_OVR;
  return {
    identity,
    age: START_AGE,
    season: 0,
    ovr: baseOvr,
    value: estimateValue(baseOvr, START_AGE, startClub.reputation),
    currentClubId: startClub.id,
    developmentProfile,
    potentialTier,
    history: [],
    clubStints: [{ clubId: startClub.id, fromSeason: 1, toSeason: 1, stats: { apps: 0, goals: 0, assists: 0 } }],
    trophies: [],
    individualAwards: [],
    careerStats: { apps: 0, goals: 0, assists: 0 },
    cleanSheets: 0,
    goalsConceded: 0,
    nationalTeamCaps: 0,
    nationalTeamGoals: 0,
    consecutiveBenchSeasons: 0,
    consecutiveLowRotationSeasons: 0,
    contractAtRisk: false,
    everContractAtRisk: false,
    loanReturnsRetained: 0,
    retired: false,
    unlockedAchievementIds: [],
    resolvedEvents: [],
  };
}

// ---- Market value: anchor table + interpolation + jitter (own values) ----

const VALUE_ANCHORS: [number, number][] = [
  [45, 80_000],
  [50, 200_000],
  [55, 450_000],
  [60, 900_000],
  [65, 2_000_000],
  [70, 4_500_000],
  [75, 9_000_000],
  [80, 20_000_000],
  [85, 45_000_000],
  [90, 90_000_000],
  [95, 140_000_000],
  [99, 220_000_000],
];

function anchorValueFor(ovr: number): number {
  const clamped = clamp(ovr, VALUE_ANCHORS[0][0], VALUE_ANCHORS[VALUE_ANCHORS.length - 1][0]);
  for (let i = 0; i < VALUE_ANCHORS.length - 1; i++) {
    const [lowOvr, lowVal] = VALUE_ANCHORS[i];
    const [highOvr, highVal] = VALUE_ANCHORS[i + 1];
    if (clamped >= lowOvr && clamped <= highOvr) {
      const t = (clamped - lowOvr) / (highOvr - lowOvr);
      return lowVal + t * (highVal - lowVal);
    }
  }
  return VALUE_ANCHORS[VALUE_ANCHORS.length - 1][1];
}

function estimateValue(ovr: number, age: number, clubReputation: number): number {
  const ageFactor = age <= 24 ? 1.25 : age <= 29 ? 1.0 : age <= 33 ? 0.55 : 0.22;
  const repFactor = 0.6 + clubReputation / 100;
  const jitter = randomBetween(0.95, 1.05);
  return Math.round((anchorValueFor(ovr) * ageFactor * repFactor * jitter) / 10_000) * 10_000;
}

// ---- OVR development curve (own bracket table, per profile) ----

type Range = [number, number];
const DEVELOPMENT_CURVE: Record<DevelopmentProfile, { maxAge: number; range: Range }[]> = {
  early: [
    { maxAge: 19, range: [5, 12] },
    { maxAge: 22, range: [3, 8] },
    { maxAge: 25, range: [0, 4] },
    { maxAge: 28, range: [-2, 1] },
    { maxAge: 31, range: [-3, 0] },
    { maxAge: 34, range: [-5, -1] },
    { maxAge: 37, range: [-7, -2] },
    { maxAge: 999, range: [-9, -3] },
  ],
  normal: [
    { maxAge: 19, range: [3, 9] },
    { maxAge: 22, range: [2, 6] },
    { maxAge: 25, range: [1, 4] },
    { maxAge: 28, range: [-1, 2] },
    { maxAge: 31, range: [-2, 0] },
    { maxAge: 34, range: [-4, -1] },
    { maxAge: 37, range: [-6, -2] },
    { maxAge: 999, range: [-9, -3] },
  ],
  late: [
    { maxAge: 19, range: [1, 6] },
    { maxAge: 22, range: [1, 5] },
    { maxAge: 25, range: [1, 5] },
    { maxAge: 28, range: [0, 3] },
    { maxAge: 31, range: [-1, 1] },
    { maxAge: 34, range: [-3, 0] },
    { maxAge: 37, range: [-6, -2] },
    { maxAge: 999, range: [-9, -3] },
  ],
  goalkeeper: [
    { maxAge: 19, range: [2, 7] },
    { maxAge: 22, range: [2, 6] },
    { maxAge: 25, range: [1, 5] },
    { maxAge: 28, range: [0, 3] },
    { maxAge: 31, range: [0, 2] },
    { maxAge: 34, range: [-2, 0] },
    { maxAge: 37, range: [-3, -1] },
    { maxAge: 999, range: [-5, -2] },
  ],
};

function developmentDelta(age: number, profile: DevelopmentProfile): number {
  const brackets = DEVELOPMENT_CURVE[profile];
  const bracket = brackets.find((b) => age <= b.maxAge) ?? brackets[brackets.length - 1];
  return randomBetween(bracket.range[0], bracket.range[1]);
}

function baseAppsShare(ovr: number, clubReputation: number): number {
  // Higher OVR relative to club level -> more minutes.
  const edge = clamp((ovr - clubReputation) / 40, -0.4, 0.4);
  return clamp(0.55 + edge, 0.15, 0.95);
}

function goalsAndAssistsFor(position: Position, apps: number, ovr: number): { goals: number; assists: number } {
  const quality = clamp((ovr - 50) / 50, 0, 1); // 0..1
  if (FORWARD_POSITIONS.includes(position)) {
    return {
      goals: Math.round(apps * randomBetween(0.25, 0.65) * (0.4 + quality)),
      assists: Math.round(apps * randomBetween(0.1, 0.25) * (0.4 + quality)),
    };
  }
  if (CREATIVE_POSITIONS.includes(position)) {
    return {
      goals: Math.round(apps * randomBetween(0.08, 0.22) * (0.4 + quality)),
      assists: Math.round(apps * randomBetween(0.15, 0.35) * (0.4 + quality)),
    };
  }
  if (DEFENSIVE_POSITIONS.includes(position)) {
    return {
      goals: Math.round(apps * randomBetween(0.0, 0.06) * (0.4 + quality)),
      assists: Math.round(apps * randomBetween(0.02, 0.1) * (0.4 + quality)),
    };
  }
  return { goals: Math.round(apps * 0.1), assists: Math.round(apps * 0.1) };
}

/** Goalkeeper-only per-season clean sheets / goals conceded (own formula). */
function goalkeeperStatsFor(apps: number, ovr: number): { cleanSheets: number; goalsConceded: number } {
  const cleanSheetRate = clamp(0.25 + (ovr - 60) / 150, 0.1, 0.55);
  const concededRate = clamp(1.6 - (ovr - 50) / 80, 0.6, 1.8);
  return {
    cleanSheets: Math.round(apps * cleanSheetRate),
    goalsConceded: Math.round(apps * concededRate),
  };
}

// ---- Trophies: tiered probability per competition (own values) ----

// 5 reputation tiers (0..4) derived from the acting club's reputation.
// 'europa-league' peaks at the upper-mid tiers (a notch below the clubs
// that dominate continental-cup) and 'club-world-cup' only ever fires for
// the very top tier — own values, not sourced from anything real.
const TROPHY_PROBABILITY: Record<CompetitionId, number[]> = {
  league: [0, 0.02, 0.08, 0.22, 0.42],
  'domestic-cup': [0.01, 0.03, 0.09, 0.18, 0.28],
  'super-cup': [0, 0.01, 0.04, 0.1, 0.2],
  'continental-cup': [0, 0.01, 0.05, 0.14, 0.3],
  'europa-league': [0, 0.03, 0.07, 0.06, 0.02],
  'club-world-cup': [0, 0, 0, 0, 0.035],
  // 'world-cup' isn't rolled from this reputation-tiered table at all — see
  // maybeWorldCup() below, which is keyed off the PLAYER's national-team
  // caps/OVR instead of the acting club's reputation. Present here only so
  // the Record<CompetitionId, ...> type stays exhaustive.
  'world-cup': [0, 0, 0, 0, 0],
};

function reputationTier(reputation: number): number {
  return clamp(Math.floor(reputation / 20), 0, 4);
}

function maybeTrophy(state: PlayerState, club: Club): Trophy | null {
  const tier = reputationTier(club.reputation);
  const qualityFactor = clamp(0.7 + (state.ovr - club.reputation) / 100, 0.5, 1.5);
  let won = COMPETITION_IDS.filter((id) => Math.random() < TROPHY_PROBABILITY[id][tier] * qualityFactor);
  // Europa League only exists as a real, named competition for clubs whose
  // country was researched with one (see countryCompetitions.ts) — without
  // that there's no real name/graphic to show, so skip it there entirely.
  if (won.includes('europa-league') && !getRealCompetition(club.country, 'europa-league')) {
    won = won.filter((id) => id !== 'europa-league');
  }
  if (won.length === 0) return null;
  // At most one trophy per season keeps the trophy case readable; pick the
  // most prestigious competition if several rolled true.
  const priority: CompetitionId[] = ['club-world-cup', 'continental-cup', 'league', 'europa-league', 'super-cup', 'domestic-cup'];
  const competitionId = priority.find((id) => won.includes(id)) ?? won[0];
  return { id: `${state.season}-${club.id}-${competitionId}`, competitionId, season: state.season, clubId: club.id };
}

// World Cup probability by the PLAYER's own quality tier (0..4, from OVR) —
// gated on having been an established international for a few seasons
// already (nationalTeamCaps >= 5). This is a national-team prize so it's
// deliberately not keyed off club reputation like everything else in
// TROPHY_PROBABILITY; own values, not modeling the real 4-year cadence.
const WORLD_CUP_PROBABILITY = [0, 0.004, 0.01, 0.018, 0.03];

function maybeWorldCup(state: PlayerState): Trophy | null {
  if (state.nationalTeamCaps < 5 || state.ovr < 74) return null;
  const tier = clamp(Math.floor((state.ovr - 60) / 8), 0, 4);
  if (Math.random() < WORLD_CUP_PROBABILITY[tier]) {
    return { id: `${state.season}-world-cup`, competitionId: 'world-cup', season: state.season, clubId: state.currentClubId };
  }
  return null;
}

/** Small chance of an individual award on a standout season (own catalog, own odds). */
function maybeIndividualAward(state: PlayerState, apps: number, goals: number): IndividualAward | null {
  const club = getClub(state.currentClubId);
  if (state.identity.position === 'GK') {
    const stats = goalkeeperStatsFor(apps, state.ovr);
    if (stats.cleanSheets >= 15 && Math.random() < 0.2) {
      return { id: `${state.season}-wall-of-the-season`, awardId: 'wall-of-the-season', season: state.season, clubId: club.id };
    }
    return null;
  }
  if (goals >= 20 && Math.random() < 0.18) {
    return { id: `${state.season}-top-scorer`, awardId: 'top-scorer', season: state.season, clubId: club.id };
  }
  if (state.age <= 21 && state.ovr >= 72 && Math.random() < 0.15) {
    return { id: `${state.season}-young-talent`, awardId: 'young-talent', season: state.season, clubId: club.id };
  }
  if (state.ovr >= 80 && apps >= 25 && Math.random() < 0.12) {
    return { id: `${state.season}-player-of-the-season`, awardId: 'player-of-the-season', season: state.season, clubId: club.id };
  }
  return null;
}

/**
 * Candidate clubs offered to the player after a season, for the
 * stay-or-move decision. Biased toward clubs the player has "outgrown"
 * (OVR well above current club reputation) while still including a couple
 * of lateral/realistic options.
 */
export function generateTransferOffers(state: PlayerState): Club[] {
  const current = getClub(state.currentClubId);
  const outgrown = state.ovr - current.reputation >= 15;

  const candidates = CLUBS.filter((c) => c.id !== current.id);
  const scored = candidates.map((c) => {
    const repFit = -Math.abs(c.reputation - state.ovr);
    const homeBonus = c.country === state.identity.nationality ? 6 : 0;
    const upwardBonus = outgrown && c.tier < current.tier ? 20 : 0;
    return { club: c, score: repFit + homeBonus + upwardBonus };
  });
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, MAX_OFFERS).map((s) => s.club);
}

/** Occasional loan proposal for a young, fringe player (own odds). */
function maybeLoanOffer(state: PlayerState, lastRecord: SeasonRecord | undefined): Club | null {
  if (state.age > 25) return null;
  if (!lastRecord || lastRecord.apps >= 14) return null;
  if (Math.random() > 0.35) return null;
  const current = getClub(state.currentClubId);
  const candidates = CLUBS.filter((c) => c.id !== current.id && c.reputation < current.reputation);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/** Apply a player-chosen permanent transfer, starting a new club stint next season. */
export function applyTransfer(prevState: PlayerState, newClubId: string): PlayerState {
  if (newClubId === prevState.currentClubId) return prevState;
  const state: PlayerState = JSON.parse(JSON.stringify(prevState));
  state.currentClubId = newClubId;
  state.clubStints.push({
    clubId: newClubId,
    fromSeason: state.season + 1,
    toSeason: state.season + 1,
    stats: { apps: 0, goals: 0, assists: 0 },
  });
  return state;
}

/** Accept a loan proposal: like a transfer, but flagged and remembered for the return resolution. */
export function acceptLoan(prevState: PlayerState, loanClubId: string): PlayerState {
  const moved = applyTransfer(prevState, loanClubId);
  const state: PlayerState = { ...moved };
  state.onLoanAtClubId = loanClubId;
  state.parentClubId = prevState.currentClubId;
  state.clubStints = [...state.clubStints];
  state.clubStints[state.clubStints.length - 1] = { ...state.clubStints[state.clubStints.length - 1], onLoan: true };
  return state;
}

function applyEventEffect(baseAppsShareValue: number, baseOvrDelta: number, effect?: EventChoiceEffect) {
  return {
    appsShare: effect?.appsShare ?? baseAppsShareValue,
    ovrDelta: baseOvrDelta + (effect?.ovrDelta ?? 0),
    valueMultiplier: effect?.valueMultiplier ?? 1,
    noteKey: effect?.noteKey,
    forceClubTier: effect?.forceClubTier,
  };
}

export interface SeasonResult {
  state: PlayerState;
  record: SeasonRecord;
  newAchievementIds: string[];
  trophy: Trophy | null;
  individualAward: IndividualAward | null;
  postSeason: PostSeasonOptions;
}

/**
 * Advance the player's career by one season. `chosenEffect` comes from the
 * decision event the UI presented (if any was due this season). Everyday
 * club moves are player-driven: see `postSeason` on the result, resolved by
 * the UI via `applyTransfer` / `acceptLoan` / retirement.
 */
export function simulateSeason(prevState: PlayerState, chosenEffect?: EventChoiceEffect): SeasonResult {
  const state: PlayerState = JSON.parse(JSON.stringify(prevState));
  const wasOnLoan = !!prevState.onLoanAtClubId;
  state.season += 1;
  state.age += 1;

  let club = getClub(state.currentClubId);

  const growth = developmentDelta(state.age, state.developmentProfile);
  const effect = applyEventEffect(baseAppsShare(state.ovr, club.reputation), growth, chosenEffect);

  // Record that this event was resolved (either choice) so it — with the
  // deliberate exception of 'position-change' — never comes up again this
  // career. See pickWeightedEvent() in events.ts.
  if (chosenEffect?.eventId) {
    state.resolvedEvents = [...(state.resolvedEvents ?? []), { eventId: chosenEffect.eventId, season: state.season }];
  }

  state.ovr = clamp(Math.round(state.ovr + effect.ovrDelta), 40, 99);

  const apps = clamp(Math.round(effect.appsShare * MAX_SEASON_APPS + randomBetween(-2, 2)), 0, MAX_SEASON_APPS);
  const { goals, assists } = goalsAndAssistsFor(state.identity.position, apps, state.ovr);
  const gkStats = state.identity.position === 'GK' ? goalkeeperStatsFor(apps, state.ovr) : null;

  state.value = Math.round(estimateValue(state.ovr, state.age, club.reputation) * effect.valueMultiplier);

  // Trophy roll for the season. World Cup (national team, not club-based)
  // takes priority over a club trophy if both roll true — at most one
  // trophy per season either way, see maybeTrophy()'s doc comment.
  const trophy = maybeWorldCup(state) ?? maybeTrophy(state, club);
  if (trophy) state.trophies.push(trophy);

  // Individual award roll.
  const individualAward = maybeIndividualAward(state, apps, goals);
  if (individualAward) state.individualAwards.push(individualAward);

  // National team caps once the player is good enough and old enough.
  if (state.ovr >= 74 && state.age >= NATIONAL_TEAM_MIN_AGE) {
    const caps = Math.round(randomBetween(0, 8) * clamp((state.ovr - 70) / 25, 0.2, 1.5));
    state.nationalTeamCaps += caps;
    if (FORWARD_POSITIONS.includes(state.identity.position) || CREATIVE_POSITIONS.includes(state.identity.position)) {
      state.nationalTeamGoals += Math.round(caps * randomBetween(0.1, 0.4));
    }
  }

  // Update career + club-stint aggregates.
  state.careerStats.apps += apps;
  state.careerStats.goals += goals;
  state.careerStats.assists += assists;
  if (gkStats) {
    state.cleanSheets += gkStats.cleanSheets;
    state.goalsConceded += gkStats.goalsConceded;
  }

  const activeStint = state.clubStints[state.clubStints.length - 1];
  if (activeStint && activeStint.clubId === state.currentClubId) {
    activeStint.toSeason = state.season;
    activeStint.stats.apps += apps;
    activeStint.stats.goals += goals;
    activeStint.stats.assists += assists;
  }

  const tier: SeasonRecord['tier'] = state.season <= 2 ? 'early' : state.ovr >= 85 ? 'peak' : 'normal';
  const record: SeasonRecord = {
    season: state.season,
    age: state.age,
    clubId: state.currentClubId,
    ovr: state.ovr,
    value: state.value,
    apps,
    goals,
    assists,
    cleanSheets: gkStats?.cleanSheets,
    goalsConceded: gkStats?.goalsConceded,
    onLoan: wasOnLoan,
    tier,
    noteKey: effect.noteKey,
  };
  state.history.push(record);

  // A decision-event choice can force an immediate tier-based move (rare —
  // most events just affect minutes/OVR/value). Everyday transfers go
  // through the player-driven post-season options instead.
  if (effect.forceClubTier) {
    const forced = clubsByTier(effect.forceClubTier).sort((a, b) => b.reputation - a.reputation)[0];
    if (forced && forced.id !== state.currentClubId) {
      state.currentClubId = forced.id;
      state.clubStints.push({
        clubId: forced.id,
        fromSeason: state.season + 1,
        toSeason: state.season + 1,
        stats: { apps: 0, goals: 0, assists: 0 },
      });
    }
  }

  // Squad-role risk tracking (skipped during a loan season — loans come
  // with a guaranteed-role framing, see maybeLoanOffer).
  const limits = rotationLimits(state.identity.difficulty);
  if (!wasOnLoan) {
    state.consecutiveBenchSeasons = apps < BENCH_APPS_CUTOFF ? state.consecutiveBenchSeasons + 1 : 0;
    state.consecutiveLowRotationSeasons = apps < LOW_ROTATION_APPS_CUTOFF ? state.consecutiveLowRotationSeasons + 1 : 0;
  }
  state.contractAtRisk =
    state.consecutiveBenchSeasons >= limits.bench || state.consecutiveLowRotationSeasons >= limits.lowRotation;
  if (state.contractAtRisk) state.everContractAtRisk = true;

  // Resolve a loan return, if this was the loan season.
  let loanReturnedRetained: boolean | null = null;
  if (wasOnLoan && state.parentClubId) {
    const retained = Math.random() < 0.55;
    loanReturnedRetained = retained;
    if (retained) {
      const parentId = state.parentClubId;
      state.currentClubId = parentId;
      state.clubStints.push({
        clubId: parentId,
        fromSeason: state.season + 1,
        toSeason: state.season + 1,
        stats: { apps: 0, goals: 0, assists: 0 },
      });
      state.loanReturnsRetained += 1;
      state.consecutiveBenchSeasons = 0;
      state.consecutiveLowRotationSeasons = 0;
      state.contractAtRisk = false;
    }
    state.onLoanAtClubId = undefined;
    state.parentClubId = undefined;
  }

  // Retirement check (age-limit only here; voluntary/no-offers retirement
  // is a player choice resolved from postSeason.canRetire in the UI).
  if (state.age >= RETIREMENT_HARD_AGE) {
    state.retired = true;
    state.retirementReason = 'age-limit';
  }

  const unlockedIds = evaluateAchievements(state);
  const newAchievementIds = unlockedIds.filter((id) => !state.unlockedAchievementIds.includes(id));
  state.unlockedAchievementIds = Array.from(new Set([...state.unlockedAchievementIds, ...unlockedIds]));

  const postSeason: PostSeasonOptions = state.retired
    ? { offers: [], loanOffer: null, canStay: true, canRetire: false, forcedNote: null, loanReturnedRetained: null }
    : resolvePostSeason(state, loanReturnedRetained);

  return { state, record, newAchievementIds, trophy, individualAward, postSeason };
}

function resolvePostSeason(state: PlayerState, loanReturnedRetained: boolean | null): PostSeasonOptions {
  const canRetireByAge = state.age >= RETIREMENT_ELIGIBLE_AGE;

  if (loanReturnedRetained === false) {
    return {
      offers: generateTransferOffers(state),
      loanOffer: null,
      canStay: false,
      canRetire: true,
      forcedNote: 'loan-return-not-retained',
      loanReturnedRetained: false,
    };
  }

  if (loanReturnedRetained === true) {
    return {
      offers: generateTransferOffers(state),
      loanOffer: null,
      canStay: true,
      canRetire: canRetireByAge,
      forcedNote: null,
      loanReturnedRetained: true,
    };
  }

  if (state.contractAtRisk) {
    return {
      offers: generateTransferOffers(state),
      loanOffer: null,
      canStay: false,
      canRetire: true,
      forcedNote: 'contract-not-renewed',
      loanReturnedRetained: null,
    };
  }

  const lastRecord = state.history[state.history.length - 1];
  const hasInterest = Math.random() < 0.8;
  const offers = hasInterest ? generateTransferOffers(state) : [];
  const loanOffer = maybeLoanOffer(state, lastRecord);

  return { offers, loanOffer, canStay: true, canRetire: canRetireByAge, forcedNote: null, loanReturnedRetained: null };
}

export function nextEventFor(state: PlayerState): CareerEvent | null {
  // state.season is still the season just completed here (called before the
  // upcoming season's simulateSeason() runs) — the event, if any, resolves
  // into state.season + 1, so that's the season to check position-change's
  // gap against too.
  return pickWeightedEvent(state.age, state.resolvedEvents ?? [], state.season + 1);
}

export { CLUBS };
