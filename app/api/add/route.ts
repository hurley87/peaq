export const maxDuration = 15;

import { NextRequest } from 'next/server';
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import Quests from '@/abis/Quests.json';
import Traits from '@/abis/Traits.json';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;

const chain = defineChain({
  id: 9990,
  name: 'Agung',
  nativeCurrency: {
    decimals: 18,
    name: 'AGNG',
    symbol: 'AGNG',
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
  },
});

const publicClient = createPublicClient({
  chain,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  chain,
  transport: http(RPC_URL),
});

export async function POST(req: NextRequest) {
  const { walletAddress, questAddress } = await req.json();

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
    // Simulate the contract interaction
    const { request: mintRequest }: any = await publicClient.simulateContract({
      account,
      address: '0x67b79424bd38faa86001af9beea28a35a1cc122c',
      abi: Traits.abi,
      functionName: 'safeMint',
      args: ['0x1169E27981BceEd47E590bB9E327b26529962bAe', ''],
    });

    const hash = await walletClient.writeContract(mintRequest);

    console.log('Mint hash: ', hash);

    const receipt = await publicClient?.waitForTransactionReceipt({ hash });

    console.log('Mint receipt: ', receipt);

    // The tokenId will be the return value of the mint function
    const token = receipt.logs[0]?.topics[3];
    const tokenId = BigInt(token ?? 0).toString();
    console.log('Token ID: ', tokenId);

    // Approve the token transfer
    const { request: approveRequest }: any =
      await publicClient.simulateContract({
        account,
        address: '0x67b79424bd38faa86001af9beea28a35a1cc122c', // Traits contract address
        abi: Traits.abi,
        functionName: 'approve',
        args: [questAddress, tokenId],
      });

    const approveHash = await walletClient.writeContract(approveRequest);
    console.log('Approve hash: ', approveHash);

    const approveReceipt = await publicClient?.waitForTransactionReceipt({
      hash: approveHash,
    });
    console.log('Approve receipt: ', approveReceipt);

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
