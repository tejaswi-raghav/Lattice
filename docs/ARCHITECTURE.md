# Lattice — Architecture Notes

Lattice is a private, single-tenant social space for one group of people: a
self-hosted alternative to public social platforms, with no ads, no ranking
algorithm, and no company sitting in the middle of the room.

This document tracks the intended architecture and, honestly, **what's
actually implemented in this repo today versus what's still a design goal.**
The prototype in `src/App.jsx` is a frontend-only interface exploration — it
demonstrates the intended interactions, but most backend/cryptographic claims
below are not yet wired up. Treat the status column as the source of truth.

| Area | Approach | Status |
|---|---|---|
| Hosting model | Single-tenant, self-hosted (Docker Compose: Postgres + GoTrue + PostgREST + Storage + Caddy) | Compose file scaffolded (`docker-compose.yml`); schema/migrations not yet written |
| Auth | Google OAuth 2.0 / OpenID Connect via GoTrue, scopes limited to identity + email | Config scaffolded; not connected to the UI |
| Invitations | Single-use tokens, CSPRNG-generated, ~192 bits of entropy, only the SHA-256 hash stored server-side, 72h expiry | UI/flow fully mocked; no server-side token issuance yet |
| Feed | Strict reverse-chronological, no ranking, hard end-of-feed state | Implemented in the UI (including a "completed state" ritual instead of infinite scroll) |
| Chat | Group messaging, no typing indicators or read receipts by design | UI mocked with local state; no real transport |
| Volumetric posts | Photos rendered as tiltable/orbitable 3D scenes | UI simulates depth with layered CSS parallax. Real 3D Gaussian Splatting rendering is achievable today using [Spark](https://sparkjs.dev) (a Three.js-native 3DGS renderer); *generating* a splat from a single photo in one forward pass is a research-level ML problem, not an off-the-shelf library |
| Stories | 24h-style ephemeral posts with a locked background layer and top/bottom safe zones so UI never overlaps content | Implemented in the UI as a 7-second demo viewer |
| Consent circles | Scoped audiences (e.g. "Close Friends," "Family") for individual posts | UI-only; real enforcement needs row-level security policies on the backend |
| Message encryption | Post-quantum key exchange for DMs | Not implemented. **ML-KEM (NIST FIPS 203, finalized 2024)** is a real, standardized primitive with production libraries (liboqs, OpenSSL 3.5+) — a credible target for transport encryption |
| Server-blind computation | Spam filtering / search running on ciphertext the server can't read | Not implemented. **TFHE-rs** (Zama) is a real, maintained FHE library with a WASM API, but homomorphic computation is expensive; treat as an R&D track, not a v1 requirement |
| Local-first sync | App state stored client-side first, synced peer-to-peer when reconnecting | Not implemented. Realistic building blocks: SQLite compiled to WASM + Origin Private File System (OPFS) for storage, Automerge for CRDT-based merge-free sync |
| Anti-reflexive UX | Feed physically resists "just one more refresh" | Implemented in the UI via a hold-to-refresh haptic gesture (`navigator.vibrate`) and a "completed state" (breathing guide / doodle canvas) instead of more content |
| Ambient presence | No push notifications or badges; activity registers as a peripheral glow instead | Implemented in the UI (ambient edge-glow + a subtle "dangling string" indicator) |
| Leak attribution | Per-viewer invisible fingerprinting on shared media, so a leak is traceable to its source without exposing anyone to the group | Not implemented; a real version would need per-recipient asset variants (forensic watermarking), which has meaningful storage/complexity cost |
| Billing privacy | Managed-hosting payments routed through tokenized processors so card details aren't tied to a specific room | Not implemented; relevant only to the optional managed-hosting business model, not the self-hosted path |

## Suggested build order

1. **Ship the real backend first.** Postgres schema for users, rooms,
   memberships, posts, stories, messages, invitations. Wire Google OAuth via
   GoTrue. This alone delivers most of the product's value.
2. **Real invitations.** Server-issued, hashed, single-use, expiring tokens
   backing the UI flow that already exists.
3. **Real-time chat and feed.** Postgres logical replication / Supabase
   Realtime, or plain WebSockets if you're not using Supabase.
4. **Real volumetric rendering.** Swap the CSS-parallax stand-in for actual
   Spark-rendered splats, sourced from an existing splat-generation
   pipeline/API rather than building generative 3DGS from scratch.
5. **Transport encryption.** Integrate ML-KEM for message encryption via an
   audited library rather than a hand-rolled implementation.
6. **Everything else** (FHE search, local-first CRDT sync, leak
   fingerprinting) — worthwhile, but scope them as dedicated efforts once the
   core product is live and used by an actual group of people.

## Non-goals

- Ads, sponsored content, or any third-party analytics/telemetry.
- A public feed, discovery surface, or follower graph.
- Per-user pricing on the managed-hosting tier — pricing is by storage, not
  by headcount, so inviting a friend never costs money.
