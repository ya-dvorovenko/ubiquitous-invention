export const PACKAGE_ID =
  "0x97be1ccb7358100beccbbfa4a9787c1dd6e5140529c21dbdf54b843c8d0d5e76";

export const GRAPHQL_ENDPOINT = "https://graphql.testnet.sui.io/graphql";

export const CLOCK_ID = "0x6";

export const TARGETS = {
  register: `${PACKAGE_ID}::creator::register`,
  publishPost: `${PACKAGE_ID}::creator::publish_post`,
  subscribe: `${PACKAGE_ID}::subscription::subscribe`,
  assertAccess: `${PACKAGE_ID}::seal_mock::assert_access`,
  sealApprove: `${PACKAGE_ID}::seal_mock::seal_approve`,
} as const;

export const TYPES = {
  creatorCap: `${PACKAGE_ID}::creator::CreatorCap`,
  creatorProfile: `${PACKAGE_ID}::creator::CreatorProfile`,
  subscription: `${PACKAGE_ID}::subscription::Subscription`,
} as const;

export const SUBSCRIPTION_DURATION_MS = 31536000000;
