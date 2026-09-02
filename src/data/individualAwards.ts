import { IndividualAwardDef } from '../types';

// Individual awards. Originally all deliberately fictional (not named after
// any real-world trophy) to stay clear of real-award branding — 'ringless'
// awards. That changed for 'player-of-the-season' by explicit user
// decision: it's now named after the real Ballon d'Or, same
// accepted-trademark-risk category as the real club/competition names and
// crest/trophy images used elsewhere in this project (see the header
// comment in clubs.ts). The rest stay fictional/Cup-Hero-branded. Awarding
// odds live in careerEngine.ts.
export const INDIVIDUAL_AWARDS: IndividualAwardDef[] = [
  {
    id: 'player-of-the-season',
    name: { en: "Ballon d'Or", de: "Ballon d'Or" },
    description: { en: 'Voted the standout performer of an elite season.', de: 'Zum herausragenden Spieler einer Weltklasse-Saison gewählt.' },
    icon: '⭐',
  },
  {
    id: 'young-talent',
    name: { en: 'Cup Hero Young Talent', de: 'Cup Hero Nachwuchstalent' },
    description: { en: 'Recognized as the breakout young talent of the season.', de: 'Als Ausnahmetalent der Saison ausgezeichnet.' },
    icon: '🌟',
  },
  {
    id: 'wall-of-the-season',
    name: { en: 'Wall of the Season', de: 'Fels in der Brandung' },
    description: { en: 'An outstanding season between the posts.', de: 'Eine herausragende Saison zwischen den Pfosten.' },
    icon: '🧤',
  },
  {
    id: 'top-scorer',
    name: { en: 'Cup Hero Top Scorer', de: 'Cup Hero Torschützenkönig' },
    description: { en: 'Finished the season as the most prolific scorer at the club.', de: 'Die Saison als torgefährlichster Spieler des Vereins beendet.' },
    icon: '👟',
  },
];

export function getIndividualAward(id: string): IndividualAwardDef | undefined {
  return INDIVIDUAL_AWARDS.find((a) => a.id === id);
}
