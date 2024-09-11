import { NextRequest } from 'next/server';
import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { urls } = await req.json();

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            width: '512px',
            height: '512px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {urls.map((url: string) => (
            <img
              key={url}
              src={url}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '512px',
                height: '512px',
              }}
            />
          ))}
        </div>
      ),
      {
        width: 512,
        height: 512,
      }
    );

    return new Response(await imageResponse.arrayBuffer(), {
      headers: imageResponse.headers,
    });
  } catch (e) {
    console.error('Error processing request:', e);
    return new Response('Request processing error', { status: 500 });
  }
}
