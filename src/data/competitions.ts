import { CompetitionId } from '../types';

// `rank` drives the vector <TrophyCup> cup's visual tier (color/size) in the
// compact trophy case and as a fallback when no real per-competition photo
// is bundled — see TrophyImage.tsx for which slots do have a real bundled
// asset. 1 = biggest prize, 5 = smallest. club-world-cup and europa-league
// were added alongside real trophy images the user supplied; unlike the
// original 4 slots they map to real, named competitions (see
// countryCompetitions.ts / getRealCompetition), not fictional ones.
export const COMPETITIONS: Record<CompetitionId, { rank: 1 | 2 | 3 | 4 | 5; cupColor: string }> = {
  'club-world-cup': { rank: 1, cupColor: '#F5C542' }, // gold — rarest, global prize
  'continental-cup': { rank: 1, cupColor: '#F5C542' }, // gold
  league: { rank: 2, cupColor: '#F5C542' }, // gold
  'europa-league': { rank: 3, cupColor: '#E08A3E' }, // orange/bronze — a notch below continental-cup
  'super-cup': { rank: 4, cupColor: '#C9C9C9' }, // silver
  'domestic-cup': { rank: 5, cupColor: '#CD9B60' }, // bronze
};
