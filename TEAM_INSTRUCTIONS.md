# Walrus + Seal Integration — Instructions for Team

This document describes the Walrus + Seal integration added to SuiPatron and what teammates (Move devs, frontend) need to know.

---

## What Was Done

### 1. Move Contract (`move/sources/`)

**`seal_mock.move`** — Seal policy for encrypted content:

- **`seal_approve(id, sub, profile, clock)`** — Entry point used by Seal key servers when a subscriber requests decryption. Checks:
  - Subscription is for this CreatorProfile
  - Subscription is not expired
  - Blob key `id` has prefix `[profile.id.to_bytes()]`
- **`assert_access(sub, target_profile_id, clock)`** — Legacy mock check (kept for tests).

**Integration with existing modules:**

- `creator.move` — Stores `blob_id` (Walrus blob ID) in Post. No changes to structs.
- `subscription.move` — Unchanged. Subscription has `profile_id`, `expires_at`.
- Flow: Creator encrypts → uploads to Walrus → `publish_post(..., blob_id, ...)`. Subscriber downloads from Walrus → Seal decrypts using `seal_approve`.

### 2. Walrus Config (`client/src/config/walrus.ts`)

- Publisher and aggregator URLs for Walrus testnet.
- Used when publishing encrypted blobs and when fetching them for decryption.

### 3. Client Constants (`client/src/config/constants.ts`)

- Added `sealApprove: ${PACKAGE_ID}::seal_mock::seal_approve` to `TARGETS`.

### 4. Documentation

- **`move/README.md`** — Module integration, data flow, Walrus/Seal roles.
- **`docs/SEAL_FRONTEND.md`** — Frontend integration guide (SealClient, encrypt, decrypt, `seal_approve` Move call).
- **`move/STRUCTS.md`** — Updated with `seal_mock` integration notes.

---

## For Move Developers

- `seal_mock` depends on `creator` and `subscription`. No circular deps.
- Key format for Seal: `id = [profile.id.to_bytes()][5-byte nonce]`.
- Run tests: `cd move && sui move test` (14 tests, all pass).
- The contract does **not** call Walrus; it only stores `blob_id` strings.

---

## For Frontend Developers

### Publish flow (creator)

1. Encrypt content with Seal (use CreatorProfile object ID as policy).
2. Upload encrypted bytes to Walrus (`PUT /v1/blobs`).
3. Call `creator::publish_post(profile, title, preview, blobId, true, clock)`.

### View flow (subscriber)

1. Check if user has valid Subscription for this CreatorProfile (`profile_id`, `expires_at`).
2. Download blob from Walrus (`GET /v1/blobs/{blobId}`).
3. Build a transaction that calls `seal_mock::seal_approve(id, sub, profile, clock)`.
4. Use Seal SDK `decrypt()` with that transaction and a SessionKey.

### Config and targets

- Walrus URLs: `client/src/config/walrus.ts`
- Seal approve target: `TARGETS.sealApprove` in `constants.ts`
- Seal key servers (testnet): see `docs/SEAL_FRONTEND.md`

### Full guide

See **`docs/SEAL_FRONTEND.md`** for code examples, SessionKey flow, and error handling.

---

## Quick Reference

| Item | Location |
|------|----------|
| Seal policy | `move/sources/seal_mock.move` |
| Walrus config | `client/src/config/walrus.ts` |
| seal_approve target | `client/src/config/constants.ts` → `TARGETS.sealApprove` |
| Frontend guide | `docs/SEAL_FRONTEND.md` |
| Move integration | `move/README.md` |
