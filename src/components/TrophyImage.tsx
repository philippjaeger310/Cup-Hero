import React from 'react';
import { Image } from 'react-native';
import { Trophy } from '../types';
import { getClub } from '../data/clubs';
import { getRealCompetition } from '../data/countryCompetitions';
import { TrophyCup } from './TrophyCup';

interface TrophyImageProps {
  trophy: Trophy;
  color: string;
  size?: number;
}

/**
 * Locally bundled, curated flat-icon trophy graphics (user-supplied,
 * matching the clean LaLiga-style look) for a handful of specific
 * competitions. `require()` needs static, literal paths for Metro to
 * bundle the asset, so this is an explicit list rather than a generated
 * lookup — see localTrophyAsset() below for the (country, competitionId)
 * -> asset mapping logic.
 */
const KNVB_BEKER = require('../../assets/trophies/nl-cup-knvb-beker.png');
const BUNDESLIGA_2 = require('../../assets/trophies/de-league2-2bundesliga-medal.png');
const PREMIER_LEAGUE = require('../../assets/trophies/en-league-premier-league.png');
const FA_CUP = require('../../assets/trophies/en-cup-fa-cup.png');
const CHAMPIONS_LEAGUE = require('../../assets/trophies/continental-champions-league.png');
const BUNDESLIGA_1 = require('../../assets/trophies/de-league-bundesliga-medal.png');
const DFB_POKAL = require('../../assets/trophies/de-cup-dfb-pokal.png');
const CLUB_WORLD_CUP = require('../../assets/trophies/club-world-cup.png');
const WORLD_CUP = require('../../assets/trophies/world-cup.png');
const EREDIVISIE = require('../../assets/trophies/nl-league-eredivisie.png');
const HR_CUP = require('../../assets/trophies/hr-cup-hns.png');
const SERIE_A = require('../../assets/trophies/it-league-serie-a.png');
const COPPA_ITALIA = require('../../assets/trophies/it-cup-coppa-italia.png');
const LIGUE_1 = require('../../assets/trophies/fr-league-ligue1.png');
const TACA_DE_PORTUGAL = require('../../assets/trophies/pt-cup-taca-de-portugal.png');
const EUROPA_LEAGUE = require('../../assets/trophies/europa-league.png');
const COPA_DEL_REY = require('../../assets/trophies/es-cup-copa-del-rey.png');

/**
 * A real bundled asset for this specific trophy, or null to fall back to
 * the vector <TrophyCup />. Only competitions the user supplied a clean,
 * consistently-styled image for are covered — everything else stays vector.
 * See the module doc comment above for why photographic real trophy images
 * were abandoned entirely as the default.
 */
function localTrophyAsset(trophy: Trophy) {
  const club = getClub(trophy.clubId);

  if (trophy.competitionId === 'world-cup') return WORLD_CUP;
  if (trophy.competitionId === 'club-world-cup') return CLUB_WORLD_CUP;

  if (trophy.competitionId === 'continental-cup') {
    const real = getRealCompetition(club.country, 'continental-cup');
    return real?.name === 'UEFA Champions League' ? CHAMPIONS_LEAGUE : null;
  }

  if (trophy.competitionId === 'europa-league') return EUROPA_LEAGUE;

  if (trophy.competitionId === 'league') {
    if (club.country === 'DE') return club.division === 2 ? BUNDESLIGA_2 : BUNDESLIGA_1;
    if (club.country === 'EN') return PREMIER_LEAGUE;
    if (club.country === 'NL') return EREDIVISIE;
    if (club.country === 'IT') return SERIE_A;
    if (club.country === 'FR') return LIGUE_1;
    return null;
  }

  if (trophy.competitionId === 'domestic-cup') {
    if (club.country === 'DE') return DFB_POKAL;
    if (club.country === 'NL') return KNVB_BEKER;
    if (club.country === 'EN') return FA_CUP;
    if (club.country === 'HR') return HR_CUP;
    if (club.country === 'IT') return COPPA_ITALIA;
    if (club.country === 'PT') return TACA_DE_PORTUGAL;
    if (club.country === 'ES') return COPA_DEL_REY;
    return null;
  }

  return null;
}

/**
 * Trophy graphic for a won Trophy. Defaults to the original, consistent
 * vector <TrophyCup /> — real per-competition trophy PHOTOS (sourced in
 * countryCompetitions.ts) turned out visually inconsistent at small sizes:
 * some are photographic with reflections/backgrounds (UEFA Champions
 * League), some are a completely different shape (Bundesliga's
 * Meisterschale is a plate, not a cup), several are dead/rate-limited
 * links, and a few competitions have no real photo at all. A single flat
 * icon style (matching how clean sources like the LaLiga trophy graphic
 * look) reads correctly at every size and never breaks.
 *
 * The exception: a curated set of user-supplied images that already share
 * that same clean flat-icon style (see localTrophyAsset above) are used
 * directly for the specific competitions they depict. Everything else
 * still falls back to <TrophyCup />. The real competition NAME always
 * comes from countryCompetitions.ts regardless of which graphic is shown.
 */
export function TrophyImage({ trophy, color, size = 96 }: TrophyImageProps) {
  const asset = localTrophyAsset(trophy);
  if (asset) {
    return <Image source={asset} style={{ width: size, height: size }} resizeMode="contain" />;
  }
  return <TrophyCup color={color} size={size} />;
}

/** Real competition name for a trophy if known, else the caller's fictional-name fallback. */
export function realCompetitionName(trophy: Trophy): string | null {
  const club = getClub(trophy.clubId);
  return getRealCompetition(club.country, trophy.competitionId)?.name ?? null;
}
