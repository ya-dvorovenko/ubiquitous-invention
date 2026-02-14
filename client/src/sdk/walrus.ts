import { WalrusClient, WalrusFile } from "@mysten/walrus";


export const uploadFiles = async (files: File[], suiClient: any, currentAccount: any, signAndExecuteTransaction: any) => {
    const walrusClient = new WalrusClient({
        suiClient: suiClient,
        network: "testnet",
    });

    const flow = await walrusClient.writeFilesFlow({
        files: files.map((file) => {
            return WalrusFile.from({
                contents: file,
                identifier: file.name,
            });
        }),
    });

    await flow.encode();

    const registerBlobTransaction = await flow.register({
        epochs: 3,
        owner: currentAccount.address,
        deletable: true,
    });

    const { digest } = await signAndExecuteTransaction({
        transaction: registerBlobTransaction,
    });

    await flow.upload({ digest });

    const certifyTx = await flow.certify();

    const { digest: certifyDigest } = await signAndExecuteTransaction({
        transaction: certifyTx,
    });

    return await flow.listFiles();
}

export const uploadWalrusFile = async (file: WalrusFile[], suiClient: any, currentAccount: any, signAndExecuteTransaction: any) => {
    const walrusClient = new WalrusClient({
        suiClient: suiClient,
        network: "testnet",
    });

    const flow = await walrusClient.writeFilesFlow({
        files: file,
    });

    await flow.encode();

    const registerBlobTransaction = await flow.register({
        epochs: 3,
        owner: currentAccount.address,
        deletable: true,
    });

    const { digest } = await signAndExecuteTransaction({
        transaction: registerBlobTransaction,
    });

    await flow.upload({ digest });

    const certifyTx = await flow.certify();

    const { digest: certifyDigest } = await signAndExecuteTransaction({
        transaction: certifyTx,
    });

    return await flow.listFiles();
}

export const readFile = async (blobId: string, suiClient: any) => {
    const walrusClient = new WalrusClient({
        suiClient: suiClient,
        network: "testnet",
    });

    return await walrusClient.readBlob({ blobId });
}
