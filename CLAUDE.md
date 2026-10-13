# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A stage demo of the **Dose Guard** companion app for a school Shark Tank pitch. Dose Guard is a heat-alert case for EpiPens, insulin and inhalers; the source brief is `../Shark Tank.pdf`. There is no backend and no real hardware: every reading is simulated in memory. The page is projected from a laptop and driven with the mouse acting as a finger.

Standing constraints from the team: cream and navy palette, no purple gradients, and as little on-screen text as possible. Green, yellow and red are reserved for case status only.

## Commands

```bash
npm run dev       # dev server (the pitch is run from this)
npm run build     # production build to dist/
npm run preview   # serve the production build
npm run lint      # oxlint
```

There are no tests. `react/only-export-components` lint warnings in `state/sim.jsx` and `components/ui.jsx` are expected (they mix components with shared constants) and only affect fast refresh.

## Architecture

### Two layers: stage and phone

- `src/stage/` is what the projector shows around the app. `Stage.jsx` lays everything out at a fixed logical size (`STAGE_W` x `STAGE_H`) and applies one CSS `scale()` to fit the viewport. It also owns the presenter keys: `1` `2` `3` pick a scene, `R` resets, `F` toggles fullscreen.
- `stage/CaseDevice.jsx` is, despite its name, only the Home / Backpack / Hot car scene bar under the phone. The drawn case it used to render was removed.
- `stage/FingerCursor.jsx` hides the system cursor (`cursor: none` on the whole stage) and draws a touch dot with ripples.
- `src/App.jsx` is the phone shell: status bar, tab bar, the pushed case-detail view, sheets, the opening splash, the between-screens loader, the heat-alert banner and notification toasts. Navigation is plain `useState` in `PhoneApp`; there is no router.

Because the phone is CSS-scaled, screen pixels are not CSS pixels. `useDragScroll` in `components/ui.jsx` corrects for this by measuring the element; anything else that reads pointer deltas must do the same. Leaflet's own drag inside the scaled phone is not corrected.

### The simulation (`src/state/sim.jsx`)

One reducer plus context holds everything. A 100 ms `tick` action moves each case's temperature toward a goal:

- the **live** case (`live: true`, only the first one) follows the current scene's `target`;
- any case with `cooling: true` follows its `setpoint` instead, wherever it is.

Things that are easy to break:

- **Status is derived in one place.** `statusOf(temp, limit)` returns `safe` / `warm` / `hot`. Rings, chips, the chart, map pins and alerts all call it; do not compute status anywhere else.
- **Time is compressed.** Once over the limit, `overMin` gains one "minute" per tick until `ALERT_AFTER` (40), then the heat alert fires and sets `exposure` on the case. `exposure` deliberately survives cooling back down, because the product's point is that heat-damaged medicine looks normal.
- **`tick` returns the same state object when nothing changed**, so the app does not re-render ten times a second while idle. New per-tick behaviour must set `changed` (or produce a note) or it will be skipped.
- **Notifications** are pushed into `notes` from inside `tick` on status transitions, with a `ttl` counted in ticks. The heat alert is separate (`state.alert`) and suppresses toasts while it is up.
- **Reset** bumps `epoch`; `App.jsx` keys `PhoneApp` on it so the phone remounts on its first screen and replays the splash.

`useSim()` returns `cases` already enriched with `status`, `place`, `latlng`, `meds` and `contents`; screens should read those rather than raw `state.cases`.

`src/state/medicines.js` holds the medicine presets. A preset's `limit` is the alert threshold in °F, and adding a medicine lowers its case's limit to the strictest one it now holds.

### Screens and styling

- `src/screens/` has one file per screen. Sheets (`Pair`, `AddMedicine`) are rendered by `App.jsx`, not by the screen that opens them, so they cover the tab bar.
- All styles are in `src/styles/app.css`, with design tokens at the top. Stacking order uses the `--z-*` tokens. Later sections of the file override earlier ones (for example `.stage` layout), so check the bottom before editing a rule.
- Icons are a hand-written inline SVG set in `components/Icon.jsx`; add new ones there rather than pulling in an icon package.

### Motion

All animation uses Motion (`motion/react`), not CSS keyframes. Shared presets (`spring`, `tap`, and the `list` / `item` stagger variants) live in `components/ui.jsx`. `MotionConfig reducedMotion="user"` wraps the app.

### Network

Everything is offline except the Find screen, which uses Leaflet with live OpenStreetMap tiles. The Figtree font is bundled through `@fontsource-variable/figtree`. Case coordinates in `sim.jsx` are placeholders around Richmond, VA.

## Verifying changes in a browser

Chrome throttles timers and stops animation frames in background tabs. If an automated tab reports `document.visibilityState === 'hidden'`, stalled transitions and slow temperature changes are the harness, not the app.
