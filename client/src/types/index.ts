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
  blobId?: string;
}

export interface Post {
  id: string;
  profileId: string;
  creatorAddress: string;
  title: string;
  preview: string;
  previewMedia?: PostMedia[];
  content?: string;
  media?: PostMedia[];
  createdAt: string;
  blobId?: string;
  encrypted?: boolean;
}

export interface Subscription {
  id: string;
  profileId: string;
  subscriberAddress: string;
  expiresAt: string;
  createdAt?: string;
}
