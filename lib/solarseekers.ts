import { createPublicClient, http } from 'viem';
import SolarSeekers from '@/abis/SolarSeekers.json';
import chain from '@/lib/chain';
import { gaslessFundAndUploadSingleFile, uploadMetadata } from './irys';

const IRYS_URL = 'https://gateway.irys.xyz/';
const ss_address = SolarSeekers.address as `0x${string}`;
const abi = SolarSeekers.abi;

export const publicClient = createPublicClient({
  chain,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL!),
});

export async function balanceOf(address: string) {
  try {
    const balanceData = await publicClient.readContract({
      address: ss_address,
      abi,
      functionName: 'balanceOf',
      args: [address],
    });
    const balance: number = Number(balanceData);
    return balance;
  } catch (error) {
    return error;
  }
}

export async function tokenOfOwnerByIndex(address: string, index: number) {
  try {
    const tokenIdData = await publicClient.readContract({
      address: ss_address,
      abi,
      functionName: 'tokenOfOwnerByIndex',
      args: [address, index],
    });
    const tokenId: number = Number(tokenIdData);
    return tokenId;
  } catch (error) {
    return error;
  }
}

export async function getTraitIds(address: string) {
  try {
    const balance = (await balanceOf(address)) as number;
    const tokenIds = [];

    for (let i = 0; i < balance; i++) {
      const tokenId = await tokenOfOwnerByIndex(address, i);
      tokenIds.push(tokenId);
    }

    return tokenIds;
  } catch {
    return [];
  }
}

export async function getId(address: string) {
  try {
    const balance = (await balanceOf(address)) as number;
    const tokenIds = [];

    for (let i = 0; i < balance; i++) {
      const tokenId = await tokenOfOwnerByIndex(address, i);
      tokenIds.push(tokenId);
    }

    console.log('tokenIds', tokenIds);

    return tokenIds[0];
  } catch {
    return [];
  }
}

export async function getUri(tokenId: number) {
  try {
    const uriData = await publicClient.readContract({
      address: ss_address,
      abi,
      functionName: 'tokenURI',
      args: [tokenId],
    });
    return uriData;
  } catch (error) {
    return error;
  }
}

export async function getNFTUri(tokenId: number) {
  try {
    const uriData = await publicClient.readContract({
      address: ss_address,
      abi,
      functionName: 'tokenURI',
      args: [tokenId],
    });
    return uriData;
  } catch (error) {
    return error;
  }
}

export async function getEquippedTraits(tokenId: number) {
  try {
    const traitIds = await publicClient.readContract({
      address: ss_address,
      abi,
      functionName: 'getEquippedTraits',
      args: [tokenId],
    });
    console.log('traitIds', traitIds);
    return traitIds;
  } catch (error) {
    return error;
  }
}

export async function getToken(uri: string) {
  const content = await fetch(uri, { cache: 'no-store' });
  const token = await content.json();

  return token;
}

export async function getTokenURIFromImages(urls: string[]) {
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
    image,
  });

  return `${IRYS_URL}${receiptId}`;
}
