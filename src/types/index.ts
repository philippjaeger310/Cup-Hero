// ---- Core domain types for the "Become a Legend" career simulator ----

/** Any user-facing text that needs both German and English variants. */
export interface LocalizedText {
  en: string;
  de: string;
}

export type Position =
  | 'GK'
  | 'CB'
  | 'LB'
  | 'RB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'LM'
  | 'RM'
  | 'LW'
  | 'RW'
  | 'ST';

export type PreferredFoot = 'left' | 'right' | 'both';

export type Difficulty = 'intense' | 'normal' | 'express';
// intense  -> a decision every 1 season
// normal   -> a decision every 2 seasons
// express  -> a decision every 3 seasons

/** Tactical role grouping used to organize the position picker. */
export type PositionRole = 'attack' | 'midfield' | 'defense' | 'goalkeeper';

/**
 * How a player's OVR tends to develop with age. Assigned once at career
 * start (goalkeepers always get 'goalkeeper', which declines more gently
 * in the 30s than any outfield profile). Own curve/values — see
 * developmentDelta() in careerEngine.ts.
 */
export type DevelopmentProfile = 'early' | 'normal' | 'late' | 'goalkeeper';

export type RetirementReason = 'voluntary' | 'no-offers' | 'age-limit';

export interface Country {
  code: string; // ISO 3166-1 alpha-2, e.g. "AR"
  name: LocalizedText;
  flagEmoji: string;
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  country: string; // Country code
  tier: 1 | 2 | 3; // 1 = elite/global reputation bracket, 2 = solid/known, 3 = smaller/lesser-known
  // NOTE: "tier" is a simplified in-game reputation bracket, not a claim
  // about which real-world division a club currently plays in.
  colorPrimary: string;
  colorSecondary: string;
  reputation: number; // 1-100, influences transfer offers and OVR ceiling
  league: string; // real current league name, e.g. "Bundesliga"
  division: 1 | 2; // which of that country's two researched divisions (always 1 for single-division countries)
  logoUrl: string | null; // real club crest image URL, or null if genuinely not found (see clubs.ts header)
  isReserveTeam?: boolean; // e.g. Real Sociedad B — a first team's reserve/B-side playing in a senior division
}

export interface PlayerIdentity {
  lastName: string;
  number: number;
  preferredFoot: PreferredFoot;
  nationality: string; // Country code
  position: Position;
  difficulty: Difficulty;
}

export interface SeasonRecord {
  season: number; // sequential season index, 1-based
  age: number;
  clubId: string;
  ovr: number;
  value: number; // market value in EUR at the end of this season — see PlayerState.value
  apps: number;
  goals: number;
  assists: number;
  /** Goalkeeper-only per-season stats; undefined for outfield players. */
  cleanSheets?: number;
  goalsConceded?: number;
  onLoan?: boolean;
  tier: 'early' | 'peak' | 'normal';
  noteKey?: string; // key into EVENT_NOTES for a localized short note, e.g. "adapted-new-role"
}

export type CompetitionId =
  | 'league'
  | 'domestic-cup'
  | 'super-cup'
  | 'continental-cup'
  | 'europa-league' // second-tier continental prize, for clubs a notch below continental-cup level
  | 'club-world-cup' // global, not country-scoped — the rarest club prize, for the very top continental-cup winners
  | 'world-cup'; // national-team prize — gated on state.nationalTeamCaps/ovr, not club reputation; see maybeWorldCup()

export interface Trophy {
  id: string;
  competitionId: CompetitionId;
  season: number;
  clubId: string;
}

export interface CareerStats {
  apps: number;
  goals: number;
  assists: number;
}

export interface ClubStint {
  clubId: string;
  fromSeason: number;
  toSeason: number;
  stats: CareerStats;
  onLoan?: boolean;
}

/** A won individual (personal, non-collective) prize — distinct from club/national trophies. */
export interface IndividualAward {
  id: string;
  awardId: string; // key into INDIVIDUAL_AWARDS catalog
  season: number;
  clubId: string;
}

export interface PlayerState {
  identity: PlayerIdentity;
  age: number;
  season: number;
  ovr: number;
  value: number; // market value in EUR
  currentClubId: string;
  developmentProfile: DevelopmentProfile;
  potentialTier: number; // -1..5, set at career start, drives starting OVR
  history: SeasonRecord[];
  clubStints: ClubStint[];
  trophies: Trophy[];
  individualAwards: IndividualAward[];
  careerStats: CareerStats;
  /** Goalkeeper-only career totals; stay 0 for outfield players. */
  cleanSheets: number;
  goalsConceded: number;
  nationalTeamCaps: number;
  nationalTeamGoals: number;
  // Squad-role risk tracking (drives forced contract non-renewal).
  consecutiveBenchSeasons: number;
  consecutiveLowRotationSeasons: number;
  contractAtRisk: boolean;
  everContractAtRisk: boolean;
  // Loan state — set while temporarily out at another club.
  onLoanAtClubId?: string;
  parentClubId?: string;
  loanReturnsRetained: number;
  retired: boolean;
  retirementReason?: RetirementReason;
  unlockedAchievementIds: string[];
  /**
   * Every decision event resolved so far (either choice), by event id and
   * the season it was resolved in — see pickWeightedEvent() in events.ts.
   * Every event occurs at most once per career except 'position-change',
   * which may recur up to 3 times with at least 2 seasons between
   * occurrences. Optional so saved careers from before this field existed
   * still load — always default to [] when reading.
   */
  resolvedEvents?: { eventId: string; season: number }[];
}

/**
 * What the player can do at the end of a season, resolved by
 * resolvePostSeason() in careerEngine.ts. `offers`/`loanOffer` may both be
 * empty/null in the same season — the UI only needs to show a card when
 * there's something to decide (see hasDecision below).
 */
export interface PostSeasonOptions {
  offers: Club[];
  loanOffer: Club | null;
  canStay: boolean;
  canRetire: boolean;
  forcedNote: 'contract-not-renewed' | 'loan-return-not-retained' | null;
  loanReturnedRetained: boolean | null;
}

export function hasDecision(options: PostSeasonOptions): boolean {
  return options.offers.length > 0 || options.loanOffer !== null || !options.canStay || options.canRetire;
}

// ---- Decision events ----

export type EventChoiceEffect = {
  ovrDelta?: number;
  valueMultiplier?: number;
  appsShare?: number; // expected share of minutes going forward (0-1)
  noteKey?: string;
  forceClubTier?: 1 | 2 | 3;
  /**
   * Set by the UI when a choice was made in response to a CareerEvent (not
   * set for the plain "no event this season" path) so simulateSeason() can
   * record it into PlayerState.resolvedEvents — see events.ts's
   * pickWeightedEvent() for how that then keeps events from repeating.
   */
  eventId?: string;
};

export interface EventChoice {
  id: string;
  label: LocalizedText;
  description: LocalizedText;
  effect: EventChoiceEffect;
}

export interface CareerEvent {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  minAge?: number;
  maxAge?: number;
  weight: number; // relative random selection weight
  choices: [EventChoice, EventChoice]; // accept / reject style, always exactly two
}

// ---- Achievements ----

export type AchievementCheck = (player: PlayerState) => boolean;

export interface Achievement {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  icon: string; // emoji or icon key, placeholder for real iconography
  check: AchievementCheck;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string; // ISO date
  season: number;
}

/** Catalog entry for a fictional in-game individual award (see IndividualAward). */
export interface IndividualAwardDef {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  icon: string;
}

// ---- Ideology test ----

export interface IdeologyQuestion {
  id: string;
  prompt: LocalizedText;
  options: {
    id: string;
    label: LocalizedText;
    axis: 'possession' | 'directness' | 'pressing' | 'individualism';
    value: number; // -2..2 contribution to the axis
  }[];
}

export interface IdeologyResultProfile {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  matches: (scores: Record<IdeologyQuestion['options'][number]['axis'], number>) => boolean;
}
