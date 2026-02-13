export interface Creator {
  address: string;
  name: string;
  suinsName?: string;
  bio: string;
  subscriberCount: number;
  subscriptionPrice: number;
}

export interface PostMedia {
  url: string;
  type: "image" | "video";
  blobId?: string; // Walrus blob ID
}

export interface Post {
  id: string;
  creatorAddress: string;
  title: string;
  preview: string;
  previewMedia?: PostMedia[]; // Public preview media
  content?: string; // Only available for subscribers
  media?: PostMedia[]; // Exclusive media for subscribers
  createdAt: string;
  blobId?: string; // Walrus blob ID for encrypted content
}

export interface Subscription {
  subscriberAddress: string;
  creatorAddress: string;
  expiresAt: string;
}
