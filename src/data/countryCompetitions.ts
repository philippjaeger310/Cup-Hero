import { CompetitionId } from '../types';

export interface CountryCompetitionEntry {
  name: string;
  trophyImageUrl: string | null;
}

// Real competition names + real trophy photos per country, 2026/27 season.
// See the header comment in clubs.ts for the content-source/IP note.
//
// Not every (country, CompetitionId) slot has a verified real trophy PHOTO —
// where trophyImageUrl is null the name is still real/verified, but no real
// image could be sourced from TheSportsDB or Wikimedia Commons. Currently:
//   - HR domestic-cup: Hrvatski nogometni kup (Croatian Football Cup)
//   - MA domestic-cup: Throne Cup (Coupe du Trône)
//   - RS domestic-cup: Serbian Cup (Kup Srbije)
//   - SN league: Ligue 1 Sénégal
//   - SN domestic-cup: Coupe du Sénégal
// The UI (see TrophyModal / LegendCareerScreen) falls back to the original
// vector <TrophyCup /> art in those cases rather than fabricating a photo.
export const COUNTRY_COMPETITIONS: Record<string, Partial<Record<CompetitionId, CountryCompetitionEntry>>> = {
  "AR": {
    "league": { name: "Liga Profesional de Fútbol Argentina", trophyImageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Logo_de_la_Liga_Profesional_de_F%C3%BAtbol_de_Argentina.svg" },
    "domestic-cup": { name: "Copa Argentina", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Copa_Argentina.jpg/960px-Copa_Argentina.jpg" },
    "super-cup": { name: "Supercopa Argentina", trophyImageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Logotipo_de_la_Supercopa_Argentina_de_F%C3%BAtbol.svg" },
    "continental-cup": { name: "CONMEBOL Copa Libertadores", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/328-3287452_copa-libertadores-primer-trofeo-hd-png-download.png" },
  },
  "BE": {
    "league": { name: "Belgian Pro League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/26/Belgian_Pro_League_logo_%282020%2C_boxed%29.svg" },
    "domestic-cup": { name: "Belgian Cup (Croky Cup)", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/en/4/42/Belgian_Cup%2C_Croky_Cup%2C_sponsored_logo_since_2022-23.png" },
    "continental-cup": { name: "UEFA Champions League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/39/Champions_League_Trophy_%2852736201132%29.jpg" },
  },
  "BR": {
    "league": { name: "Campeonato Brasileiro Série A", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Campeonato_Brasileiro_S%C3%A9rie_A_logo_%282024%29.svg/960px-Campeonato_Brasileiro_S%C3%A9rie_A_logo_%282024%29.svg.png" },
    "domestic-cup": { name: "Copa do Brasil", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Copa_do_Brasil_logo_%282018%29.svg/960px-Copa_do_Brasil_logo_%282018%29.svg.png" },
    "super-cup": { name: "Supercopa do Brasil", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Supercopa_Rei_logo_%282023%29.svg/960px-Supercopa_Rei_logo_%282023%29.svg.png" },
    "continental-cup": { name: "CONMEBOL Copa Libertadores", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/328-3287452_copa-libertadores-primer-trofeo-hd-png-download.png" },
  },
  "CO": {
    "league": { name: "Categoría Primera A", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/6axlxc1696412612.png" },
    "domestic-cup": { name: "Copa Colombia (Copa BetPlay Dimayor)", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/w2brvd1702705447.png" },
    "super-cup": { name: "Superliga Colombiana (Superliga BetPlay Dimayor)", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/dev0ek1776271167.png" },
    "continental-cup": { name: "CONMEBOL Copa Libertadores", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Trof%C3%A9u_da_Copa_Libertadores_da_Am%C3%A9rica_de_2023.jpg" },
  },
  "DE": {
    "league": { name: "Bundesliga", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Meisterschale-10.svg" },
    "domestic-cup": { name: "DFB-Pokal", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/40/DFB-Pokal_trophy.jpg" },
    "super-cup": { name: "DFL-Supercup", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Replik_des_DFL_Supercup%2C_FC_Bayern_Erlebniswelt.jpg" },
    "continental-cup": { name: "UEFA Champions League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/39/Champions_League_Trophy_%2852736201132%29.jpg" },
    "europa-league": { name: "UEFA Europa League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/42/Europa_league_trophy.jpg" },
  },
  "EN": {
    "league": { name: "Premier League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Premier_League_Trophy_at_Manchester%27s_National_Football_Museum_%28Ank_Kumar%29_01.jpg" },
    "domestic-cup": { name: "FA Cup", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/The_FA_Cup_Trophy.jpg" },
    "super-cup": { name: "FA Community Shield", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f0/FA_Community_Shield10.svg" },
    "continental-cup": { name: "UEFA Champions League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Trofeo_UEFA_Champions_League.jpg" },
    "europa-league": { name: "UEFA Europa League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/69/PD-Shape_Europa_League_Trophy.svg" },
  },
  "ES": {
    "league": { name: "LaLiga", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Liga_trophy_%28adjusted%29.png" },
    "domestic-cup": { name: "Copa del Rey", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Copa_del_Rey_Trophy.png" },
    "super-cup": { name: "Supercopa de España", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8b/Supercopa_de_Espa%C3%B1a_%28rfef%29.svg" },
    "continental-cup": { name: "UEFA Champions League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Trofeo_UEFA_Champions_League.jpg" },
    "europa-league": { name: "UEFA Europa League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/42/Europa_league_trophy.jpg" },
  },
  "FR": {
    "league": { name: "Ligue 1", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/ygfgeq1684416349.png" },
    "domestic-cup": { name: "Coupe de France", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/ge50231779493990.png" },
    "super-cup": { name: "Trophée des Champions", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Troph%C3%A9e_des_Champions.svg" },
    "continental-cup": { name: "UEFA Champions League", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/31y13d1747884950.png" },
    "europa-league": { name: "UEFA Europa League", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/czo8tz1747884321.png" },
  },
  "HR": {
    "league": { name: "SuperSport HNL", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/zhp18a1715259853.png" },
    "domestic-cup": { name: "Hrvatski nogometni kup (Croatian Football Cup)", trophyImageUrl: null },
    "continental-cup": { name: "UEFA Champions League", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/31y13d1747884950.png" },
    "europa-league": { name: "UEFA Europa League", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/gvunpb1678811689.png" },
  },
  "IT": {
    "league": { name: "Serie A", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Coppa_Campioni_d%27Italia_%28Serie_A%29.png" },
    "domestic-cup": { name: "Coppa Italia", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/06/Coppa_Italia_%28Italy_Cup%29.svg" },
    "super-cup": { name: "Supercoppa Italiana", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Supercoppa_Italiana.svg" },
    "continental-cup": { name: "UEFA Champions League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/39/Champions_League_Trophy_%2852736201132%29.jpg" },
    "europa-league": { name: "UEFA Europa League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/42/Europa_league_trophy.jpg" },
  },
  "JP": {
    "league": { name: "J1 League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ea/J_league_logo_2026.svg" },
    "domestic-cup": { name: "Emperor's Cup", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/en/5/59/Emperor%27s_Cup_logo_since_2018.svg" },
    "continental-cup": { name: "AFC Champions League Elite", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/en/d/d7/AFC_Champions_League_Elite_logo.svg" },
  },
  "MA": {
    "league": { name: "Botola Pro", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/en/c/ce/BotolaPro-logo.png" },
    "domestic-cup": { name: "Throne Cup (Coupe du Trône)", trophyImageUrl: null },
    "continental-cup": { name: "CAF Champions League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/en/d/d5/CAF_Champions_League.png" },
  },
  "MX": {
    "league": { name: "Liga MX", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/22/Liga_MX_logo.svg" },
    "super-cup": { name: "Campeón de Campeones", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/en/3/37/Campeon_de_campeones_logo.jpg" },
    "continental-cup": { name: "Concacaf Champions Cup", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/CONCACAF_Champions_Cup_logo.svg" },
  },
  "NL": {
    "league": { name: "Eredivisie", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/81/VriendenLoterij_Eredivisie_Logo.png" },
    "domestic-cup": { name: "KNVB Cup (KNVB Beker)", trophyImageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/KNVB_Beker.svg" },
    "super-cup": { name: "Johan Cruyff Shield", trophyImageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Johan_Cruijff_Schaal.svg" },
    "continental-cup": { name: "UEFA Champions League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/UEFA_Champions_League.svg/960px-UEFA_Champions_League.svg.png" },
    "europa-league": { name: "UEFA Europa League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/UEFA_Europa_League_logo_%282024_version%29.svg/960px-UEFA_Europa_League_logo_%282024_version%29.svg.png" },
  },
  "NO": {
    "league": { name: "Eliteserien", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/uz9kw61778714637.png" },
    "domestic-cup": { name: "NM Cupen (Norwegian Football Cup)", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/5df4xs1751133808.png" },
    "continental-cup": { name: "UEFA Champions League", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/31y13d1747884950.png" },
    "europa-league": { name: "UEFA Europa League", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/gvunpb1678811689.png" },
  },
  "PT": {
    "league": { name: "Primeira Liga (Liga Portugal Betclic)", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Liga_Portugal_Betclic_logo.svg/960px-Liga_Portugal_Betclic_logo.svg.png" },
    "domestic-cup": { name: "Taça de Portugal", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Ta%C3%A7a_de_Portugal_Trophy.svg/960px-Ta%C3%A7a_de_Portugal_Trophy.svg.png" },
    "super-cup": { name: "Supertaça Cândido de Oliveira", trophyImageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Superta%C3%A7a_C%C3%A2ndido_de_Oliveira.svg" },
    "continental-cup": { name: "UEFA Champions League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/UEFA_Champions_League.svg/960px-UEFA_Champions_League.svg.png" },
    "europa-league": { name: "UEFA Europa League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/UEFA_Europa_League_logo_%282024_version%29.svg/960px-UEFA_Europa_League_logo_%282024_version%29.svg.png" },
  },
  "RS": {
    "league": { name: "Serbian SuperLiga", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/qbwz1e1786336891.png" },
    "domestic-cup": { name: "Serbian Cup (Kup Srbije)", trophyImageUrl: null },
    "continental-cup": { name: "UEFA Champions League", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/31y13d1747884950.png" },
    "europa-league": { name: "UEFA Europa League", trophyImageUrl: "https://r2.thesportsdb.com/images/media/league/trophy/gvunpb1678811689.png" },
  },
  "SN": {
    "league": { name: "Ligue 1 Sénégal", trophyImageUrl: null },
    "domestic-cup": { name: "Coupe du Sénégal", trophyImageUrl: null },
    "continental-cup": { name: "CAF Champions League", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6b/CAF_Champions_League_Trophy.svg" },
  },
  "US": {
    "league": { name: "Major League Soccer (MLS Cup)", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/en/8/89/MLS_Cup_logo.svg" },
    "domestic-cup": { name: "U.S. Open Cup", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/en/b/b5/U.S._Open_Cup_logo.svg" },
    "continental-cup": { name: "Concacaf Champions Cup", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/CONCACAF_Champions_Cup_logo.svg" },
  },
  "UY": {
    "league": { name: "Liga AUF Uruguaya", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Liga_AUF_Uruguaya_-_logo_azul.png/960px-Liga_AUF_Uruguaya_-_logo_azul.png" },
    "domestic-cup": { name: "Copa AUF Uruguay", trophyImageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/COPA_AUFURUGUAY.png" },
    "super-cup": { name: "Supercopa Uruguaya", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/45/Logo_Supercopa_Uruguaya.png" },
    "continental-cup": { name: "CONMEBOL Copa Libertadores", trophyImageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/328-3287452_copa-libertadores-primer-trofeo-hd-png-download.png" },
  },
};

/**
 * Real competition name + trophy image for a club's country, or null if
 * this (country, slot) combination wasn't researched — callers should fall
 * back to the generic fictional name/art in that case.
 */
export function getRealCompetition(countryCode: string, slot: CompetitionId): CountryCompetitionEntry | null {
  return COUNTRY_COMPETITIONS[countryCode]?.[slot] ?? null;
}
