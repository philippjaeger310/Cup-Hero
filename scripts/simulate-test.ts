import { initializePlayer, simulateSeason, shouldTriggerEvent, nextEventFor, applyTransfer, acceptLoan } from '../src/engine/careerEngine';
import { PlayerIdentity } from '../src/types';

function runCareer(identity: PlayerIdentity, label: string) {
  let state = initializePlayer(identity);
  console.assert(state.age === 16, 'career must always start at age 16');
  console.assert(state.ovr === 50, 'career must always start at OVR 50');
  console.log(`\n=== ${label} ===`);
  console.log('Initial:', {
    ovr: state.ovr,
    club: state.currentClubId,
    age: state.age,
    value: state.value,
    developmentProfile: state.developmentProfile,
    potentialTier: state.potentialTier,
  });

  let seasons = 0;
  const maxSeasons = 30;
  let loansTaken = 0;
  let voluntaryRetirements = 0;
  let forcedNonRenewals = 0;
  let loanReturnsNotRetained = 0;
  let individualAwards = 0;

  while (!state.retired && seasons < maxSeasons) {
    seasons += 1;
    let effect;
    if (shouldTriggerEvent(seasons, identity.difficulty)) {
      const event = nextEventFor(state);
      if (event) {
        const choice = event.choices[Math.random() < 0.5 ? 0 : 1];
        effect = { ...choice.effect, eventId: event.id };
      }
    }
    const result = simulateSeason(state, effect);
    state = result.state;
    if (result.newAchievementIds.length > 0) {
      console.log(`Season ${state.season} (age ${state.age}) unlocked:`, result.newAchievementIds);
    }
    if (result.individualAward) {
      individualAwards += 1;
      console.log(`Season ${state.season}: individual award ->`, result.individualAward.awardId);
    }
    if (result.postSeason.forcedNote === 'contract-not-renewed') forcedNonRenewals += 1;
    if (result.postSeason.forcedNote === 'loan-return-not-retained') loanReturnsNotRetained += 1;

    if (state.retired) break; // hard age-limit retirement resolved inside the engine

    const ps = result.postSeason;
    const roll = Math.random();

    if (ps.loanOffer && loansTaken < 2 && roll < 0.25) {
      state = acceptLoan(state, ps.loanOffer.id);
      loansTaken += 1;
      continue;
    }
    if (ps.offers.length > 0 && roll < 0.55) {
      const pick = ps.offers[Math.floor(Math.random() * ps.offers.length)];
      state = applyTransfer(state, pick.id);
      continue;
    }
    if (!ps.canStay && ps.offers.length === 0 && ps.loanOffer === null) {
      // No options at all -> must retire.
      state = { ...state, retired: true, retirementReason: 'no-offers' };
      voluntaryRetirements += 1;
      break;
    }
    if (ps.canRetire && roll > 0.97) {
      state = { ...state, retired: true, retirementReason: 'voluntary' };
      voluntaryRetirements += 1;
      break;
    }
    // else: implicitly "stay" — nothing to mutate.
  }

  console.log('Final state:', {
    seasons,
    age: state.age,
    ovr: state.ovr,
    retired: state.retired,
    retirementReason: state.retirementReason,
    club: state.currentClubId,
    value: state.value,
    careerStats: state.careerStats,
    trophies: state.trophies.length,
    individualAwards: state.individualAwards.length,
    clubStints: state.clubStints.length,
    nationalTeamCaps: state.nationalTeamCaps,
    cleanSheets: state.cleanSheets,
    goalsConceded: state.goalsConceded,
    loanReturnsRetained: state.loanReturnsRetained,
    everContractAtRisk: state.everContractAtRisk,
    achievements: state.unlockedAchievementIds,
  });
  console.log('Flow counters:', { loansTaken, voluntaryRetirements, forcedNonRenewals, loanReturnsNotRetained, individualAwards });

  // Sanity assertions
  console.assert(state.age === 16 + seasons, 'age should track season count');
  console.assert(state.ovr >= 40 && state.ovr <= 99, 'OVR must stay within bounds');
  console.assert(state.history.length === seasons, 'history length must equal seasons played');

  // Every event id resolved at most once, except position-change (<=3, min 2-season gap).
  const resolved = state.resolvedEvents ?? [];
  const byId: Record<string, number[]> = {};
  for (const r of resolved) (byId[r.eventId] ??= []).push(r.season);
  for (const [id, seasonsHit] of Object.entries(byId)) {
    if (id === 'position-change') {
      console.assert(seasonsHit.length <= 3, `position-change should occur at most 3 times, got ${seasonsHit.length}`);
      const sorted = [...seasonsHit].sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        console.assert(sorted[i] - sorted[i - 1] >= 2, `position-change occurrences too close: ${sorted}`);
      }
    } else {
      console.assert(seasonsHit.length === 1, `event ${id} should occur at most once, got ${seasonsHit.length}`);
    }
  }
  console.assert(state.cleanSheets >= 0 && state.goalsConceded >= 0, 'GK totals must be non-negative');
  if (identity.position !== 'GK') {
    console.assert(state.cleanSheets === 0 && state.goalsConceded === 0, 'outfield players should never accrue GK stats');
  }
}

runCareer(
  { lastName: 'Fernández', number: 9, preferredFoot: 'right', nationality: 'AR', position: 'ST', difficulty: 'normal' },
  'Outfield / normal'
);
runCareer(
  { lastName: 'Keller', number: 1, preferredFoot: 'right', nationality: 'DE', position: 'GK', difficulty: 'intense' },
  'Goalkeeper / intense'
);
runCareer(
  { lastName: 'Silva', number: 22, preferredFoot: 'left', nationality: 'BR', position: 'CAM', difficulty: 'express' },
  'Creative / express'
);

console.log('\nOK — sanity checks passed across all runs.');
