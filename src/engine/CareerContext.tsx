import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { IndividualAward, PlayerIdentity, PlayerState, PostSeasonOptions, RetirementReason, Trophy } from '../types';
import { acceptLoan, applyTransfer, initializePlayer, simulateSeason } from './careerEngine';
import { archiveCareer, clearActiveCareer, loadActiveCareer, saveActiveCareer } from '../storage/careerStorage';
import { EventChoiceEffect } from '../types';

interface CareerContextValue {
  player: PlayerState | null;
  loading: boolean;
  lastNewAchievements: string[];
  lastTrophy: Trophy | null;
  lastIndividualAward: IndividualAward | null;
  /** What the player can do after the season just simulated. Null once resolved. */
  postSeason: PostSeasonOptions | null;
  startCareer: (identity: PlayerIdentity, clubId: string) => Promise<void>;
  /**
   * Simulates the next season. Pass `baseState` when chaining straight off
   * a stay/transfer/loan decision (see chooseOffer/stay/chooseLoan) so this
   * doesn't simulate against stale pre-decision state — the context's own
   * `player` hasn't necessarily re-rendered yet at that point.
   */
  advanceSeason: (effect?: EventChoiceEffect, baseState?: PlayerState) => Promise<void>;
  /** Accept a permanent transfer offer from postSeason.offers. Returns the resulting state so callers can immediately chain into advanceSeason. */
  chooseOffer: (clubId: string) => Promise<PlayerState | null>;
  /** Stay at the current club (only valid when postSeason.canStay). Returns the current state so callers can immediately chain into advanceSeason. */
  stay: () => Promise<PlayerState | null>;
  /** Accept the loan proposal in postSeason.loanOffer. Returns the resulting state so callers can immediately chain into advanceSeason. */
  chooseLoan: () => Promise<PlayerState | null>;
  /** End the career by choice (only valid when postSeason.canRetire). */
  retire: () => Promise<void>;
  dismissTrophy: () => void;
  dismissAward: () => void;
  discardCareer: () => Promise<void>;
}

const CareerContext = createContext<CareerContextValue | undefined>(undefined);

export function CareerProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastNewAchievements, setLastNewAchievements] = useState<string[]>([]);
  const [lastTrophy, setLastTrophy] = useState<Trophy | null>(null);
  const [lastIndividualAward, setLastIndividualAward] = useState<IndividualAward | null>(null);
  const [postSeason, setPostSeason] = useState<PostSeasonOptions | null>(null);

  useEffect(() => {
    loadActiveCareer()
      .then(setPlayer)
      .finally(() => setLoading(false));
  }, []);

  const startCareer = useCallback(async (identity: PlayerIdentity, clubId: string) => {
    const fresh = initializePlayer(identity, clubId);
    setPlayer(fresh);
    setLastNewAchievements([]);
    setLastTrophy(null);
    setLastIndividualAward(null);
    setPostSeason(null);
    await saveActiveCareer(fresh);
  }, []);

  const advanceSeason = useCallback(
    async (effect?: EventChoiceEffect, baseState?: PlayerState) => {
      const base = baseState ?? player;
      if (!base) return;
      const result = simulateSeason(base, effect);
      setPlayer(result.state);
      setLastNewAchievements(result.newAchievementIds);
      setLastTrophy(result.trophy);
      setLastIndividualAward(result.individualAward);
      setPostSeason(result.state.retired ? null : result.postSeason);
      await saveActiveCareer(result.state);
    },
    [player]
  );

  const chooseOffer = useCallback(
    async (clubId: string) => {
      if (!player) return null;
      const updated = applyTransfer(player, clubId);
      setPlayer(updated);
      setPostSeason(null);
      await saveActiveCareer(updated);
      return updated;
    },
    [player]
  );

  const stay = useCallback(async () => {
    if (!player) return null;
    setPostSeason(null);
    await saveActiveCareer(player);
    return player;
  }, [player]);

  const chooseLoan = useCallback(async () => {
    if (!player || !postSeason?.loanOffer) return null;
    const updated = acceptLoan(player, postSeason.loanOffer.id);
    setPlayer(updated);
    setPostSeason(null);
    await saveActiveCareer(updated);
    return updated;
  }, [player, postSeason]);

  const retire = useCallback(async () => {
    if (!player) return;
    const noOffersLeft = !postSeason || (postSeason.offers.length === 0 && postSeason.loanOffer === null);
    const reason: RetirementReason = postSeason?.forcedNote && noOffersLeft ? 'no-offers' : 'voluntary';
    const finalState: PlayerState = { ...player, retired: true, retirementReason: reason };
    setPlayer(finalState);
    setPostSeason(null);
    await archiveCareer(finalState);
  }, [player, postSeason]);

  const dismissTrophy = useCallback(() => setLastTrophy(null), []);
  const dismissAward = useCallback(() => setLastIndividualAward(null), []);

  const discardCareer = useCallback(async () => {
    setPlayer(null);
    setLastNewAchievements([]);
    setLastTrophy(null);
    setLastIndividualAward(null);
    setPostSeason(null);
    await clearActiveCareer();
  }, []);

  return (
    <CareerContext.Provider
      value={{
        player,
        loading,
        lastNewAchievements,
        lastTrophy,
        lastIndividualAward,
        postSeason,
        startCareer,
        advanceSeason,
        chooseOffer,
        stay,
        chooseLoan,
        retire,
        dismissTrophy,
        dismissAward,
        discardCareer,
      }}
    >
      {children}
    </CareerContext.Provider>
  );
}

export function useCareer(): CareerContextValue {
  const ctx = useContext(CareerContext);
  if (!ctx) throw new Error('useCareer must be used within a CareerProvider');
  return ctx;
}
