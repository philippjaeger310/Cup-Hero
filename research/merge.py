#!/usr/bin/env python3
"""
Merge the 20 per-country research JSON files into:
  - src/data/clubs.ts               (full real-club roster, TS source)
  - src/data/countryCompetitions.ts (real competition names + trophy images per country)

Deliberately a one-off generation script (not part of the app bundle).
"""
import json, glob, math, re, colorsys, hashlib

def svg_to_png_thumb(url):
    """
    React Native's plain <Image> cannot decode SVG at all (no built-in SVG
    support), and react-native-svg's remote-SVG loader (SvgUri) turned out
    to crash the app under Fabric/New Architecture (duplicate native
    component registration — "Could not find component config for native
    component"). Rather than depend on that, rewrite every Wikimedia .svg
    URL to its Special:FilePath?width=200 form, which redirects to a
    server-rendered PNG thumbnail — same source image, plain <Image> works.
    """
    if not url:
        return url
    path_only = url.split('?')[0]
    if not path_only.lower().endswith('.svg'):
        return url
    m = re.match(r'https://upload\.wikimedia\.org/wikipedia/([a-z_]+)/[0-9a-f]/[0-9a-f]{2}/(.+)$', url)
    if m:
        project, filename = m.group(1), m.group(2)
        host = 'commons.wikimedia.org' if project == 'commons' else f'{project}.wikipedia.org'
        return f'https://{host}/wiki/Special:FilePath/{filename}?width=200'
    m2 = re.match(r'https://commons\.wikimedia\.org/wiki/Special:FilePath/(.+?)(\?.*)?$', url)
    if m2:
        filename = m2.group(1)
        return f'https://commons.wikimedia.org/wiki/Special:FilePath/{filename}?width=200'
    return url  # unrecognized SVG source — left as-is, ClubBadge's onError fallback covers it

RESEARCH_DIR = "/root/work/cup-hero/research"
OUT_CLUBS = "/root/work/cup-hero/src/data/clubs.ts"
OUT_COMPETITIONS = "/root/work/cup-hero/src/data/countryCompetitions.ts"

TYPE_TO_SLOT = {
    "league": "league",
    "cup": "domestic-cup",
    "supercup": "super-cup",
    "continental": "continental-cup",
}

# Continental competition priority per confederation — which single
# "continental-cup" entry represents this country's marquee continental
# prize when a country lists several (e.g. Germany lists UCL/UEL/UECL).
CONTINENTAL_PRIORITY = [
    "UEFA Champions League",
    "Copa Libertadores",
    "CAF Champions League",
    "AFC Champions League Elite",
    "AFC Champions League",
    "Concacaf Champions Cup",
]

# When a country lists more than one "cup"-type entry (only England does,
# in this dataset: FA Cup + EFL Cup), prefer the more prestigious one for
# the single domestic-cup slot instead of silently keeping whichever
# happened to appear last in the research JSON.
DOMESTIC_CUP_PRIORITY = ["FA Cup"]

# The second-tier continental prize (added alongside continental-cup once a
# real trophy image for it was supplied) — same idea as CONTINENTAL_PRIORITY
# but for the "europa-league" slot. Only present for countries under UEFA.
EUROPA_NAME = "UEFA Europa League"

# Shared confederation fallback (reused verbatim — it's the same real
# trophy) for countries whose research pass didn't return a continental
# entry at all.
UEFA_FALLBACK = None  # filled in after loading DE.json


def slugify(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def color_for(club_id: str):
    """Deterministic fallback tint (used only for the tiny club-color dot in
    the summary table and as a last-resort badge fill if a real crest image
    fails to load at runtime) — NOT a claim of the club's real kit colors."""
    h = int(hashlib.sha1(club_id.encode()).hexdigest(), 16)
    hue = (h % 360) / 360.0
    r, g, b = colorsys.hsv_to_rgb(hue, 0.55, 0.85)
    primary = "#%02X%02X%02X" % (int(r * 255), int(g * 255), int(b * 255))
    r2, g2, b2 = colorsys.hsv_to_rgb(hue, 0.15, 0.20)
    secondary = "#%02X%02X%02X" % (int(r2 * 255), int(g2 * 255), int(b2 * 255))
    return primary, secondary


def pick_continental(comps):
    conts = [c for c in comps if c["type"] == "continental"]
    if not conts:
        return None
    for name in CONTINENTAL_PRIORITY:
        for c in conts:
            if c["name"] == name:
                return c
    return conts[0]


def pick_domestic_cup(comps):
    cups = [c for c in comps if c["type"] == "cup"]
    if not cups:
        return None
    for name in DOMESTIC_CUP_PRIORITY:
        for c in cups:
            if c["name"] == name:
                return c
    return cups[-1]  # preserve prior last-wins behavior for the common single-cup case


files = sorted(glob.glob(f"{RESEARCH_DIR}/??.json"))
countries = []
for f in files:
    countries.append(json.load(open(f)))

de = next(c for c in countries if c["code"] == "DE")
uefa_comps = {c["name"]: c for c in de["competitions"] if c["type"] == "continental"}

clubs_out = []  # list of dict for TS emission
competitions_out = {}  # code -> {slot: {name, trophyImageUrl}}

used_ids = set()

for country in countries:
    code = country["code"]
    all_clubs_flat = []
    for div in country["divisions"]:
        tier_num = div["tier"]
        league_name = div["leagueName"]
        for c in div["clubs"]:
            all_clubs_flat.append({**c, "_division": tier_num, "_league": league_name})

    # per-country percentile tiering (see research notes) — guarantees every
    # country has at least one tier-3 (starter-friendly) club.
    n = len(all_clubs_flat)
    ranked = sorted(all_clubs_flat, key=lambda c: -c["reputationEstimate"])
    t1n = max(1, math.ceil(n * 0.15))
    t3n = max(1, math.ceil(n * 0.25))
    if t1n + t3n > n:
        t3n = max(1, n - t1n - 1)
    tier_by_name = {}
    for i, c in enumerate(ranked):
        if i < t1n:
            tier_by_name[c["name"]] = 1
        elif i >= n - t3n:
            tier_by_name[c["name"]] = 3
        else:
            tier_by_name[c["name"]] = 2

    for c in all_clubs_flat:
        base_id = f"{code.lower()}-{slugify(c['name'])}"
        cid = base_id
        suffix = 2
        while cid in used_ids:
            cid = f"{base_id}-{suffix}"
            suffix += 1
        used_ids.add(cid)

        primary, secondary = color_for(cid)
        short = c["name"]
        # drop a trailing parenthetical nickname/disambiguator first — these
        # are what caused ugly mid-parenthesis truncations, e.g.
        # "Alianza Valledupar (Alianza FC)" -> "Alianza Valledupar"
        short = re.sub(r"\s*\([^)]*\)\s*$", "", short).strip()
        # trim common long-form prefixes/suffixes for shortName display
        short = re.sub(r"^(Club Atl[eé]tico|Club Atl[eé]tico de|CD|CF|SD|UD|RC|RCD|AC|US|AS|FC|SC|SK|KV|VfB|VfL|SV|1\.\s?FC)\s+", "", short)
        short = re.sub(r"\s+(FC|CF|SC|AC|SAD|CFC)$", "", short)
        if not short:
            short = c["name"]
        LIMIT = 24
        if len(short) > LIMIT:
            # truncate on a word boundary, never mid-word
            cut = short[:LIMIT]
            last_space = cut.rfind(" ")
            short = cut[:last_space] if last_space > 8 else cut
            short = short.rstrip()

        clubs_out.append({
            "id": cid,
            "name": c["name"],
            "shortName": short if short else c["name"],
            "country": code,
            "tier": tier_by_name[c["name"]],
            "colorPrimary": primary,
            "colorSecondary": secondary,
            "reputation": c["reputationEstimate"],
            "league": c["_league"],
            "division": c["_division"],
            "logoUrl": svg_to_png_thumb(c["logoUrl"]),
            "isReserveTeam": bool(c.get("isReserveTeam", False)),
        })

    slots = {}
    for comp in country["competitions"]:
        if comp["type"] in ("continental", "cup"):
            continue  # cup handled below via pick_domestic_cup (may be several); continental below too
        slot = TYPE_TO_SLOT.get(comp["type"])
        if not slot:
            continue
        slots[slot] = {"name": comp["name"], "trophyImageUrl": comp.get("trophyImageUrl")}

    domestic_cup = pick_domestic_cup(country["competitions"])
    if domestic_cup is not None:
        slots["domestic-cup"] = {"name": domestic_cup["name"], "trophyImageUrl": domestic_cup.get("trophyImageUrl")}

    cont = pick_continental(country["competitions"])
    if cont is None:
        # fall back to the (real, shared) UEFA Champions League entry —
        # same trophy, just wasn't listed for this particular country's pass.
        cont = uefa_comps.get("UEFA Champions League")
    if cont is not None:
        slots["continental-cup"] = {"name": cont["name"], "trophyImageUrl": cont.get("trophyImageUrl")}

    europa = next((c for c in country["competitions"] if c["type"] == "continental" and c["name"] == EUROPA_NAME), None)
    if europa is not None:
        slots["europa-league"] = {"name": europa["name"], "trophyImageUrl": europa.get("trophyImageUrl")}

    competitions_out[code] = slots

# ---- Emit src/data/clubs.ts ----

def ts_str(s):
    return json.dumps(s, ensure_ascii=False)

lines = []
lines.append("import { Club } from '../types';")
lines.append("")
lines.append("// Real club names, real leagues, real crest images — 2026/27 season.")
lines.append("//")
lines.append("// IMPORTANT — content-source note (read before editing):")
lines.append("// This file used to contain ONLY procedurally-generated club badges, to")
lines.append("// deliberately avoid reproducing real trademarked crests. That changed by")
lines.append("// explicit, informed user decision: real club names, real league names, and")
lines.append("// real crest IMAGES (via <ClubBadge>, sourced from TheSportsDB / Wikimedia")
lines.append("// Commons URLs in `logoUrl`) are now used throughout, accepting the")
lines.append("// trademark/copyright exposure that comes with reproducing real club")
lines.append("// marks. Same for src/data/countryCompetitions.ts (real trophy photos).")
lines.append("// If this app is ever distributed commercially, revisit that decision —")
lines.append("// using real crests/trophies at scale like this carries real legal risk")
lines.append("// regardless of how the images are sourced.")
lines.append("//")
lines.append("// Data provenance: researched by web search (TheSportsDB API + Wikimedia")
lines.append("// Commons) for the 2026/27 season. `reputation`/`tier` are the researcher's")
lines.append("// own qualitative estimates for game-balance purposes, not official")
lines.append("// ratings — division membership can also change season to season and this")
lines.append("// app does not track live standings. `colorPrimary`/`colorSecondary` are")
lines.append("// deterministic placeholder tints (NOT each club's real kit colors) used")
lines.append("// only as a tiny fallback if a real crest image fails to load.")
lines.append("//")
lines.append("// A handful of competitions have a real, verified NAME but no verified real")
lines.append("// trophy PHOTO (trophyImageUrl: null in countryCompetitions.ts) — the UI")
lines.append("// falls back to the original vector <TrophyCup /> art for those, never a")
lines.append("// fabricated photo. See that file's header for the current list.")
lines.append("export const CLUBS: Club[] = [")
for country in countries:
    code = country["code"]
    lines.append(f"  // {country['country']}")
    for c in clubs_out:
        if c["country"] != code:
            continue
        reserve = ", isReserveTeam: true" if c["isReserveTeam"] else ""
        lines.append(
            "  { id: %s, name: %s, shortName: %s, country: %s, tier: %d, "
            "colorPrimary: %s, colorSecondary: %s, reputation: %d, "
            "league: %s, division: %d, logoUrl: %s%s },"
            % (
                ts_str(c["id"]), ts_str(c["name"]), ts_str(c["shortName"]), ts_str(c["country"]),
                c["tier"], ts_str(c["colorPrimary"]), ts_str(c["colorSecondary"]), c["reputation"],
                ts_str(c["league"]), c["division"], ts_str(c["logoUrl"]), reserve,
            )
        )
lines.append("];")
lines.append("")
lines.append("export function getClub(id: string): Club {")
lines.append("  return CLUBS.find((c) => c.id === id) ?? CLUBS[0];")
lines.append("}")
lines.append("")
lines.append("export function clubsByTier(tier: 1 | 2 | 3): Club[] {")
lines.append("  return CLUBS.filter((c) => c.tier === tier);")
lines.append("}")
lines.append("")
lines.append("/** Default starter club for a fresh career: a tier-3 side in the player's own country if available. */")
lines.append("export function starterClubFor(countryCode: string): Club {")
lines.append("  const local = CLUBS.filter((c) => c.country === countryCode && c.tier === 3);")
lines.append("  if (local.length > 0) return local[0];")
lines.append("  const anyTier3 = clubsByTier(3);")
lines.append("  return anyTier3[0] ?? CLUBS[0];")
lines.append("}")
lines.append("")
lines.append("/**")
lines.append(" * Three starter-club options presented at career creation. Prioritises the")
lines.append(" * player's own country's tier-3 clubs, then fills remaining slots with")
lines.append(" * other tier-3 clubs from around the world.")
lines.append(" */")
lines.append("export function starterClubOptionsFor(countryCode: string): Club[] {")
lines.append("  const tier3 = clubsByTier(3);")
lines.append("  const local = tier3.filter((c) => c.country === countryCode);")
lines.append("  const rest = tier3.filter((c) => c.country !== countryCode);")
lines.append("  const ordered = [...local, ...rest];")
lines.append("  return ordered.slice(0, 3);")
lines.append("}")
lines.append("")

with open(OUT_CLUBS, "w") as f:
    f.write("\n".join(lines))

# ---- Emit src/data/countryCompetitions.ts ----

missing_images = []
for code, slots in competitions_out.items():
    for slot, entry in slots.items():
        if entry["trophyImageUrl"] is None:
            missing_images.append(f"{code} {slot}: {entry['name']}")

lines2 = []
lines2.append("import { CompetitionId } from '../types';")
lines2.append("")
lines2.append("export interface CountryCompetitionEntry {")
lines2.append("  name: string;")
lines2.append("  trophyImageUrl: string | null;")
lines2.append("}")
lines2.append("")
lines2.append("// Real competition names + real trophy photos per country, 2026/27 season.")
lines2.append("// See the header comment in clubs.ts for the content-source/IP note.")
lines2.append("//")
lines2.append("// Not every (country, CompetitionId) slot has a verified real trophy PHOTO —")
lines2.append("// where trophyImageUrl is null the name is still real/verified, but no real")
lines2.append("// image could be sourced from TheSportsDB or Wikimedia Commons. Currently:")
for m in missing_images:
    lines2.append(f"//   - {m}")
lines2.append("// The UI (see TrophyModal / LegendCareerScreen) falls back to the original")
lines2.append("// vector <TrophyCup /> art in those cases rather than fabricating a photo.")
lines2.append("export const COUNTRY_COMPETITIONS: Record<string, Partial<Record<CompetitionId, CountryCompetitionEntry>>> = {")
for country in countries:
    code = country["code"]
    slots = competitions_out[code]
    lines2.append(f"  {ts_str(code)}: {{")
    for slot in ["league", "domestic-cup", "super-cup", "continental-cup", "europa-league"]:
        if slot in slots:
            e = slots[slot]
            img = ts_str(e["trophyImageUrl"]) if e["trophyImageUrl"] else "null"
            lines2.append(f"    {ts_str(slot)}: {{ name: {ts_str(e['name'])}, trophyImageUrl: {img} }},")
    lines2.append("  },")
lines2.append("};")
lines2.append("")
lines2.append("/**")
lines2.append(" * Real competition name + trophy image for a club's country, or null if")
lines2.append(" * this (country, slot) combination wasn't researched — callers should fall")
lines2.append(" * back to the generic fictional name/art in that case.")
lines2.append(" */")
lines2.append("export function getRealCompetition(countryCode: string, slot: CompetitionId): CountryCompetitionEntry | null {")
lines2.append("  return COUNTRY_COMPETITIONS[countryCode]?.[slot] ?? null;")
lines2.append("}")
lines2.append("")

with open(OUT_COMPETITIONS, "w") as f:
    f.write("\n".join(lines2))

print("clubs:", len(clubs_out))
print("wrote", OUT_CLUBS)
print("wrote", OUT_COMPETITIONS)
print("missing trophy images:", len(missing_images))
for m in missing_images:
    print(" -", m)
