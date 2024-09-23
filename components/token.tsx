'use client';
export const Token = ({
  token,
  selected,
  cursor,
}: {
  token: any;
  selected?: boolean;
  cursor?: boolean;
}) => {
  if (!token?.image) return null;

  return (
    <div
      className={`flex gap-3 bg-white h-28 w-28 ${
        selected ? 'border-2 border-blue-500' : 'border-2 border-black'
      } ${cursor ? 'cursor-pointer' : ''}`}
    >
      <img src={token.image} alt={token.name} className="w-full h-full" />
    </div>
  );
};
