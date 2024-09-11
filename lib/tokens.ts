import { createPublicClient, http } from 'viem';
import SolarSeekerTraits from '@/abis/SolarSeekerTraits.json';
import SolarSeekers from '@/abis/SolarSeekers.json';
import chain from '@/lib/chain';
import { gaslessFundAndUploadSingleFile, uploadMetadata } from './irys';

const IRYS_URL = 'https://gateway.irys.xyz/';

export const publicClient = createPublicClient({
  chain,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL!),
});

export async function getMintAllowance(address: string) {
  try {
    const allowanceData = await publicClient.readContract({
      address: SolarSeekerTraits.address as `0x${string}`,
      abi: SolarSeekerTraits.abi,
      functionName: 'mintAllowance',
      args: [address],
    });
    const allowance: number = Number(allowanceData);
    return allowance;
  } catch (error) {
    return error;
  }
}

export async function balanceOf(address: string) {
  try {
    const balanceData = await publicClient.readContract({
      address: SolarSeekerTraits.address as `0x${string}`,
      abi: SolarSeekerTraits.abi,
      functionName: 'balanceOf',
      args: [address],
    });
    const balance: number = Number(balanceData);
    return balance;
  } catch (error) {
    return error;
  }
}

export async function nftBalanceOf(address: string) {
  try {
    const balanceData = await publicClient.readContract({
      address: SolarSeekers.address as `0x${string}`,
      abi: SolarSeekers.abi,
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
      address: SolarSeekerTraits.address as `0x${string}`,
      abi: SolarSeekerTraits.abi,
      functionName: 'tokenOfOwnerByIndex',
      args: [address, index],
    });
    const tokenId: number = Number(tokenIdData);
    return tokenId;
  } catch (error) {
    return error;
  }
}

export async function tokenOfOwnerByIndexSS(address: string, index: number) {
  try {
    const tokenIdData = await publicClient.readContract({
      address: SolarSeekers.address as `0x${string}`,
      abi: SolarSeekers.abi,
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

export async function getNFTId(address: string) {
  try {
    const balance = (await nftBalanceOf(address)) as number;
    const tokenIds = [];

    for (let i = 0; i < balance; i++) {
      const tokenId = await tokenOfOwnerByIndex(address, i);
      tokenIds.push(tokenId);
    }

    return tokenIds[0];
  } catch {
    return [];
  }
}

export async function getUri(tokenId: number) {
  try {
    const uriData = await publicClient.readContract({
      address: SolarSeekerTraits.address as `0x${string}`,
      abi: SolarSeekerTraits.abi,
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
      address: SolarSeekers.address as `0x${string}`,
      abi: SolarSeekers.abi,
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
      address: SolarSeekers.address as `0x${string}`,
      abi: SolarSeekers.abi,
      functionName: 'getEquippedTraits',
      args: [tokenId],
    });
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
