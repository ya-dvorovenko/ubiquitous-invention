import { Creator, Post } from "@/types";

export const MOCK_CREATORS: Creator[] = [
  {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    name: "Alice Crypto",
    suinsName: "alice.sui",
    bio: "Web3 developer sharing insights about Sui blockchain development and smart contracts.",
    subscriberCount: 156,
    subscriptionPrice: 5,
  },
  {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    name: "Bob DeFi",
    suinsName: "bobdefi.sui",
    bio: "DeFi analyst covering the latest trends in decentralized finance and yield farming.",
    subscriberCount: 89,
    subscriptionPrice: 10,
  },
  {
    address: "0x9876543210fedcba9876543210fedcba98765432",
    name: "Carol NFT",
    suinsName: "carolnft.sui",
    bio: "Digital artist creating exclusive NFT content and tutorials for collectors.",
    subscriberCount: 234,
    subscriptionPrice: 3,
  },
  {
    address: "0xfedcba9876543210fedcba9876543210fedcba98",
    name: "Dave Builder",
    suinsName: "davebuilder.sui",
    bio: "Building in public. Sharing my journey as a full-stack Web3 developer.",
    subscriberCount: 67,
    subscriptionPrice: 7,
  },
  {
    address: "0x5678901234abcdef5678901234abcdef56789012",
    name: "Eve Research",
    suinsName: "everesearch.sui",
    bio: "Blockchain researcher providing deep dives into protocol mechanics and tokenomics.",
    subscriberCount: 312,
    subscriptionPrice: 15,
  },
  {
    address: "0x2345678901abcdef2345678901abcdef23456789",
    name: "Frank Gaming",
    suinsName: "frankgaming.sui",
    bio: "GameFi enthusiast covering play-to-earn games and virtual economies.",
    subscriberCount: 178,
    subscriptionPrice: 4,
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    creatorAddress: "0x1234567890abcdef1234567890abcdef12345678",
    title: "Getting Started with Sui Move",
    preview: "Learn the basics of Move programming language and how to build your first smart contract on Sui...",
    previewMedia: [
      { url: "https://picsum.photos/seed/sui1/800/450", type: "image" },
    ],
    content: "Full content here - only visible to subscribers. This is a comprehensive guide to building on Sui blockchain using Move language...",
    media: [
      { url: "https://picsum.photos/seed/sui1a/800/450", type: "image" },
      { url: "https://picsum.photos/seed/sui1b/800/450", type: "image" },
    ],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    creatorAddress: "0x1234567890abcdef1234567890abcdef12345678",
    title: "Understanding Object Model in Sui",
    preview: "Deep dive into Sui's unique object-centric model and how it differs from account-based blockchains...",
    previewMedia: [
      { url: "https://picsum.photos/seed/sui2/800/450", type: "image" },
    ],
    content: "Full content about Sui's object model...",
    media: [
      { url: "https://picsum.photos/seed/sui2a/800/450", type: "image" },
    ],
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    creatorAddress: "0x1234567890abcdef1234567890abcdef12345678",
    title: "Building a DeFi Protocol on Sui",
    preview: "Step-by-step guide to creating your own decentralized exchange using Sui's powerful primitives...",
    content: "Full DeFi tutorial content...",
    media: [
      { url: "https://picsum.photos/seed/sui3a/800/450", type: "image" },
      { url: "https://picsum.photos/seed/sui3b/800/450", type: "image" },
      { url: "https://picsum.photos/seed/sui3c/800/450", type: "image" },
    ],
    createdAt: "2024-01-05",
  },
  {
    id: "4",
    creatorAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    title: "Yield Farming Strategies 2024",
    preview: "Discover the most profitable yield farming opportunities in the current market...",
    previewMedia: [
      { url: "https://picsum.photos/seed/defi1/800/450", type: "image" },
    ],
    content: "Detailed yield farming analysis...",
    createdAt: "2024-01-12",
  },
  {
    id: "5",
    creatorAddress: "0x9876543210fedcba9876543210fedcba98765432",
    title: "Creating Your First NFT Collection",
    preview: "A complete guide to designing, minting, and marketing your NFT collection...",
    previewMedia: [
      { url: "https://picsum.photos/seed/nft1/800/450", type: "image" },
      { url: "https://picsum.photos/seed/nft2/800/450", type: "image" },
    ],
    content: "NFT creation tutorial...",
    media: [
      { url: "https://picsum.photos/seed/nft3/800/450", type: "image" },
      { url: "https://picsum.photos/seed/nft4/800/450", type: "image" },
    ],
    createdAt: "2024-01-08",
  },
];

export function getCreatorByAddress(address: string): Creator | undefined {
  return MOCK_CREATORS.find((c) => c.address === address);
}

export function getPostsByCreator(creatorAddress: string): Post[] {
  return MOCK_POSTS.filter((p) => p.creatorAddress === creatorAddress);
}

export function getPostById(id: string): Post | undefined {
  return MOCK_POSTS.find((p) => p.id === id);
}
