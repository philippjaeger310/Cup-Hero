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
const EURO_CHAMPIONSHIP = require('../../assets/trophies/euro-championship.png');
const PRIMEIRA_LIGA = require('../../assets/trophies/pt-league-primeira-liga.png');
const BRASILEIRAO = require('../../assets/trophies/br-league-brasileirao.png');
const EFL_CHAMPIONSHIP = require('../../assets/trophies/en-league2-championship.png');
const COPA_SUDAMERICANA = require('../../assets/trophies/conmebol-copa-sudamericana.png');
const LIGUE_2 = require('../../assets/trophies/fr-league2-ligue2.png');
const LIGAPRO_SERIE_A = require('../../assets/trophies/ec-league-ligapro.png');
const SWISS_CUP = require('../../assets/trophies/ch-cup-swiss-cup.png');

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
  if (trophy.competitionId === 'euro-championship') return EURO_CHAMPIONSHIP;

  if (trophy.competitionId === 'continental-cup') {
    const real = getRealCompetition(club.country, 'continental-cup');
    return real?.name === 'UEFA Champions League' ? CHAMPIONS_LEAGUE : null;
  }

  if (trophy.competitionId === 'europa-league') {
    // 'europa-league' now covers two distinct real competitions depending
    // on confederation — UEFA's Europa League for European countries, and
    // CONMEBOL's Copa Sudamericana for AR/BR/CO/UY (see merge.py's
    // SECOND_TIER_CONTINENTAL_NAMES) — so this needs the same real-name
    // branch continental-cup already uses, not a flat return.
    const real = getRealCompetition(club.country, 'europa-league');
    if (real?.name === 'CONMEBOL Copa Sudamericana') return COPA_SUDAMERICANA;
    if (real?.name === 'UEFA Europa League') return EUROPA_LEAGUE;
    return null;
  }

  if (trophy.competitionId === 'league') {
    if (club.country === 'DE') return club.division === 2 ? BUNDESLIGA_2 : BUNDESLIGA_1;
    // EN and FR also have researched division-2 clubs — see clubs.ts — so
    // these need the same division branch DE already has, not a flat
    // return. Previously every EN club rendered the Premier League trophy
    // regardless of division; fixed here.
    if (club.country === 'EN') return club.division === 2 ? EFL_CHAMPIONSHIP : PREMIER_LEAGUE;
    if (club.country === 'NL') return EREDIVISIE;
    if (club.country === 'IT') return SERIE_A;
    if (club.country === 'FR') return club.division === 2 ? LIGUE_2 : LIGUE_1;
    if (club.country === 'PT') return PRIMEIRA_LIGA;
    if (club.country === 'BR') return BRASILEIRAO;
    if (club.country === 'EC') return LIGAPRO_SERIE_A;
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
    if (club.country === 'CH') return SWISS_CUP;
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
