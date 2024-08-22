import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function GET() {
  // Create a new random Ethereum wallet
  const wallet = ethers.Wallet.createRandom();

  // Extract the wallet address
  const address = wallet.address;

  // Return the wallet details as JSON
  return NextResponse.json({
    publicKey: wallet.publicKey,  // The public key of the wallet
    privateKey: wallet.privateKey,  // The private key of the wallet (sensitive information)
    address: address,  // The Ethereum address of the wallet
  });
}