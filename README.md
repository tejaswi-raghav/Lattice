# Lattice

**A private, volumetric social sanctuary — for one group of people, hosted
by you.**

Lattice is an invite-only alternative to public social media: no ads, no
ranking algorithm, no infinite scroll, and no company sitting in the middle
of your friend group's memories. Photos can render as tiltable, orbitable
3D scenes. The feed ends when you're caught up, on purpose.

This repo currently contains the **frontend prototype** (a fully interactive
React app covering the landing page, onboarding, and the in-app experience)
plus a **self-hosted backend scaffold** (Docker Compose + Postgres + GoTrue +
PostgREST + Storage + Caddy). See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
for an honest breakdown of what's implemented versus what's still a design
goal — some of the more ambitious ideas (post-quantum encryption, homomorphic
search, generative 3D reconstruction) are represented at the UI/interaction
level today, not wired to real cryptography or ML.

## Features (in the current UI)

- **Landing → onboarding → deploy flow**: sign in, name your room, pick a
  visual "vibe" (seven internet-era presets), optionally set a 360° canvas,
  and land in a live preview of your space.
- **Volumetric posts**: photos rendered with layered depth and a full orbit
  viewer (cursor/touch-driven parallax today; a real implementation would use
  [Spark](https://sparkjs.dev), a Three.js-native 3D Gaussian Splatting
  renderer).
- **Channels**: Feed, a Pinterest-style pinned media Board, and an Event
  Ledger — coordination kept separate from chat noise.
- **Consent circles**: scope individual posts to subsets of the group
  (e.g. "Close Friends," "Family").
- **Calm-tech details**: no push notifications or badges — new activity
  shows up as a soft ambient glow at the screen's edge instead. The end of
  the feed offers a breathing exercise, a doodle canvas, or a
  hold-to-refresh gesture with real haptic resistance, instead of more
  content.
- **Token-based invitations**: single-use, expiring links with a live
  "preview join" flow showing the verification steps.
- **Depth-aware stories**: a locked background layer and top/bottom safe
  zones so UI chrome never overlaps story content.

## Tech stack

- **Frontend**: React 18, Vite, [lucide-react](https://lucide.dev) icons.
  Styling is plain CSS with custom properties (no framework) — see the
  `<style>` block in `src/App.jsx`.
- **Backend (scaffolded, not yet wired to the UI)**: self-hosted Supabase
  stack — Postgres, GoTrue (auth), PostgREST (API), Storage — behind Caddy
  for automatic HTTPS. See `docker-compose.yml`.

## Getting started (frontend)

```bash
npm install
npm run dev
```

This runs the interactive prototype at `http://localhost:5173` — the full
landing page, onboarding flow, and in-app experience with mocked/local data.
No backend is required to explore the UI.

## Getting started (self-hosted backend)

```bash
cp .env.example .env
# edit .env with real secrets and your domain/Google OAuth credentials
docker compose up -d
```

This brings up Postgres, auth, the REST API, object storage, and a TLS-
terminating reverse proxy. **The UI is not yet wired to this backend** — see
`docs/ARCHITECTURE.md` for the suggested build order to close that gap
(schema, real invitations, realtime chat, etc.).

## Project structure

```
.
├── src/
│   ├── main.jsx        # React entry point
│   └── App.jsx          # The entire interactive prototype (single component)
├── docs/
│   └── ARCHITECTURE.md  # Design intent + honest implementation status
├── docker-compose.yml   # Self-hosted backend stack
├── Caddyfile             # Reverse proxy / TLS config
└── .env.example          # Required environment variables (no real secrets)
```

## Philosophy

- **No per-user pricing, ever.** Inviting a friend should never cost money.
  Two intended pricing models: pay once and self-host forever, or a flat
  monthly managed instance priced by storage, not headcount.
- **Privacy as architecture, not policy.** Where possible, guarantees should
  come from how the system is built (self-hosted, single-tenant, minimal
  data retention) rather than from a promise in a terms-of-service document.
- **Calm by design.** No engagement-optimized ranking, no infinite scroll,
  no badges. The product should be easy to put down.

## License

MIT — see [`LICENSE`](LICENSE). Do what you like with it; attribution
appreciated but not required.
