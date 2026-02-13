export const PACKAGE_ID =
  "0x815fd83d04fb33778cde254aae345302967c0eb600037e2164bf374f3fbd01db";

export const PUBLISHER_ID =
  "0x316d478636aec6a4029ad0cbf7cc22650769c154cf9b0ab61737db55fa4e1a15";

export const GRAPHQL_ENDPOINT = "https://graphql.testnet.sui.io/graphql";

export const CLOCK_ID = "0x6";

export const TARGETS = {
  register: `${PACKAGE_ID}::creator::register`,
  publishPost: `${PACKAGE_ID}::creator::publish_post`,
  subscribe: `${PACKAGE_ID}::subscription::subscribe`,
  assertAccess: `${PACKAGE_ID}::seal_mock::assert_access`,
} as const;

export const SUBSCRIPTION_DURATION_MS = 31536000000;
