# SuiPatron Move Package

Patreon-style subscription platform on Sui. Creators publish posts; subscribers pay for access; encrypted content is stored on Walrus and decrypted via Seal.

## Module Integration

```
creator.move          subscription.move         seal_mock.move
     │                       │                        │
     │  CreatorProfile       │  Subscription           │  seal_approve
     │  Post (blob_id)       │  profile_id, expires_at │  (id, sub, profile, clock)
     │  publish_post()       │  subscribe()            │
     └──────────┬────────────┴────────────────────────┘
                │
                ▼
         CreatorProfile (shared)
         ├── PostKey(n) → Post { blob_id, encrypted }
         └── subscriber → true (df)
                │
                ▼
         Subscription (owned by subscriber)
                │
                ▼
         seal_approve checks: sub.profile_id, sub.expires_at, id prefix
```

### How the modules connect

| Module | Depends on | Purpose |
|--------|------------|---------|
| **creator** | — | CreatorProfile, Post, publish_post. Stores `blob_id` (Walrus blob ID) for each post. |
| **subscription** | creator | subscribe() creates Subscription, adds subscriber to profile df. |
| **seal_mock** | creator, subscription | seal_approve() — policy gate for Seal decryption. Checks subscription validity. |

### Data flow

1. **Creator publishes**: Encrypt content with Seal → upload to Walrus → call `creator::publish_post(profile, title, preview, blob_id, encrypted, clock)`.
2. **Subscriber views**: If subscribed → download blob from Walrus → Seal decrypt using `seal_mock::seal_approve(id, sub, profile, clock)`.

The Move contract does **not** talk to Walrus directly. It only stores `blob_id` (string) in Post. Walrus is used by the frontend/client.

## Walrus

Walrus is decentralized blob storage. Encrypted content lives there; the contract stores the blob ID.

- **Publish**: Frontend encrypts with Seal → `PUT /v1/blobs` to a Walrus publisher → gets `blobId` → calls `publish_post(..., blobId, ...)`.
- **Read**: Frontend fetches `GET /v1/blobs/{blobId}` from a Walrus aggregator → decrypts with Seal.

See [Walrus docs](https://docs.wal.app/usage/web-api.html) and `examples/frontend/vite.config.ts` for publisher/aggregator URLs and proxy setup.

## Seal

Seal enforces who can decrypt. Our policy is in `seal_mock::seal_approve`:

- **Key format**: `id = [profile.id.to_bytes()][nonce]`
- **Policy**: Subscription must be for this profile and not expired; `id` must have the profile prefix.

### Reference

- [docs/SEAL_FRONTEND.md](../docs/SEAL_FRONTEND.md) — Frontend integration guide
- [STRUCTS.md](./STRUCTS.md) — Struct definitions

## Build & Test

```bash
sui move build
sui move test
```
