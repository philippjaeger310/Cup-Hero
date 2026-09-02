import { CareerEvent, LocalizedText } from '../types';

// Starter decision-event pool for "Become a Legend". Each event mirrors the
// accept/reject structure seen on copero.com.ar: two mutually exclusive
// choices with different short/long-term consequences. Expand this list
// freely — the engine picks weighted-random events appropriate to the
// player's current age.

// Short localized notes attached to a season record when a choice resolves.
// Keyed so the season-history tables can render the right language without
// re-deriving text from the event data at read time.
export const EVENT_NOTES: Record<string, LocalizedText> = {
  'adapted-new-role': { en: 'Adapted to a new role', de: 'An neue Rolle angepasst' },
  'stayed-natural-position': { en: 'Stayed in natural position', de: 'In gewohnter Position geblieben' },
  'moved-to-bigger-club': { en: 'Moved to a bigger club', de: 'Zu einem größeren Verein gewechselt' },
  'stayed-loyal': { en: 'Stayed loyal to the club', de: 'Dem Verein treu geblieben' },
  'rushed-back-injury': { en: 'Rushed back from injury', de: 'Verletzung überstürzt ausgeheilt' },
  'recovered-fully': { en: 'Recovered fully from injury', de: 'Vollständig von Verletzung erholt' },
  'adapted-new-tactics': { en: 'Adapted to new tactics', de: 'An neue Taktik angepasst' },
  'clashed-with-coach': { en: 'Clashed with new coach', de: 'Konflikt mit neuem Trainer' },
  'signed-long-term': { en: 'Signed a long-term deal', de: 'Langfristigen Vertrag unterschrieben' },
  'let-contract-run-down': { en: 'Let the contract run down', de: 'Vertrag auslaufen lassen' },
  'went-on-loan': { en: 'Went out on loan', de: 'Auf Leihbasis gewechselt' },
  'fought-for-spot': { en: 'Fought for a first-team spot', de: 'Um Stammplatz gekämpft' },
  'became-captain': { en: 'Became club captain', de: 'Vereinskapitän geworden' },
  'declined-captaincy': { en: 'Declined the captaincy', de: 'Kapitänsamt abgelehnt' },
  'called-up-national-team': { en: 'Called up to the national team', de: 'Für die Nationalmannschaft nominiert' },
  'prioritised-club': { en: 'Prioritised club football', de: 'Vereinsfußball priorisiert' },
  'backed-wage-demand': { en: 'Backed the wage demand', de: 'Gehaltsforderung unterstützt' },
  'stayed-out-of-politics': { en: 'Stayed out of dressing-room politics', de: 'Kabinenpolitik gemieden' },
  'moved-abroad': { en: 'Moved abroad', de: 'Ins Ausland gewechselt' },
  'stayed-domestic': { en: 'Stayed in domestic football', de: 'In der Heimatliga geblieben' },
  'signed-sponsorship': { en: 'Signed a sponsorship deal', de: 'Sponsoring-Deal unterschrieben' },
  'declined-distractions': { en: 'Declined outside distractions', de: 'Ablenkungen von außen abgelehnt' },
  'mentored-teammate': { en: 'Mentored a young teammate', de: 'Junges Talent gefördert' },
  'focused-on-self': { en: 'Focused on personal performance', de: 'Auf eigene Leistung fokussiert' },
  'began-farewell-season': { en: 'Began a farewell season', de: 'Abschiedssaison begonnen' },
  'kept-competing': { en: 'Kept competing for a starting spot', de: 'Weiter um Stammplatz gekämpft' },
};

export const CAREER_EVENTS: CareerEvent[] = [
  {
    id: 'position-change',
    title: { en: 'Position Change', de: 'Positionswechsel' },
    description: {
      en: 'Your coach wants to try you in a new position to unlock more minutes.',
      de: 'Dein Trainer will dich auf einer neuen Position testen, um dir mehr Spielzeit zu geben.',
    },
    weight: 10,
    choices: [
      {
        id: 'accept',
        label: { en: 'Accept', de: 'Annehmen' },
        description: { en: 'Adapt to the new role — starter next period.', de: 'Neue Rolle annehmen — nächste Zeit Stammspieler.' },
        effect: { appsShare: 0.85, ovrDelta: -2, noteKey: 'adapted-new-role' },
      },
      {
        id: 'reject',
        label: { en: 'Reject', de: 'Ablehnen' },
        description: { en: 'Stay in your natural position — fewer minutes.', de: 'Auf gewohnter Position bleiben — weniger Spielzeit.' },
        effect: { appsShare: 0.4, noteKey: 'stayed-natural-position' },
      },
    ],
  },
  {
    id: 'transfer-offer-bigger-club',
    title: { en: 'Transfer Offer', de: 'Transferangebot' },
    description: { en: 'A club from a higher tier wants to sign you.', de: 'Ein höherklassiger Verein will dich verpflichten.' },
    minAge: 18,
    weight: 9,
    choices: [
      {
        id: 'accept',
        label: { en: 'Accept', de: 'Annehmen' },
        description: { en: 'Move up, but expect a fight for a starting spot.', de: 'Aufsteigen, aber um den Stammplatz kämpfen müssen.' },
        effect: { valueMultiplier: 1.4, appsShare: 0.5, noteKey: 'moved-to-bigger-club' },
      },
      {
        id: 'reject',
        label: { en: 'Reject', de: 'Ablehnen' },
        description: { en: 'Stay put and keep your starting role.', de: 'Bleiben und Stammplatz behalten.' },
        effect: { appsShare: 0.85, ovrDelta: 1, noteKey: 'stayed-loyal' },
      },
    ],
  },
  {
    id: 'injury-setback',
    title: { en: 'Injury Setback', de: 'Verletzungsrückschlag' },
    description: { en: 'A hamstring niggle threatens your rhythm.', de: 'Eine Oberschenkelzerrung bedroht deinen Rhythmus.' },
    weight: 6,
    choices: [
      {
        id: 'accept',
        label: { en: 'Rush back', de: 'Überstürzt zurückkehren' },
        description: { en: 'Return early to keep your place.', de: 'Früh zurückkehren, um Stammplatz zu behalten.' },
        effect: { appsShare: 0.55, ovrDelta: -3, noteKey: 'rushed-back-injury' },
      },
      {
        id: 'reject',
        label: { en: 'Take your time', de: 'Sich Zeit lassen' },
        description: { en: 'Full recovery, but you lose your spot short-term.', de: 'Vollständige Genesung, aber kurzfristig Stammplatz verloren.' },
        effect: { appsShare: 0.3, ovrDelta: 1, noteKey: 'recovered-fully' },
      },
    ],
  },
  {
    id: 'new-coach-philosophy',
    title: { en: 'New Coach Arrives', de: 'Neuer Trainer kommt' },
    description: { en: 'The incoming coach plays a demanding, high-press system.', de: 'Der neue Trainer setzt auf anspruchsvolles, hohes Pressing.' },
    weight: 7,
    choices: [
      {
        id: 'accept',
        label: { en: 'Buy in fully', de: 'Voll mitziehen' },
        description: { en: 'Commit to the new system — steep learning curve.', de: 'Sich dem neuen System verschreiben — steile Lernkurve.' },
        effect: { ovrDelta: 2, appsShare: 0.6, noteKey: 'adapted-new-tactics' },
      },
      {
        id: 'reject',
        label: { en: 'Stick to your game', de: 'Beim eigenen Spiel bleiben' },
        description: { en: 'Keep playing your way — coach loses patience.', de: 'Weiter auf eigene Art spielen — Trainer verliert Geduld.' },
        effect: { appsShare: 0.35, noteKey: 'clashed-with-coach' },
      },
    ],
  },
  {
    id: 'contract-renewal',
    title: { en: 'Contract Renewal', de: 'Vertragsverlängerung' },
    description: { en: 'The club offers a long-term deal at reduced wages.', de: 'Der Verein bietet einen langfristigen Vertrag bei reduziertem Gehalt.' },
    minAge: 21,
    weight: 8,
    choices: [
      {
        id: 'accept',
        label: { en: 'Sign long-term', de: 'Langfristig unterschreiben' },
        description: { en: 'Security now, less leverage for a big move later.', de: 'Sicherheit jetzt, weniger Verhandlungsmacht für später.' },
        effect: { valueMultiplier: 0.95, appsShare: 0.75, noteKey: 'signed-long-term' },
      },
      {
        id: 'reject',
        label: { en: 'Play it out', de: 'Auslaufen lassen' },
        description: { en: 'Bet on yourself for a bigger contract elsewhere.', de: 'Auf sich selbst setzen für einen größeren Vertrag anderswo.' },
        effect: { valueMultiplier: 1.15, appsShare: 0.5, noteKey: 'let-contract-run-down' },
      },
    ],
  },
  {
    id: 'loan-offer',
    title: { en: 'Loan Offer', de: 'Leihangebot' },
    description: { en: 'A mid-table club wants you on loan for regular minutes.', de: 'Ein Mittelfeldverein will dich auf Leihbasis für regelmäßige Einsätze.' },
    maxAge: 23,
    weight: 8,
    choices: [
      {
        id: 'accept',
        label: { en: 'Go on loan', de: 'Auf Leihbasis wechseln' },
        description: { en: 'Guaranteed minutes away from home.', de: 'Garantierte Spielzeit fernab der Heimat.' },
        effect: { appsShare: 0.9, ovrDelta: 1, noteKey: 'went-on-loan' },
      },
      {
        id: 'reject',
        label: { en: 'Fight for your spot', de: 'Um Stammplatz kämpfen' },
        description: { en: 'Stay and battle for minutes in the first team.', de: 'Bleiben und um Spielzeit in der ersten Mannschaft kämpfen.' },
        effect: { appsShare: 0.45, noteKey: 'fought-for-spot' },
      },
    ],
  },
  {
    id: 'captaincy-offer',
    title: { en: 'Captain’s Armband', de: 'Die Kapitänsbinde' },
    description: { en: 'The manager offers you the captaincy.', de: 'Der Trainer bietet dir das Kapitänsamt an.' },
    minAge: 24,
    weight: 6,
    choices: [
      {
        id: 'accept',
        label: { en: 'Accept the armband', de: 'Binde annehmen' },
        description: { en: 'Take on leadership — extra scrutiny when results dip.', de: 'Führung übernehmen — extra Kritik bei schlechten Ergebnissen.' },
        effect: { ovrDelta: 2, noteKey: 'became-captain' },
      },
      {
        id: 'reject',
        label: { en: 'Decline', de: 'Ablehnen' },
        description: { en: 'Stay focused on your own game.', de: 'Fokus auf das eigene Spiel behalten.' },
        effect: { ovrDelta: 0, noteKey: 'declined-captaincy' },
      },
    ],
  },
  {
    id: 'national-team-callup',
    title: { en: 'National Team Call-Up', de: 'Nominierung zur Nationalmannschaft' },
    description: { en: 'Your form has caught the national coach’s eye.', de: 'Deine Form ist dem Nationaltrainer aufgefallen.' },
    minAge: 19,
    weight: 7,
    choices: [
      {
        id: 'accept',
        label: { en: 'Answer the call', de: 'Der Nominierung folgen' },
        description: { en: 'Represent your country — extra fatigue and pressure.', de: 'Das Land vertreten — zusätzliche Belastung und Druck.' },
        effect: { ovrDelta: 1, noteKey: 'called-up-national-team' },
      },
      {
        id: 'reject',
        label: { en: 'Focus on the club', de: 'Auf den Verein fokussieren' },
        description: { en: 'Prioritise club form over international minutes.', de: 'Vereinsform vor Länderspieleinsätze stellen.' },
        effect: { appsShare: 0.8, noteKey: 'prioritised-club' },
      },
    ],
  },
  {
    id: 'wage-demand',
    title: { en: 'Locker Room Tension', de: 'Spannung in der Kabine' },
    description: { en: 'Teammates pressure you to back a collective wage demand.', de: 'Mitspieler drängen dich, eine gemeinsame Gehaltsforderung zu unterstützen.' },
    weight: 5,
    choices: [
      {
        id: 'accept',
        label: { en: 'Back the demand', de: 'Forderung unterstützen' },
        description: { en: 'Show solidarity — board takes note.', de: 'Solidarität zeigen — der Vorstand merkt sich das.' },
        effect: { valueMultiplier: 1.05, appsShare: 0.5, noteKey: 'backed-wage-demand' },
      },
      {
        id: 'reject',
        label: { en: 'Stay out of it', de: 'Raushalten' },
        description: { en: 'Avoid the conflict, focus on football.', de: 'Konflikt meiden, auf Fußball konzentrieren.' },
        effect: { appsShare: 0.7, noteKey: 'stayed-out-of-politics' },
      },
    ],
  },
  {
    id: 'foreign-league-offer',
    title: { en: 'Move Abroad', de: 'Wechsel ins Ausland' },
    description: { en: 'A club overseas offers a fresh challenge in a new league.', de: 'Ein Verein im Ausland bietet eine neue Herausforderung in einer anderen Liga.' },
    minAge: 20,
    weight: 6,
    choices: [
      {
        id: 'accept',
        label: { en: 'Make the move', de: 'Wechseln' },
        description: { en: 'New league, new culture — adaptation period expected.', de: 'Neue Liga, neue Kultur — Eingewöhnungszeit zu erwarten.' },
        effect: { valueMultiplier: 1.3, appsShare: 0.55, ovrDelta: -1, noteKey: 'moved-abroad' },
      },
      {
        id: 'reject',
        label: { en: 'Stay', de: 'Bleiben' },
        description: { en: 'Familiar surroundings, steady progress.', de: 'Vertraute Umgebung, stetiger Fortschritt.' },
        effect: { appsShare: 0.8, noteKey: 'stayed-domestic' },
      },
    ],
  },
  {
    id: 'sponsorship-deal',
    title: { en: 'Sponsorship Deal', de: 'Sponsoring-Deal' },
    description: { en: 'A boot brand offers a personal endorsement deal.', de: 'Ein Ausrüster bietet dir einen persönlichen Werbevertrag an.' },
    minAge: 20,
    weight: 4,
    choices: [
      {
        id: 'accept',
        label: { en: 'Sign the deal', de: 'Vertrag unterschreiben' },
        description: { en: 'Extra income and visibility — media obligations pile up.', de: 'Zusätzliches Einkommen und Sichtbarkeit — mehr Medientermine.' },
        effect: { valueMultiplier: 1.1, noteKey: 'signed-sponsorship' },
      },
      {
        id: 'reject',
        label: { en: 'Pass on it', de: 'Ablehnen' },
        description: { en: 'Keep all focus on football.', de: 'Vollen Fokus auf den Fußball behalten.' },
        effect: { ovrDelta: 1, noteKey: 'declined-distractions' },
      },
    ],
  },
  {
    id: 'veteran-mentor-role',
    title: { en: 'Mentor Role', de: 'Mentorenrolle' },
    description: { en: 'The club asks you to mentor a promising academy talent.', de: 'Der Verein bittet dich, ein vielversprechendes Nachwuchstalent zu fördern.' },
    minAge: 29,
    weight: 5,
    choices: [
      {
        id: 'accept',
        label: { en: 'Take the youngster under your wing', de: 'Den Youngster unter deine Fittiche nehmen' },
        description: { en: 'Share minutes to develop the next generation.', de: 'Spielzeit teilen, um die nächste Generation zu fördern.' },
        effect: { appsShare: 0.5, noteKey: 'mentored-teammate' },
      },
      {
        id: 'reject',
        label: { en: 'Play for yourself', de: 'Für dich selbst spielen' },
        description: { en: 'Keep chasing your own minutes and milestones.', de: 'Weiter eigene Spielzeit und Meilensteine verfolgen.' },
        effect: { appsShare: 0.75, noteKey: 'focused-on-self' },
      },
    ],
  },
  {
    id: 'retirement-consideration',
    title: { en: 'Thinking About Retirement', de: 'Gedanken ans Karriereende' },
    description: { en: 'Age is catching up — the club floats a farewell season.', de: 'Das Alter holt dich ein — der Verein schlägt eine Abschiedssaison vor.' },
    minAge: 33,
    weight: 6,
    choices: [
      {
        id: 'accept',
        label: { en: 'Plan a farewell season', de: 'Abschiedssaison planen' },
        description: { en: 'Reduced role, ceremonial send-off.', de: 'Reduzierte Rolle, feierlicher Abschied.' },
        effect: { appsShare: 0.35, noteKey: 'began-farewell-season' },
      },
      {
        id: 'reject',
        label: { en: 'Keep competing', de: 'Weiterkämpfen' },
        description: { en: 'Fight to stay in the starting XI as long as possible.', de: 'So lange wie möglich um den Stammplatz kämpfen.' },
        effect: { appsShare: 0.6, ovrDelta: -1, noteKey: 'kept-competing' },
      },
    ],
  },
];

export function eligibleEvents(age: number): CareerEvent[] {
  return CAREER_EVENTS.filter(
    (e) => (e.minAge === undefined || age >= e.minAge) && (e.maxAge === undefined || age <= e.maxAge)
  );
}

// 'position-change' is the one deliberate exception to "every event happens
// at most once per career" — a coach can plausibly ask again later. Capped
// at 3 times with a minimum gap so it can't cluster.
const POSITION_CHANGE_ID = 'position-change';
const POSITION_CHANGE_MAX_OCCURRENCES = 3;
const POSITION_CHANGE_MIN_GAP_SEASONS = 2;

/**
 * Picks the next decision event for this age, excluding any event already
 * resolved this career (from `resolvedEvents`) — except `position-change`,
 * which is allowed up to POSITION_CHANGE_MAX_OCCURRENCES times, at least
 * POSITION_CHANGE_MIN_GAP_SEASONS apart. Returns null once nothing eligible
 * remains (the UI just advances the season with no event card that turn).
 */
export function pickWeightedEvent(
  age: number,
  resolvedEvents: { eventId: string; season: number }[],
  currentSeason: number
): CareerEvent | null {
  const pool = eligibleEvents(age).filter((e) => {
    if (e.id === POSITION_CHANGE_ID) {
      const occurrences = resolvedEvents.filter((r) => r.eventId === POSITION_CHANGE_ID);
      if (occurrences.length >= POSITION_CHANGE_MAX_OCCURRENCES) return false;
      const lastSeason = occurrences.length > 0 ? Math.max(...occurrences.map((o) => o.season)) : null;
      if (lastSeason !== null && currentSeason - lastSeason < POSITION_CHANGE_MIN_GAP_SEASONS) return false;
      return true;
    }
    return !resolvedEvents.some((r) => r.eventId === e.id);
  });
  if (pool.length === 0) return null;
  const totalWeight = pool.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const event of pool) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }
  return pool[pool.length - 1];
}
