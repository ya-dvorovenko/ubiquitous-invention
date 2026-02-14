export const PACKAGE_ID =
  "0x3bc482c3a8422bf32fcfeab54db1ee1fb7796f05b1cf7d39c3d7fe0261bcc201";

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

export const sealObjectIds = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8",
  "0x6068c0acb197dddbacd4746a9de7f025b2ed5a5b6c1b1ab44dade4426d141da2",
  "0x5466b7df5c15b508678d51496ada8afab0d6f70a01c10613123382b1b8131007",
  "0x164ac3d2b3b8694b8181c13f671950004765c23f270321a45fdd04d40cccf0f2",
  "0x9c949e53c36ab7a9c484ed9e8b43267a77d4b8d70e79aa6b39042e3d4c434105",
  "0x39cef09b24b667bc6ed54f7159d82352fe2d5dd97ca9a5beaa1d21aa774f25a2",
  "0x4cded1abeb52a22b6becb42a91d3686a4c901cf52eee16234214d0b5b2da4c46",
  "0x3c93ec1474454e1b47cf485a4e5361a5878d722b9492daf10ef626a76adc3dad",
  "0x6a0726a1ea3d62ba2f2ae51104f2c3633c003fb75621d06fde47f04dc930ba06",
];
