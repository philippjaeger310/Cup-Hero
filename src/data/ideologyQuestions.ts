import { IdeologyQuestion, IdeologyResultProfile } from '../types';

// Starter question bank for the "Football Ideology Test" minigame.
// Four axes are scored: possession vs. directness, pressing intensity,
// and individualism vs. collectivism. Extend with more questions/axes
// as the real content is defined.
export const IDEOLOGY_QUESTIONS: IdeologyQuestion[] = [
  {
    id: 'q1',
    prompt: {
      en: 'Your team wins the ball in midfield. What happens next?',
      de: 'Dein Team erobert den Ball im Mittelfeld. Was passiert als Nächstes?',
    },
    options: [
      {
        id: 'q1a',
        label: { en: 'Patient buildup, keep the ball moving', de: 'Geduldiger Spielaufbau, Ball laufen lassen' },
        axis: 'possession',
        value: 2,
      },
      {
        id: 'q1b',
        label: { en: 'Quick vertical ball forward', de: 'Schneller, vertikaler Ball nach vorne' },
        axis: 'directness',
        value: 2,
      },
    ],
  },
  {
    id: 'q2',
    prompt: {
      en: 'The opposition goalkeeper has the ball. Your approach?',
      de: 'Der gegnerische Torwart hat den Ball. Wie gehst du vor?',
    },
    options: [
      {
        id: 'q2a',
        label: { en: 'Press high and win it back immediately', de: 'Hoch pressen und sofort zurückerobern' },
        axis: 'pressing',
        value: 2,
      },
      {
        id: 'q2b',
        label: { en: 'Drop into a mid-block and stay organized', de: 'Ins Mittelfeldpressing fallen und organisiert bleiben' },
        axis: 'pressing',
        value: -2,
      },
    ],
  },
  {
    id: 'q3',
    prompt: {
      en: 'A player on your team has a chance to dribble past two defenders.',
      de: 'Ein Spieler deines Teams hat die Chance, zwei Verteidiger zu dribbeln.',
    },
    options: [
      {
        id: 'q3a',
        label: { en: 'Backed to go for it — creativity wins games', de: 'Soll es versuchen — Kreativität entscheidet Spiele' },
        axis: 'individualism',
        value: 2,
      },
      {
        id: 'q3b',
        label: { en: 'Should pass — the team shape matters more', de: 'Soll abspielen — die Teamstruktur zählt mehr' },
        axis: 'individualism',
        value: -2,
      },
    ],
  },
  {
    id: 'q4',
    prompt: { en: 'Your favorite kind of goal to watch?', de: 'Welche Art von Tor siehst du am liebsten?' },
    options: [
      {
        id: 'q4a',
        label: { en: 'A 20-pass move ending in a tap-in', de: 'Ein 20-Pass-Spielzug, der in einem Tap-in endet' },
        axis: 'possession',
        value: 2,
      },
      {
        id: 'q4b',
        label: { en: 'A long-range strike from a quick counter', de: 'Ein Fernschuss aus einem schnellen Konter' },
        axis: 'directness',
        value: 2,
      },
    ],
  },
  {
    id: 'q5',
    prompt: {
      en: 'Losing the ball in your own half — what should happen?',
      de: 'Ballverlust in der eigenen Hälfte — was sollte passieren?',
    },
    options: [
      {
        id: 'q5a',
        label: { en: 'Immediate counter-press to win it back', de: 'Sofortiges Gegenpressing zur Rückeroberung' },
        axis: 'pressing',
        value: 2,
      },
      {
        id: 'q5b',
        label: { en: 'Reset shape and defend as a block', de: 'Formation ordnen und im Verbund verteidigen' },
        axis: 'pressing',
        value: -1,
      },
    ],
  },
  {
    id: 'q6',
    prompt: { en: 'How should a team be built?', de: 'Wie sollte ein Team aufgebaut sein?' },
    options: [
      {
        id: 'q6a',
        label: { en: 'Around one or two standout talents', de: 'Um ein oder zwei Ausnahmetalente herum' },
        axis: 'individualism',
        value: 2,
      },
      {
        id: 'q6b',
        label: { en: 'Around a balanced, interchangeable collective', de: 'Um ein ausgeglichenes, austauschbares Kollektiv herum' },
        axis: 'individualism',
        value: -2,
      },
    ],
  },
];

export const IDEOLOGY_PROFILES: IdeologyResultProfile[] = [
  {
    id: 'tiki-taka-architect',
    name: { en: 'Tiki-Taka Architect', de: 'Tiki-Taka-Architekt' },
    description: {
      en: 'You value control, patience, and death by a thousand passes.',
      de: 'Du schätzt Kontrolle, Geduld und den Tod durch tausend Pässe.',
    },
    matches: (s) => s.possession >= 2 && s.individualism <= 0,
  },
  {
    id: 'counter-attack-purist',
    name: { en: 'Counter-Attack Purist', de: 'Konter-Purist' },
    description: {
      en: 'Defend deep, break at speed, punish space in transition.',
      de: 'Tief verteidigen, schnell umschalten, Räume im Übergang bestrafen.',
    },
    matches: (s) => s.directness >= 2 && s.pressing <= 0,
  },
  {
    id: 'gegenpress-disciple',
    name: { en: 'Gegenpress Disciple', de: 'Gegenpressing-Jünger' },
    description: {
      en: 'Win the ball back the moment you lose it — chaos by design.',
      de: 'Den Ball im Moment des Verlusts zurückerobern — Chaos mit Absicht.',
    },
    matches: (s) => s.pressing >= 2,
  },
  {
    id: 'individualist-romantic',
    name: { en: 'Individualist Romantic', de: 'Individualistischer Romantiker' },
    description: {
      en: 'You want a genius on the ball who can win the game alone.',
      de: 'Du willst ein Ausnahmetalent, das das Spiel alleine entscheiden kann.',
    },
    matches: (s) => s.individualism >= 2,
  },
  {
    id: 'balanced-pragmatist',
    name: { en: 'Balanced Pragmatist', de: 'Ausgewogener Pragmatiker' },
    description: {
      en: 'No single dogma — you adapt the plan to the opponent.',
      de: 'Kein festes Dogma — du passt den Plan an den Gegner an.',
    },
    matches: () => true, // fallback profile
  },
];

export function resolveIdeologyProfile(
  scores: Record<'possession' | 'directness' | 'pressing' | 'individualism', number>
): IdeologyResultProfile {
  return (
    IDEOLOGY_PROFILES.find((p) => p.id !== 'balanced-pragmatist' && p.matches(scores)) ??
    IDEOLOGY_PROFILES[IDEOLOGY_PROFILES.length - 1]
  );
}
