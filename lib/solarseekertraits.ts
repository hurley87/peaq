import { createPublicClient, http } from 'viem';
import SolarSeekerTraits from '@/abis/SolarSeekerTraits.json';
import SolarSeekers from '@/abis/SolarSeekers.json';
import chain from '@/lib/chain';

const traits_address = SolarSeekerTraits.address as `0x${string}`;
const abi = SolarSeekerTraits.abi;

export const publicClient = createPublicClient({
  chain,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL!),
});

export async function getMintAllowance(address: string) {
  try {
    const allowanceData = await publicClient.readContract({
      address: traits_address,
      abi,
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
      address: traits_address,
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
      address: traits_address,
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
      address: traits_address,
      abi,
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
  const token = await content.json();

  return token;
}
