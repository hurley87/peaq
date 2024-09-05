import { createPublicClient, http } from 'viem';
import traitsABI from '@/abis/Traits.json';
import chain from '@/lib/chain';

export const publicClient = createPublicClient({
  chain,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL!),
});

export async function balanceOf(address: string) {
  try {
    const balanceData = await publicClient.readContract({
      address: traitsABI.address as `0x${string}`,
      abi: traitsABI.abi,
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
      address: traitsABI.address as `0x${string}`,
      abi: traitsABI.abi,
      functionName: 'tokenOfOwnerByIndex',
      args: [address, index],
    });
    const tokenId: number = Number(tokenIdData);
    return tokenId;
  } catch (error) {
    return error;
  }
}

export async function getTokensOfOwner(address: string) {
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

export async function getUri(tokenId: number) {
  try {
    const uriData = await publicClient.readContract({
      address: traitsABI.address as `0x${string}`,
      abi: traitsABI.abi,
      functionName: 'tokenURI',
      args: [tokenId],
    });
    return uriData;
  } catch (error) {
    return error;
  }
}

export async function getToken(uri: string) {
  const content = await fetch(uri, { cache: 'no-store' });
  const json = await content.json();

  return {
    image: json.image,
    name: json.name,
    description: json.description,
  };
}
