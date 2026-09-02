# Cup Hero

Football career simulator mobile app. Code scaffold built with Expo /
React Native + TypeScript. Two minigames, modeled on the mechanics of
copero.com.ar/juegos but with independently written content and code:

- **Become a Legend** — a season-by-season football career simulator.
  Set up your player (difficulty, name, number, foot, nationality,
  position), pick your starting club from 3 options, then progress
  through seasons. Depending on difficulty you face a decision event
  every 1/2/3 seasons (accept/reject choices with gameplay
  consequences), and after *every* season you get a stay-or-move choice
  with real transfer offers. Tracks OVR, appearances, goals, assists,
  market value, trophies (with a win overlay), national team caps/goals,
  and unlocks achievements along the way. Ends in a summary screen with
  full club-by-club and season-by-season stats plus a dedicated national
  team section.
- **Football Ideology Test** — a short multiple-choice quiz that scores
  you on four axes (possession vs. directness, pressing intensity,
  individualism) and returns a footballing-philosophy profile.

The whole app is available in German and in English — switch with the
DE/EN toggle on the Games hub; the choice is remembered on-device.

## Status

Runnable scaffold, not a finished product. Pinned to Expo SDK 54 (not
the newest SDK 57) specifically so it installs through the normal Expo
Go app from the App Store / Play Store — no UDID registration, no
7-day-expiring signed builds, no cable. Verified so far:

- `npx tsc --noEmit` passes with zero errors.
- The career engine was stress-tested headlessly across multiple
  simulated 20+ season careers, including the new player-driven transfer
  flow (`scripts/simulate-test.ts`) — no crashes, stat bounds hold up
  (OVR clamped 40–99, ages/seasons track correctly).
- App icon, adaptive icon layers, splash icon and favicon are original
  procedurally-generated artwork (`assets/*.png`, see "Content note").

Not yet re-run since the latest change: `npx expo-doctor` and an actual
Metro bundle build/on-device Expo Go check — do these on your machine
before shipping. Still not done: the pitch-diagram position picker
(currently a chip list) and further visual polish.

## Brand / CI

- Name: **Cup Hero**
- Primary color: Pantone 1895 C (`#F7B5CD`), Inter Miami-inspired pink
- Base: black (`#0A0A0A`) / dark charcoal surfaces
- Accent: white for typography and clean lines

All of this lives in `src/theme/colors.ts` — change it there and it
propagates everywhere.

## Content note (read before shipping)

Club names in `src/data/clubs.ts` are now **real** club names (River
Plate, Real Madrid, Manchester United, Borussia Dortmund, Inter Miami,
etc.) at the user's request. Real club **crests are not reproduced
anywhere** — every badge on screen is drawn by `<ClubBadge>`
(`src/components/ClubBadge.tsx`), an original shield built only from each
club's own shirt colors and initials. This keeps real trademarked
artwork out of the codebase, but the club *names* themselves are still a
legal grey area for anything beyond personal/hobby use (unlicensed
football games commonly ship with fictionalized names for exactly this
reason — that's why the original scaffold did). If this is heading
toward the App Store / Play Store, get real legal sign-off on the name
usage before shipping, or swap `CLUBS` back to fictional entries — the
rest of the app (badges, engine, i18n) doesn't care either way.

`tier` on each club is a simplified in-game reputation bracket (1 =
elite/famous, 2 = solid/known, 3 = smaller/lesser-known), not a claim
about which real division a club currently plays in — that changes every
season and this app doesn't track live standings.

Trophies are for **fictional in-game competitions** (`src/data/competitions.ts`:
League Title / Domestic Cup / Super Cup / Continental Cup) with an
original cup graphic (`src/components/TrophyCup.tsx`) — no real
tournament names or trophies involved. Achievement names/descriptions in
`src/data/achievements.ts` and events in `src/data/events.ts` were
written independently, inspired by the *concept* of copero.com.ar's
career-milestone system but not copied from it. The app icon, splash
screen and start-screen illustration are original procedurally-generated
artwork (see `scripts/` note below and `src/components/FootballScene.tsx`) —
no real stadium, kit, or player likeness.

## Tech stack

- Expo (SDK 54) + React Native 0.81, TypeScript
- React Navigation (native-stack)
- AsyncStorage for local persistence (no backend, no accounts — per
  spec, everything lives on-device)
- No ads / IAP wired in (MVP scope was explicitly "no monetization")

## Project structure

```
App.tsx                     — entry point, providers
src/
  theme/                    — colors, typography, spacing
  types/                    — all shared TypeScript types (incl. LocalizedText)
  i18n/
    translations.ts         — DE/EN UI string dictionary
    LanguageContext.tsx     — language state (persisted), t()/pick() hooks
  data/                     — countries, clubs, competitions, career events,
                               achievements, ideology questions
                               (event/achievement/question text is
                               LocalizedText — { en, de })
  engine/
    careerEngine.ts         — pure functions: init player, simulate a
                               season, generate transfer offers, apply a
                               transfer, pick weighted events
    CareerContext.tsx       — React context wrapping the engine +
                               AsyncStorage persistence
  storage/                  — AsyncStorage read/write helpers
  navigation/                — RootNavigator, route param types
  screens/
    StartScreen.tsx         — launch screen (football scene + branding)
    GamesHubScreen.tsx       — also hosts the DE/EN language switch
    legend/                 — setup (incl. club choice), career loop,
                               summary, achievements
    ideology/               — intro, quiz, result
  components/                — Screen, Button, Card, ClubBadge, TrophyCup,
                               TrophyModal, SeasonHistoryTable, FootballScene
assets/                      — generated icon.png, android adaptive-icon
                               layers, splash-icon.png, favicon.png
scripts/
  simulate-test.ts           — headless engine sanity test, including the
                               transfer flow (`npx tsx scripts/simulate-test.ts`)
  generate-icons.py          — regenerates assets/*.png
                               (`python3 scripts/generate-icons.py`)
```

## Running it

```bash
npm install
npx expo start
```

Then scan the QR code with Expo Go (iOS/Android), or press `a` / `i` for
an emulator/simulator if you have one set up locally. This sandbox
environment can't run a real Android/iOS emulator or the native Hermes
bytecode compiler, so full on-device verification still needs to happen
on your machine.

## Suggested next steps

1. Run `npx expo-doctor`, then run it in Expo Go on a real device and
   sanity-check the full "Become a Legend" loop end to end — including
   the club-choice step and the post-season stay-or-move offers, in both
   languages.
2. Get legal sign-off on the real club names before any store
   submission (see "Content note" above), or swap `CLUBS` back to
   fictional entries.
3. Expand `events.ts` / `achievements.ts` beyond the starter set (14
   events, 14 achievements) — remember new entries need both `en` and
   `de` text plus an `EVENT_NOTES`/note key where relevant.
4. Build the pitch-diagram position picker if the chip-list UX isn't
   good enough.
5. When ready for stores: EAS Build config, privacy policy (required
   even with zero backend/tracking).
