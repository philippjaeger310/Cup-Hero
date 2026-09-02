import { Position, PositionRole } from '../types';

// Groups the 12 playable positions into 4 tactical roles.
export const POSITION_ROLES: { role: PositionRole; positions: Position[] }[] = [
  { role: 'attack', positions: ['LW', 'ST', 'RW'] },
  { role: 'midfield', positions: ['LM', 'CAM', 'CM', 'CDM', 'RM'] },
  { role: 'defense', positions: ['LB', 'CB', 'RB'] },
  { role: 'goalkeeper', positions: ['GK'] },
];

/**
 * Schematic pitch coordinates for each position, as percentages of the
 * pitch box (0,0 = top-left, attacking direction is "up"/toward y=0). The
 * pitch box is square (see PositionPitch's aspectRatio), so an x/y percent
 * difference covers the same on-screen distance on both axes — coordinates
 * below are chosen so every pair of markers stays well clear of the other,
 * even on narrow phones. Deliberately a simple single-player-per-position
 * layout, not a full 11-a-side formation — just "roughly where this
 * position plays".
 */
export const POSITION_COORDS: Record<Position, { x: number; y: number }> = {
  LW: { x: 15, y: 8 },
  ST: { x: 50, y: 6 },
  RW: { x: 85, y: 8 },
  CAM: { x: 50, y: 25 },
  LM: { x: 12, y: 41 },
  CM: { x: 50, y: 43 },
  RM: { x: 88, y: 41 },
  CDM: { x: 50, y: 60 },
  LB: { x: 15, y: 77 },
  CB: { x: 50, y: 78 },
  RB: { x: 85, y: 77 },
  GK: { x: 50, y: 95 },
};
