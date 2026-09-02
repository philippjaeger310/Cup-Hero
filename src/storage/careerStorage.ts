import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerState, UnlockedAchievement } from '../types';

const ACTIVE_CAREER_KEY = 'cup-hero:active-career';
const CAREER_HISTORY_KEY = 'cup-hero:career-history'; // completed careers, most recent first
const ACHIEVEMENT_LOG_KEY = 'cup-hero:achievement-log';
const LAST_PLAYER_NAME_KEY = 'cup-hero:last-player-name';
const LAST_NATIONALITY_KEY = 'cup-hero:last-nationality';
const LAST_DIFFICULTY_KEY = 'cup-hero:last-difficulty';
const LAST_NUMBER_KEY = 'cup-hero:last-number';
const LAST_FOOT_KEY = 'cup-hero:last-foot';
const LAST_POSITION_KEY = 'cup-hero:last-position';

export async function saveActiveCareer(state: PlayerState): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_CAREER_KEY, JSON.stringify(state));
}

export async function loadActiveCareer(): Promise<PlayerState | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_CAREER_KEY);
  return raw ? (JSON.parse(raw) as PlayerState) : null;
}

export async function clearActiveCareer(): Promise<void> {
  await AsyncStorage.removeItem(ACTIVE_CAREER_KEY);
}

export async function archiveCareer(state: PlayerState): Promise<void> {
  const raw = await AsyncStorage.getItem(CAREER_HISTORY_KEY);
  const history: PlayerState[] = raw ? JSON.parse(raw) : [];
  history.unshift(state);
  await AsyncStorage.setItem(CAREER_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
  await clearActiveCareer();
}

export async function loadCareerHistory(): Promise<PlayerState[]> {
  const raw = await AsyncStorage.getItem(CAREER_HISTORY_KEY);
  return raw ? (JSON.parse(raw) as PlayerState[]) : [];
}

export async function logAchievementUnlocks(unlocks: UnlockedAchievement[]): Promise<void> {
  if (unlocks.length === 0) return;
  const raw = await AsyncStorage.getItem(ACHIEVEMENT_LOG_KEY);
  const log: UnlockedAchievement[] = raw ? JSON.parse(raw) : [];
  log.push(...unlocks);
  await AsyncStorage.setItem(ACHIEVEMENT_LOG_KEY, JSON.stringify(log));
}

export async function loadAchievementLog(): Promise<UnlockedAchievement[]> {
  const raw = await AsyncStorage.getItem(ACHIEVEMENT_LOG_KEY);
  return raw ? (JSON.parse(raw) as UnlockedAchievement[]) : [];
}

/** Remembers the last-used last name so a new career pre-fills it (still editable). */
export async function saveLastPlayerName(lastName: string): Promise<void> {
  if (!lastName) return;
  await AsyncStorage.setItem(LAST_PLAYER_NAME_KEY, lastName);
}

export async function loadLastPlayerName(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_PLAYER_NAME_KEY);
}

/** Remembers the last-used nationality so a new career pre-fills it (still editable). */
export async function saveLastNationality(code: string): Promise<void> {
  if (!code) return;
  await AsyncStorage.setItem(LAST_NATIONALITY_KEY, code);
}

export async function loadLastNationality(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_NATIONALITY_KEY);
}

// Difficulty, squad number, preferred foot, and position all follow the same
// pre-fill pattern as last name / nationality above — remembered from the
// previous career start, still fully changeable before starting the next one.

export async function saveLastDifficulty(difficulty: string): Promise<void> {
  await AsyncStorage.setItem(LAST_DIFFICULTY_KEY, difficulty);
}

export async function loadLastDifficulty(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_DIFFICULTY_KEY);
}

export async function saveLastNumber(number: string): Promise<void> {
  if (!number) return;
  await AsyncStorage.setItem(LAST_NUMBER_KEY, number);
}

export async function loadLastNumber(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_NUMBER_KEY);
}

export async function saveLastFoot(foot: string): Promise<void> {
  await AsyncStorage.setItem(LAST_FOOT_KEY, foot);
}

export async function loadLastFoot(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_FOOT_KEY);
}

export async function saveLastPosition(position: string): Promise<void> {
  await AsyncStorage.setItem(LAST_POSITION_KEY, position);
}

export async function loadLastPosition(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_POSITION_KEY);
}
