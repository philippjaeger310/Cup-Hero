import { Achievement, PlayerState } from '../types';
import { getClub } from './clubs';

// Achievement pool inspired by the career-milestone concept on
// copero.com.ar/juegos (a trophy-case of narrative career outcomes), but
// written and mechanically defined independently against our own data model.
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ringless',
    name: { en: 'Ringless', de: 'Ohne Titel' },
    description: { en: 'Finished a career with zero trophies.', de: 'Karriere ohne einen einzigen Titel beendet.' },
    icon: '🫥',
    check: (p) => p.retired && p.trophies.length === 0,
  },
  {
    id: 'century-club',
    name: { en: 'Century Club', de: 'Jahrhundertklub' },
    description: { en: 'Scored 100 or more career goals.', de: '100 oder mehr Karrieretore erzielt.' },
    icon: '⚽',
    check: (p) => p.careerStats.goals >= 100,
  },
  {
    id: 'the-provider',
    name: { en: 'The Provider', de: 'Der Vorlagengeber' },
    description: { en: 'Registered 100 or more career assists.', de: '100 oder mehr Karrierevorlagen gegeben.' },
    icon: '🎯',
    check: (p) => p.careerStats.assists >= 100,
  },
  {
    id: 'iron-man',
    name: { en: 'Iron Man', de: 'Eisenmann' },
    description: { en: 'Made 400 or more career appearances.', de: '400 oder mehr Karriereeinsätze absolviert.' },
    icon: '🛡️',
    check: (p) => p.careerStats.apps >= 400,
  },
  {
    id: 'club-legend',
    name: { en: 'Club Legend', de: 'Vereinslegende' },
    description: { en: 'Spent 10 or more seasons at a single club.', de: '10 oder mehr Saisons bei einem einzigen Verein verbracht.' },
    icon: '🏟️',
    check: (p) => p.clubStints.some((s) => s.toSeason - s.fromSeason + 1 >= 10),
  },
  {
    id: 'tile-setter',
    name: { en: 'Well Traveled', de: 'Weitgereist' },
    description: { en: 'Played for 8 or more different clubs.', de: 'Für 8 oder mehr verschiedene Vereine gespielt.' },
    icon: '🧭',
    check: (p) => new Set(p.clubStints.map((s) => s.clubId)).size >= 8,
  },
  {
    id: 'from-the-bottom',
    name: { en: 'From the Bottom', de: 'Von ganz unten' },
    description: {
      en: 'Started at a smaller club and reached elite level (90+ OVR).',
      de: 'Bei einem kleineren Verein gestartet und Weltklasse erreicht (90+ OVR).',
    },
    icon: '📈',
    check: (p) => {
      const firstClub = getClub(p.clubStints[0]?.clubId ?? '');
      return firstClub.tier === 3 && p.ovr >= 90;
    },
  },
  {
    id: 'giant-killer',
    name: { en: 'Giant Killer', de: 'Riesentöter' },
    description: { en: 'Won a trophy while rated below 75 OVR.', de: 'Einen Titel mit einem OVR unter 75 gewonnen.' },
    icon: '🗡️',
    check: (p) => p.trophies.length > 0 && p.history.some((h) => h.ovr < 75 && p.trophies.some((t) => t.season === h.season)),
  },
  {
    id: 'goat',
    name: { en: 'GOAT', de: 'GOAT' },
    description: { en: 'Reached a peak rating of 95 or higher.', de: 'Eine Höchstbewertung von 95 oder mehr erreicht.' },
    icon: '🐐',
    check: (p) => p.history.some((h) => h.ovr >= 95) || p.ovr >= 95,
  },
  {
    id: 'complete-footballer',
    name: { en: 'Complete Footballer', de: 'Kompletter Fußballer' },
    description: { en: 'Recorded 20+ goals and 20+ assists in a single season.', de: '20+ Tore und 20+ Vorlagen in einer einzigen Saison.' },
    icon: '🧠',
    check: (p) => p.history.some((h) => h.goals >= 20 && h.assists >= 20),
  },
  {
    id: 'full-international',
    name: { en: 'Full International', de: 'A-Nationalspieler' },
    description: { en: 'Earned 50 or more caps for the national team.', de: '50 oder mehr Länderspiele für die Nationalmannschaft.' },
    icon: '🌍',
    check: (p) => p.nationalTeamCaps >= 50,
  },
  {
    id: 'the-treble',
    name: { en: 'The Treble', de: 'Das Triple' },
    description: { en: 'Won three trophies in a single season.', de: 'Drei Titel in einer einzigen Saison gewonnen.' },
    icon: '🏆',
    check: (p) => {
      const bySeason: Record<number, number> = {};
      for (const t of p.trophies) bySeason[t.season] = (bySeason[t.season] ?? 0) + 1;
      return Object.values(bySeason).some((count) => count >= 3);
    },
  },
  {
    id: 'serial-winner',
    name: { en: 'Serial Winner', de: 'Serienmeister' },
    description: {
      en: 'Won the same title in 3 consecutive seasons.',
      de: 'Denselben Titel in 3 aufeinanderfolgenden Saisons gewonnen.',
    },
    icon: '👑',
    check: (p) => {
      const seasonsByCompetition: Record<string, number[]> = {};
      for (const t of p.trophies) {
        (seasonsByCompetition[t.competitionId] ??= []).push(t.season);
      }
      return Object.values(seasonsByCompetition).some((seasons) => {
        const sorted = [...new Set(seasons)].sort((a, b) => a - b);
        return sorted.some((s, i) => i >= 2 && sorted[i - 1] === s - 1 && sorted[i - 2] === s - 2);
      });
    },
  },
  {
    id: 'local-hero',
    name: { en: 'Local Hero', de: 'Lokalheld' },
    description: {
      en: 'Played an entire career without leaving your home country.',
      de: 'Die gesamte Karriere im Heimatland verbracht, ohne ins Ausland zu wechseln.',
    },
    icon: '🏠',
    check: (p) =>
      p.retired &&
      p.clubStints.every((s) => getClub(s.clubId).country === p.identity.nationality),
  },
  {
    id: 'loan-graduate',
    name: { en: 'Loan Graduate', de: 'Leihe mit Erfolg' },
    description: {
      en: 'Earned your way back from a loan spell to your parent club.',
      de: 'Dir nach einer Leihe den Weg zurück zum Stammverein erspielt.',
    },
    icon: '🎓',
    check: (p) => p.loanReturnsRetained >= 1,
  },
  {
    id: 'bounced-back',
    name: { en: 'Bounced Back', de: 'Comeback' },
    description: {
      en: 'Won a trophy after once being at risk of losing your contract.',
      de: 'Einen Titel gewonnen, nachdem dein Vertrag einmal auf der Kippe stand.',
    },
    icon: '💪',
    check: (p) => p.everContractAtRisk && p.trophies.length > 0,
  },
  {
    id: 'retired-on-top',
    name: { en: 'Retired on Top', de: 'Auf dem Höhepunkt aufgehört' },
    description: {
      en: 'Chose to retire voluntarily while still rated 85 OVR or higher.',
      de: 'Freiwillig zurückgetreten, während dein OVR noch bei 85 oder höher lag.',
    },
    icon: '🎬',
    check: (p) => p.retired && p.retirementReason === 'voluntary' && p.ovr >= 85,
  },
  {
    id: 'decorated-individual',
    name: { en: 'Decorated', de: 'Vielfach ausgezeichnet' },
    description: {
      en: 'Collected 3 or more individual awards across your career.',
      de: '3 oder mehr individuelle Auszeichnungen in deiner Karriere gesammelt.',
    },
    icon: '🎖️',
    check: (p) => p.individualAwards.length >= 3,
  },
  {
    id: 'brick-wall',
    name: { en: 'Brick Wall', de: 'Unüberwindbar' },
    description: {
      en: 'Kept 100 or more career clean sheets as a goalkeeper.',
      de: 'Als Torhüter 100 oder mehr Karriere-Zu-Null-Spiele gehalten.',
    },
    icon: '🧱',
    check: (p) => p.cleanSheets >= 100,
  },
];

export function evaluateAchievements(player: PlayerState): string[] {
  return ACHIEVEMENTS.filter((a) => a.check(player)).map((a) => a.id);
}

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
