/**
 * Walrus configuration for encrypted blob storage.
 * Used when publishing/reading encrypted content (Seal + Walrus flow).
 *
 * @see https://docs.wal.app/usage/web-api.html
 * @see examples/frontend/vite.config.ts for proxy setup in dev
 */

export const WALRUS_PUBLISHERS = [
  { id: "publisher1", url: "https://publisher.walrus-testnet.walrus.space" },
  { id: "publisher2", url: "https://wal-publisher-testnet.staketab.org" },
  { id: "publisher3", url: "https://walrus-testnet-publisher.redundex.com" },
  { id: "publisher4", url: "https://walrus-testnet-publisher.nodes.guru" },
  { id: "publisher5", url: "https://publisher.walrus.banansen.dev" },
  { id: "publisher6", url: "https://walrus-testnet-publisher.everstake.one" },
] as const;

export const WALRUS_AGGREGATORS = [
  { id: "aggregator1", url: "https://aggregator.walrus-testnet.walrus.space" },
  { id: "aggregator2", url: "https://wal-aggregator-testnet.staketab.org" },
  { id: "aggregator3", url: "https://walrus-testnet-aggregator.redundex.com" },
  { id: "aggregator4", url: "https://walrus-testnet-aggregator.nodes.guru" },
  { id: "aggregator5", url: "https://aggregator.walrus.banansen.dev" },
  { id: "aggregator6", url: "https://walrus-testnet-aggregator.everstake.one" },
] as const;

/** Default epochs to store blobs (1 epoch on testnet) */
export const WALRUS_DEFAULT_EPOCHS = 1;
