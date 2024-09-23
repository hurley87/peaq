'use client';
import { useEffect, useState } from 'react';

export const Trait = ({ uri }: { uri: string }) => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState(null);

  useEffect(() => {
    fetch(uri)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setImage(data.image);
        setName(data.name);
      });
  }, [uri]);

  if (!image || !name) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-white">{name}</p>
      <div className={` bg-white h-28 w-28`}>
        <img src={image} alt={name} className="h-28 w-28" />
      </div>
    </div>
  );
};
