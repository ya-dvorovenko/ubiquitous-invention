export interface Creator {
  address: string;
  name: string;
  suinsName?: string;
  bio: string;
  subscriberCount: number;
  subscriptionPrice: number;
  profileId?: string;
  twitter?: string;
}

export interface PostMedia {
  url: string;
  type: "image" | "video";
}

export interface Post {
  id: string;
  profileId: string;
  creatorAddress: string;
  title: string;
  preview: string;
  blobId: string;
  encrypted: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  profileId: string;
  subscriberAddress: string;
  expiresAt: string;
  createdAt?: string;
  creatorName?: string;
  creatorAddress?: string;
}
