const WALRUS_PUBLISHER_URL = "https://publisher.walrus-testnet.walrus.space";
const WALRUS_AGGREGATOR_URL = "https://aggregator.walrus-testnet.walrus.space";

export interface WalrusUploadResponse {
  newlyCreated?: {
    blobObject: {
      id: string;
      blobId: string;
    };
  };
  alreadyCertified?: {
    blobId: string;
  };
}

export async function uploadFileHttp(file: File): Promise<string> {
  const response = await fetch(`${WALRUS_PUBLISHER_URL}/v1/blobs?epochs=3`, {
    method: "PUT",
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Walrus upload failed: ${response.statusText}`);
  }

  const data: WalrusUploadResponse = await response.json();

  if (data.newlyCreated) {
    return data.newlyCreated.blobObject.blobId;
  }

  if (data.alreadyCertified) {
    return data.alreadyCertified.blobId;
  }

  throw new Error("Unexpected Walrus response");
}

export function getWalrusUrl(blobId: string): string {
  return `${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`;
}

export async function uploadBlobHttp(data: Uint8Array): Promise<string> {
  const blob = new Blob([data as unknown as BlobPart], { type: "application/octet-stream" });
  const response = await fetch(`${WALRUS_PUBLISHER_URL}/v1/blobs?epochs=3`, {
    method: "PUT",
    body: blob,
  });

  if (!response.ok) {
    throw new Error(`Walrus upload failed: ${response.statusText}`);
  }

  const result: WalrusUploadResponse = await response.json();

  if (result.newlyCreated) {
    return result.newlyCreated.blobObject.blobId;
  }

  if (result.alreadyCertified) {
    return result.alreadyCertified.blobId;
  }

  throw new Error("Unexpected Walrus response");
}

export async function uploadFilesHttp(files: File[]): Promise<{ blobId: string }[]> {
  const results = await Promise.all(files.map(uploadFileHttp));
  return results.map(blobId => ({ blobId }));
}

export async function readBlobHttp(blobId: string): Promise<Uint8Array> {
  const response = await fetch(getWalrusUrl(blobId));

  if (!response.ok) {
    throw new Error(`Walrus read failed: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}
