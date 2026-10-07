# Big Boss Command Center — Plan

## Product direction

A makeathon-ready command center for Big Boss to run an eight-person house game. The demo is intentionally interactive in the browser: the working state lives in React state so every control updates the dashboard instantly, while the managed server/database configuration remains ready for durable sync in a next iteration.

## Design system

- **Design movement:** broadcast-control-room noir: ink-black surfaces, thin technical rules, vivid signal colors, and a calm information-dense hierarchy inspired by live television operations consoles.
- **Core principles:** 1) every panel has a job, 2) status is visible before detail, 3) controls are close to the data they change, 4) danger is unmistakable but never noisy.
- **Color philosophy:** deep graphite gives the room an authoritative, late-night broadcast mood; saffron is the brand signal for Big Boss actions and captaincy; mint is reserved for healthy/live/completed states; coral is reserved for risk, nominations, and eviction.
- **Layout paradigm:** a fixed command rail on the left with an asymmetric two-column operations field. The main stage is a live leaderboard and house pulse, with smaller operational trays for tasks, announcements, timer, and eviction rather than a generic centered card grid.
- **Signature elements:** the “LIVE FEED” red status light, amber bracket icon/wordmark, and thin numbered rank rails that feel like a televised control surface.
- **Interaction philosophy:** actions should feel decisive and reversible in the demo. Mutations use inline controls, toast feedback, and immediate recalculation of ranks/statistics. Protected states (immunity/captain) show their reason beside the control.
- **Animation:** subtle 180–260ms transitions for panel hover, rank movement, and toast entry; a restrained pulse on live status and timer; no gratuitous looping motion.
- **Typography system:** Space Grotesk for headlines and interface labels; IBM Plex Mono for scores, timers, rank numbers, and metadata. Uppercase micro-labels with tracking communicate broadcast instrumentation.
- **Brand essence:** The operator’s seat for the house game — fast, visible, and made for live decisions. Personality: **commanding, transparent, electric**.
- **Brand voice:** short, broadcast-style, and specific. Example lines: “The house is moving. Keep the board honest.” and “Captaincy is a live role — change it before the next task.”
- **Wordmark & logo:** a custom CSS mark built from an amber square, black “BB” ligature, and a small red live dot; paired with the wordmark “BIG BOSS / CONTROL”.
- **Signature brand color:** signal saffron `#F5B83D`.

## Implementation

- Replace the starter home page with a single responsive React command center.
- Keep the app public and demo-friendly; no auth gate or login flow in the UI.
- Model exactly eight contestants in initial state, each with `team`, `points`, `status`, `productivity`, and task counts.
- Use derived selectors for active leaderboard, nominee list, captain, immunity holder, highest scorer, completed tasks, and vote totals.
- Support task assignment/completion, point adjustments, captain transfer/removal, nominations with immunity protection, immunity assignment, timer start/pause/reset, announcements, and eviction votes.
- Include a compact activity feed that acts as the automated in-app notification system for all meaningful state changes.
- Keep the layout usable on narrow screens by letting the main content stack while preserving the sticky command rail header.
- Expose `/manus-routes.json` with the root route.

## Project structure

- `client/src/pages/Home.tsx` — command center UI, demo state, derived live metrics, and interaction handlers.
- `client/src/index.css` — custom noir control-room tokens, layout primitives, and responsive styling.
- `client/src/App.tsx` — existing single-route shell, retained with the new page.
- `public/manus-routes.json` — route manifest for the published website.
- `app.config.ts` — project logo metadata.
- `TODO.md` — outcome criteria tracked for delivery.
