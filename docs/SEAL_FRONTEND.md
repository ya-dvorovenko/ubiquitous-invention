# Seal Integration Guide for Frontend Developers

This guide explains how to integrate Seal (encrypted content access control) into the SuiPatron frontend. Seal enables creators to encrypt content on Walrus so only subscribers can decrypt it.

## Overview

- **Creator flow**: Encrypt content → upload to Walrus → call `publish_post()` with blob ID
- **Subscriber flow**: If subscribed → download from Walrus → Seal decrypt using `seal_approve`

Our contract uses `seal_mock::seal_approve` (not `subscription::seal_approve` like the Seal examples). The policy checks: subscription is for this creator profile, not expired, and the blob key has the correct prefix.

---

## Dependencies

```bash
pnpm add @mysten/seal @mysten/sui @mysten/dapp-kit
```

Required packages:
- `@mysten/seal` – SealClient, SessionKey, encrypt/decrypt
- `@mysten/sui` – Transaction, fromHex, toHex, SUI_CLOCK_OBJECT_ID
- `@mysten/dapp-kit` – useSuiClient, useSignPersonalMessage, useCurrentAccount

---

## 1. SealClient Setup

```typescript
import { SealClient } from '@mysten/seal';
import { useSuiClient } from '@mysten/dapp-kit';

// Seal key server object IDs (Testnet - from Seal docs)
const SEAL_SERVER_OBJECT_IDS = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
];

const suiClient = useSuiClient();
const sealClient = new SealClient({
  suiClient,
  serverConfigs: SEAL_SERVER_OBJECT_IDS.map((objectId) => ({
    objectId,
    weight: 1,
  })),
  verifyKeyServers: false, // set true in production
});
```

---

## 2. Creator: Encrypt and Publish

When a creator publishes an encrypted post:

1. **Policy object** = CreatorProfile object ID (hex string)
2. **Key format** = `[profileId bytes][5-byte nonce]`
3. Encrypt with Seal → upload to Walrus → call `creator::publish_post`

```typescript
import { SealClient } from '@mysten/seal';
import { fromHex, toHex } from '@mysten/sui/utils';

async function encryptAndUpload(
  file: ArrayBuffer,
  profileId: string,  // CreatorProfile object ID (hex, e.g. "0x1234...")
  packageId: string,
  sealClient: SealClient,
  walrusPublisherUrl: string,
) {
  const nonce = crypto.getRandomValues(new Uint8Array(5));
  const policyObjectBytes = fromHex(profileId);  // CreatorProfile ID
  const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));

  const { encryptedObject: encryptedBytes } = await sealClient.encrypt({
    threshold: 2,
    packageId,
    id,
    data: new Uint8Array(file),
  });

  const response = await fetch(`${walrusPublisherUrl}/v1/blobs?epochs=1`, {
    method: 'PUT',
    body: encryptedBytes,
  });
  const { blobId } = await response.json();

  return blobId;
}
```

Then call the Move contract:

```typescript
tx.moveCall({
  target: `${packageId}::creator::publish_post`,
  arguments: [
    tx.object(profileId),
    tx.pure.string(title),
    tx.pure.string(preview),
    tx.pure.string(blobId),
    tx.pure.bool(true),   // encrypted
    tx.object(SUI_CLOCK_OBJECT_ID),
  ],
});
```

---

## 3. Subscriber: Decrypt Content

When a subscriber views encrypted content:

1. Find their valid Subscription for this CreatorProfile
2. Build a `MoveCallConstructor` that calls `seal_mock::seal_approve`
3. Use `SealClient.decrypt()` with `SessionKey` and the transaction bytes

### 3.1 Construct Move Call for seal_approve

**Important**: Our module is `seal_mock`, not `subscription`. Arguments: `(id, sub, profile, clock)`.

```typescript
import { Transaction } from '@mysten/sui/transactions';
import { fromHex, SUI_CLOCK_OBJECT_ID } from '@mysten/sui/utils';

type MoveCallConstructor = (tx: Transaction, id: string) => void;

function constructSealApproveMoveCall(
  packageId: string,
  profileId: string,      // CreatorProfile object ID (shared)
  subscriptionId: string, // User's Subscription object ID (owned)
): MoveCallConstructor {
  return (tx: Transaction, id: string) => {
    tx.moveCall({
      target: `${packageId}::seal_mock::seal_approve`,
      arguments: [
        tx.pure.vector('u8', fromHex(id)),
        tx.object(subscriptionId),
        tx.object(profileId),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    });
  };
}
```

### 3.2 Session Key Flow

Seal requires a signed personal message for session auth. The flow:

```typescript
import { SessionKey } from '@mysten/seal';
import { useSignPersonalMessage } from '@mysten/dapp-kit';

const TTL_MIN = 10;
const suiClient = useSuiClient();
const { mutate: signPersonalMessage } = useSignPersonalMessage();
const currentAccount = useCurrentAccount();

// Create or reuse session key
let sessionKey = currentSessionKey;  // cache if not expired
if (!sessionKey?.isExpired() && sessionKey?.getAddress() === currentAccount.address) {
  // Reuse
} else {
  sessionKey = await SessionKey.create({
    address: currentAccount.address,
    packageId,
    ttlMin: TTL_MIN,
    suiClient,
  });
  await new Promise((resolve, reject) => {
    signPersonalMessage(
      { message: sessionKey.getPersonalMessage() },
      {
        onSuccess: async (result) => {
          await sessionKey.setPersonalMessageSignature(result.signature);
          resolve(null);
        },
        onError: reject,
      },
    );
  });
}
```

### 3.3 Download and Decrypt

```typescript
import { SealClient, SessionKey, NoAccessError, EncryptedObject } from '@mysten/seal';

async function downloadAndDecrypt(
  blobIds: string[],
  sessionKey: SessionKey,
  suiClient: SuiClient,
  sealClient: SealClient,
  moveCallConstructor: MoveCallConstructor,
  aggregatorBaseUrl: string,
): Promise<Uint8Array[]> {
  const downloads = await Promise.all(
    blobIds.map((blobId) =>
      fetch(`${aggregatorBaseUrl}/v1/blobs/${blobId}`).then((r) => r.arrayBuffer() as Promise<ArrayBuffer>)
    )
  );

  const validDownloads = downloads.filter((d): d is ArrayBuffer => d !== null && d.byteLength > 0);
  if (validDownloads.length === 0) throw new Error('Could not retrieve blobs from Walrus');

  const decrypted: Uint8Array[] = [];

  for (const encryptedData of validDownloads) {
    const fullId = EncryptedObject.parse(new Uint8Array(encryptedData)).id;
    const tx = new Transaction();
    moveCallConstructor(tx, fullId);
    const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });

    try {
      const decryptedFile = await sealClient.decrypt({
        data: new Uint8Array(encryptedData),
        sessionKey,
        txBytes,
      });
      decrypted.push(decryptedFile);
    } catch (err) {
      if (err instanceof NoAccessError) {
        throw new Error('No access to decryption keys. Check your subscription.');
      }
      throw err;
    }
  }

  return decrypted;
}
```

### 3.4 Finding Valid Subscriptions

For a given CreatorProfile and user address:

```typescript
const packageId = '0x...';  // Your deployed suipatron package
const profileId = '0x...';  // CreatorProfile object ID
const userAddress = '0x...';

const { data } = await suiClient.getOwnedObjects({
  owner: userAddress,
  filter: { StructType: `${packageId}::subscription::Subscription` },
  options: { showContent: true },
});

const clock = await suiClient.getObject({ id: SUI_CLOCK_OBJECT_ID, options: { showContent: true } });
const now = (clock.data?.content as any)?.fields?.timestamp_ms;

const validSubscription = data?.find((obj) => {
  const fields = (obj.data?.content as any)?.fields;
  const subProfileId = fields?.profile_id?.id ?? fields?.profile_id;
  return subProfileId === profileId && parseInt(fields?.expires_at) >= now;
});

const subscriptionId = validSubscription?.data?.objectId;
```

---

## 4. Data Model Summary

| Concept | Our Model (SuiPatron) | Seal Examples |
|---------|----------------------|---------------|
| Service / Creator | CreatorProfile (shared) | Service (shared) |
| Access token | Subscription (profile_id, expires_at) | Subscription (service_id, created_at, ttl) |
| seal_approve module | `seal_mock` | `subscription` |
| seal_approve args | (id, sub, profile, clock) | (id, sub, service, clock) |
| Key prefix | `profile.id.to_bytes()` | `service.id.to_bytes()` |

---

## 5. Reference: Example Files

The `examples/frontend` folder contains a working Seal + Subscription example. Key differences for our app:

- Use `seal_mock::seal_approve` instead of `subscription::seal_approve`
- Pass `profileId` (CreatorProfile) instead of `serviceId` (Service)
- Subscription filter: `profile_id` and `expires_at` instead of `service_id` and `created_at` + `ttl`
- Use `creator::publish_post` for publishing instead of `subscription::publish`

---

## 6. Walrus Configuration

Walrus publisher and aggregator URLs are in `client/src/config/walrus.ts`. For Vite dev, add proxies (see `examples/frontend/vite.config.ts`). See [Walrus docs](https://docs.wal.app/usage/web-api.html#public-services) for public services.

For local dev, you may need proxies in Vite:

```ts
// vite.config.ts
server: {
  proxy: {
    '/publisher1': 'https://...',
    '/aggregator1': 'https://...',
  },
}
```

---

## 7. Checklist

- [ ] Add `@mysten/seal` dependency
- [ ] Create SealClient with key server configs
- [ ] Creator: use CreatorProfile ID as policy when encrypting
- [ ] Creator: call `creator::publish_post` with blob_id from Walrus
- [ ] Subscriber: find valid Subscription via `profile_id` and `expires_at`
- [ ] Subscriber: use `constructSealApproveMoveCall` with `seal_mock::seal_approve`
- [ ] Subscriber: SessionKey + signPersonalMessage before decrypt
- [ ] Handle `NoAccessError` when decrypt fails (no access / expired subscription)
