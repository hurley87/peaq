'use client';
import { gaslessFundAndUploadSingleFile, uploadMetadata } from '@/lib/irys';
import Link from 'next/link';
import { useState } from 'react';

const IRYS_URL = 'https://gateway.irys.xyz/';

export default function NewTrait() {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [tokenURI, setTokenURI] = useState<string>('');

  const handleUpload = async () => {
    setIsUploading(true);
    const tags = [{ name: 'Content-Type', value: 'image/png' }];

    if (!imageFile) return;

    try {
      const id = await gaslessFundAndUploadSingleFile(imageFile, tags);

      console.log('Uploaded with id:', id);

      const image = `${IRYS_URL}${id}`;

      setImageUrl(image);

      const receiptId = await uploadMetadata({
        name,
        description,
        image: `${IRYS_URL}${id}`,
      });

      setTokenURI(`${IRYS_URL}${receiptId}`);

      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error uploading');
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 mx-auto max-w-sm">
      <h1>Create trait token</h1>
      <div>
        <label className="block">Name</label>
        <input
          type="text"
          className="text-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="block">Description</label>
        <input
          type="text"
          className="text-black"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label className="block">Image</label>
        <input
          type="file"
          className="input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setImageFile(file);
          }}
        />
      </div>
      <button
        onClick={handleUpload}
        className="bg-white rounded text-black py-2"
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
      <div className="flex flex-col gap-4 text-center">
        {imageUrl && (
          <img src={imageUrl} alt="Uploaded image" className="w-1/2 mx-auto" />
        )}
        {tokenURI && (
          <Link className="text-blue-500" href={tokenURI}>
            {tokenURI}
          </Link>
        )}
      </div>
    </div>
  );
}
