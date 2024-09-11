import Irys from '@irys/sdk';
import { NextRequest, NextResponse } from 'next/server';

const getIrys = async () => {
  const key = process.env.PRIVATE_KEY;
  const token = 'base-eth';
  const network = 'devnet';
  const providerUrl = 'https://base-sepolia.blockpi.network/v1/rpc/public';

  const irys = new Irys({
    network,
    token,
    key,
    config: { providerUrl },
  });

  return irys;
};

export async function POST(req: NextRequest): Promise<Response> {
  const { name, description, image, attributes, metadataCode } =
    await req.json();

  const irys = await getIrys();

  const tags = [];
  if (metadataCode) tags.push({ name: 'Root-TX', value: metadataCode });

  const receipt = await irys.upload(
    JSON.stringify({
      name,
      description,
      image,
      attributes,
    }),
    { tags }
  );

  const receiptId = receipt.id;

  return NextResponse.json({ receiptId });
}

export const dynamic = 'force-dynamic';
