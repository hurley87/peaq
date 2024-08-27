import Quest from '@/components/quest';

interface QuestPageProps {
  params: { address: string };
}

export default async function QuestPage({ params }: QuestPageProps) {
  const address = params.address as `0x${string}`;
  return <Quest questAddress={address} />;
}
