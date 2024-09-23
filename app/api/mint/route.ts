export const maxDuration = 15;

import { NextRequest } from 'next/server';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import Quests from '@/abis/Quests.json';
import Traits from '@/abis/Traits.json';
import chain from '@/lib/chain';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;

const publicClient = createPublicClient({
  chain,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  chain,
  transport: http(RPC_URL),
});

export async function POST(req: NextRequest) {
  const { walletAddress, questAddress, tokenURI } = await req.json();

  try {
    const privateKey = process.env.SERVER_PRIVATE_KEY;
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    // Check if the user can claim
    const canClaimResult = await publicClient.readContract({
      address: questAddress,
      abi: Quests.abi,
      functionName: 'canClaim',
      args: [walletAddress],
    });

    if (canClaimResult) {
      return new Response(JSON.stringify({ error: 'User can already claim' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Proceed with minting and adding to allowlist
    const { request: mintRequest }: any = await publicClient.simulateContract({
      account,
      address: Traits.address as `0x${string}`,
      abi: Traits.abi,
      functionName: 'safeMint',
      args: ['0x1169E27981BceEd47E590bB9E327b26529962bAe', tokenURI],
    });

    const hash = await walletClient.writeContract(mintRequest);

    const receipt = await publicClient?.waitForTransactionReceipt({ hash });

    // The tokenId will be the return value of the mint function
    const token = receipt.logs[0]?.topics[3];
    const tokenId = BigInt(token ?? 0).toString();

    return new Response(JSON.stringify({ tokenId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
