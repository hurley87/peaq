export const maxDuration = 15;

import { NextRequest } from 'next/server';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import Quests from '@/abis/Quests.json';
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
  const { walletAddress, tokenId, questAddress } = await req.json();

  try {
    const privateKey = process.env.SERVER_PRIVATE_KEY;
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    // Add to allowlist
    const { request }: any = await publicClient.simulateContract({
      account,
      address: questAddress,
      abi: Quests.abi,
      functionName: 'addToAllowlist',
      args: [walletAddress, tokenId],
    });

    const transaction = await walletClient.writeContract(request);

    console.log('Transaction hash: ', transaction);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.log('Error processing request: ', e);
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
