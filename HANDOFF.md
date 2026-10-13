# Handoff — Dose Guard pitch demo

_Generated 2026-10-08 by Claude Code._
_Open a fresh Claude Code session in this directory and ask it to **read HANDOFF.md and continue** before doing anything else._

## Goal
Build a polished, clickable demo of the Dose Guard app (heat-alert case for EpiPens, insulin, inhalers) that the team projects from a laptop during a school Shark Tank pitch, driving it with the mouse as a finger. The user's latest ask is to "be an executive" and make it the best product possible using every feature in the brief (`../Shark Tank.pdf`).

## Current state
- Not a git repository. Nothing is committed; every file is new this session.
- Dev server: started this session on http://localhost:5183 (`npm run dev -- --port 5183 --strictPort`). It may no longer be running in a new session; restart it.
- `npm run build` passes. `npm run lint` shows only expected `only-export-components` warnings plus one `react(refs)` warning at `src/screens/Find.jsx:16`.
- Working and seen in Chrome: Home, case detail, heat alert, limit stepper, reset, pairing, add medicine, dose ticking, cooling countdown, Leaflet map with real tiles, centred phone with scene bar underneath, logo in header.
- Written but **never seen on screen**: the opening splash, the drop-down notification toasts, and the larger phone size after `STAGE_W` was changed from 1500 to 720.

## Active files
- [src/state/sim.jsx](src/state/sim.jsx) — the whole simulation: reducer, 100 ms tick, alerts, notifications, cooling. Most feature work starts here.
- [src/App.jsx](src/App.jsx) — phone shell: navigation state, splash, loader, heat-alert banner, toasts.
- [src/screens/CaseDetail.jsx](src/screens/CaseDetail.jsx) — where per-case features go (limit, cooling, tiles).
- [src/stage/Stage.jsx](src/stage/Stage.jsx) — stage size and scaling, presenter keys.
- [src/styles/app.css](src/styles/app.css) — all styles; later blocks at the bottom override earlier ones.
- [src/screens/Find.jsx](src/screens/Find.jsx) — Leaflet map; has the open lint warning.

## Recent changes (this session)
All **uncommitted** (no repo).
- Scaffolded Vite + React + Motion; built stage, finger cursor, five screens, simulation.
- Added a 600 ms loading spinner on every screen change.
- Added cooling: per-case `cooling` and `setpoint`, "Cool to" card with a switch and a live sensor line.
- Replaced the drawn SVG map with Leaflet + OpenStreetMap tiles; cases now carry `latlng`.
- Removed the drawn case graphic at the user's request; phone is centred with Home / Backpack / Hot car beneath it.
- Added a logo (`Logo` in `components/ui.jsx`), a 1.9 s opening splash, and toasts for Warming up, Back in range, Cooling done, Dose due soon.
- Wrote `CLAUDE.md`.

## Tried & failed
- **Verifying animations through browser automation:** the Chrome tab kept going to `visibilityState: hidden`, which gave 0 animation frames and throttled timers. Screenshots showed half-finished transitions and scripts timed out waiting. Not an app bug. Ask the user to keep the tab in the foreground, or check logic through DOM state rather than timing.
- **`resize_window` to 1440x900:** the viewport stayed 855x986. Projector-size layout has never been checked.
- **Clicking the heat alert too early:** a click while the banner was still dropping missed the button. On stage, wait for it to settle.
- **Pressing a scene key right after `navigate`:** the key landed before the app was listening, so the Backpack toast was never observed.
- **Misreading "safe-like thing":** it meant the drawn case (it looked like a safe), not the "Safe" status label.

## Next steps
1. Start the dev server and visually confirm the splash, each toast, and the phone size at the real projector resolution. Fix anything off.
2. Ask the user which of these to build, then build them (offered, not yet answered): left-behind alert, low battery and charging status, EpiPen expiry reminder, share with caregiver or school nurse, case colour and size picker.
3. Fix the status-bar clock being hard to read over the map (a soft fade behind it was offered).
4. Replace placeholder data once the user answers: case names ("Maya's case", "Dad's case") and map coordinates (currently Richmond, VA).
5. Clear the `react(refs)` lint warning in `Find.jsx` (assign `select.current` inside an effect).

## Gotchas
- A GateGuard hook rejects the first Write or Edit to each file and any `rm`. State the facts it asks for (callers, data, the user's verbatim instruction), then retry the same call.
- The user's global `~/.claude/CLAUDE.md` requires Motion for all animation and the `ui-ux-pro-max` skill for UI work.
- The user types fast with heavy typos. Restate your reading of a request in one line before acting on it.
- The Find map needs internet; everything else works offline. Tell the user if a change adds another network dependency.
- `stage/CaseDevice.jsx` is now only the scene bar. `Icon.jsx` still has unused icons from the removed case link.
- The session cost was high; prefer small targeted edits over rewriting whole files.

## Links
- Project spec: [CLAUDE.md](CLAUDE.md)
- Product brief: `../Shark Tank.pdf` (the "App" and "Research" tabs list the wanted features)
- Original plan: `~/.claude/plans/look-throguht-this-ddiea-async-feigenbaum.md` (partly superseded: the case graphic and offline map are gone)
