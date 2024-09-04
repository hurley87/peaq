import { WebIrys } from '@irys/sdk';

type Tag = {
  name: string;
  value: string;
};

export const gaslessFundAndUploadSingleFile = async (
  selectedFile: File,
  tags: Tag[]
): Promise<string> => {
  // obtain the server's public key
  const pubKeyRes = (await (
    await fetch('/api/publicKey')
  ).json()) as unknown as {
    pubKey: string;
  };
  const pubKey = Buffer.from(pubKeyRes.pubKey, 'hex');

  // Create a provider - this mimics the behaviour of the injected provider, i.e metamask
  const provider = {
    // for ETH wallets
    getPublicKey: async () => {
      return pubKey;
    },
    getSigner: () => {
      return {
        getAddress: () => pubKey.toString(), // pubkey is address for TypedEthereumSigner
        _signTypedData: async (
          _domain: never,
          _types: never,
          message: { address: string; 'Transaction hash': Uint8Array }
        ) => {
          const convertedMsg = Buffer.from(
            message['Transaction hash']
          ).toString('hex');
          const res = await fetch('/api/signData', {
            method: 'POST',
            body: JSON.stringify({ signatureData: convertedMsg }),
          });
          const { signature } = await res.json();
          const bSig = Buffer.from(signature, 'hex');
          // Pad & convert so it's in the format the signer expects to have to convert from.
          const pad = Buffer.concat([
            Buffer.from([0]),
            Buffer.from(bSig),
          ]).toString('hex');
          return pad;
        },
      };
    },

    _ready: () => {},
  };

  // You can delete the lazyFund route if you're prefunding all uploads
  // await fetch('/api/lazyFund', {
  //   method: 'POST',
  //   body: selectedFile.size.toString(),
  // });

  // Create a new WebIrys object using the provider created with server info.
  const network = 'devnet';
  const token = 'base-eth';
  const wallet = { name: 'ethersv5', provider: provider };
  //@ts-ignore
  const irys = new WebIrys({ network, token, wallet });

  await irys.ready();

  const tx = await irys.uploadFile(selectedFile, {
    tags,
  });

  return tx.id;
};

export const uploadMetadata = async (metadata: any) => {
  const res = await fetch('/api/uploadMetadata', {
    method: 'POST',
    body: JSON.stringify(metadata),
  });
  const { receiptId } = await res.json();
  return receiptId;
};
