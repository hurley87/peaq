export const maxDuration = 15;

import { NextRequest } from 'next/server';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
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
  const { questAddress, tokenId } = await req.json();

  try {
    const privateKey = process.env.SERVER_PRIVATE_KEY;
    const account = privateKeyToAccount(privateKey as `0x${string}`);

    // Approve the token transfer
    const { request: approveRequest }: any =
      await publicClient.simulateContract({
        account,
        address: Traits.address as `0x${string}`, // Traits contract address
        abi: Traits.abi,
        functionName: 'approve',
        args: [questAddress, tokenId],
      });

    const hash = await walletClient.writeContract(approveRequest);
    console.log('Approve hash: ', hash);

    const approveReceipt = await publicClient?.waitForTransactionReceipt({
      hash,
    });
    console.log('Approve receipt: ', approveReceipt);

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
