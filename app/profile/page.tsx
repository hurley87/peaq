import { Tokens } from '@/components/tokens';

export default async function ProfilePage() {
  return (
    <div className="p-6 flex flex-col gap-9 max-w-3xl w-full mx-auto">
      <h2>Your Trait NFTs</h2>
      <Tokens />
    </div>
  );
}
