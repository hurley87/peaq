import {
  getTraitIds,
  getUri,
  getToken,
  getNFTId,
  getNFTUri,
  tokenOfOwnerByIndexSS,
  getEquippedTraits,
} from '@/lib/tokens';
import { gaslessFundAndUploadSingleFile, uploadMetadata } from '@/lib/irys';
import SolarSeekers from '@/abis/SolarSeekers.json';
import toast from 'react-hot-toast';

const IRYS_URL = 'https://gateway.irys.xyz/';

export interface TokenData {
  id: number;
  name: string;
  image: string;
  attributes: { trait_type: string; value: string | number }[];
}

export interface NFTData {
  tokens: TokenData[];
  nft: TokenData | null;
  equippedTraits: bigint[];
}

export async function fetchTokens(address: string): Promise<NFTData> {
  const tokenIds = (await getTraitIds(address)) as number[];

  const tokens = await Promise.all(
    tokenIds.map(async (tokenId) => {
      const uri = await getUri(tokenId);
      const tokenData = await getToken(uri as string);
      return { ...tokenData, id: tokenId };
    })
  );

  const nftId = (await getNFTId(address)) as number;

  let nft = null;
  let equippedTraits: bigint[] = [];

  if (nftId || nftId === 0) {
    const tokenId = await tokenOfOwnerByIndexSS(address, nftId);
    const nftUri = await getNFTUri(tokenId as number);
    const tokenData = await getToken(nftUri as string);
    nft = {
      id: tokenId,
      ...tokenData,
    };

    equippedTraits = (await getEquippedTraits(tokenId as number)) as bigint[];
  }

  return { tokens, nft, equippedTraits };
}

export async function mintNFT(
  address: string,
  tokens: TokenData[],
  publicClient: any,
  primaryWallet: any
): Promise<TokenData> {
  const tokenIds = tokens.map((token) => token.id);
  const urls = tokens.map((token) => token.image);

  const response = await fetch('/api/combine', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ urls }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const blob = new Blob([buffer], { type: 'image/png' });
  const file = new File([blob], 'combined_image.png', {
    type: 'image/png',
  });

  const tags = [{ name: 'Content-Type', value: 'image/png' }];

  const id = await gaslessFundAndUploadSingleFile(file, tags);

  const image = `${IRYS_URL}${id}`;

  const name = 'Solar Seeker';
  const description = 'Solar Seeker';

  const receiptId = await uploadMetadata({
    name,
    description,
    image: `${IRYS_URL}${id}`,
    attributes: [{ trait_type: 'Background', value: 0 }],
  });

  const tokenURI = `${IRYS_URL}${receiptId}`;

  const data = await publicClient?.simulateContract({
    address: SolarSeekers.address as `0x${string}`,
    abi: SolarSeekers.abi,
    functionName: 'mintWithTraits',
    args: [tokenIds, tokenURI],
    account: address as `0x${string}`,
  });

  const request = data?.request;

  if (request) {
    const hash = await primaryWallet.writeContract(request as any);
    await publicClient?.waitForTransactionReceipt({ hash });
    toast.success(`Mint success`);
  } else {
    throw new Error('Invalid request object');
  }

  const newNFT = await getToken(tokenURI);
  return newNFT;
}

export async function updateNFTTraits(
  address: string,
  nft: TokenData,
  tokens: TokenData[],
  selectedTraits: number[],
  equippedTraits: bigint[],
  publicClient: any,
  primaryWallet: any
): Promise<TokenData> {
  const traits = tokens.filter((token) => selectedTraits.includes(token.id));
  const traitIds = traits.map((trait) => trait.id);

  const slots = traits.map((trait) => {
    const type = trait.attributes.find((attr) => attr.trait_type === 'Type');
    if (type?.value === 'Background') return 0;
    if (type?.value === 'Suit') return 1;
    if (type?.value === 'Helmet') return 2;
    if (type?.value === 'Powercore') return 3;
    return 1;
  });

  slots.forEach((slot, index) => {
    equippedTraits[slot] = BigInt(traitIds[index]);
  });

  const urls = equippedTraits.slice(0, 4).map((trait) => {
    const token = tokens.find((token) => token.id === Number(trait));
    return token?.image;
  });

  const response = await fetch('/api/combine', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const buffer = await response.arrayBuffer();
  const blob = new Blob([buffer], { type: 'image/png' });
  const file = new File([blob], 'combined_image.png', { type: 'image/png' });

  const tags = [{ name: 'Content-Type', value: 'image/png' }];
  const id = await gaslessFundAndUploadSingleFile(file, tags);
  const image = `${IRYS_URL}${id}`;

  const receiptId = await uploadMetadata({
    name: 'Solar Seeker',
    description: 'Solar Seeker',
    image: `${IRYS_URL}${id}`,
    attributes: [{ trait_type: 'Background', value: 0 }],
  });

  const tokenURI = `${IRYS_URL}${receiptId}`;

  const data = await publicClient?.simulateContract({
    address: SolarSeekers.address as `0x${string}`,
    abi: SolarSeekers.abi,
    functionName: 'updateTraits',
    args: [nft.id, traitIds, slots, tokenURI],
    account: address as `0x${string}`,
  });

  if (data.request) {
    const hash = await primaryWallet.writeContract(data.request);
    await publicClient?.waitForTransactionReceipt({ hash });
    toast.success('Traits updated successfully');
  } else {
    throw new Error('Invalid request object');
  }

  const updatedNFT = await getToken(tokenURI);
  return updatedNFT;
}
