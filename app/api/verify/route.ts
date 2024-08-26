import { NextRequest, NextResponse } from 'next/server';
import { privateKeyToAccount } from 'viem/accounts';
import { hashMessage } from 'viem';

export async function GET(request: NextRequest) {
  // Extract message from the request URL
  const { searchParams } = new URL(request.url);
  const message = searchParams.get('message');

  // Check if the quest is complete. Assumption here is true but quest system logic would be implemented here.
  const questComplete = true;
  if (!questComplete) {
    return NextResponse.json(
      { success: false, message: 'Quest not completed.' },
      { status: 400 }
    );
  }

  // Retrieve the server's private key from environment variables
  const privateKey = process.env.SERVER_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json(
      { success: false, message: 'Server configuration error.' },
      { status: 500 }
    );
  }

  // Create an account instance from the private key
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  // Sign the message using the account
  const signature = await account.signMessage({ message: message || '' });

  // Generate a hash of the message
  const messageHash = hashMessage(message || '');

  // Return the signature and message hash in the response
  return NextResponse.json({
    success: true,
    message: 'Task completed.',
    signature,
    messageHash,
  });
}
