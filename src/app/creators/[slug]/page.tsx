import { notFound } from 'next/navigation';
import { getCreatorBySlug } from '@/lib/db/actions';
import { getLanguage } from '@/lib/getLanguage';
import CreatorDetailPageClient from './CreatorDetailPageClient';

export const revalidate = 60; // Revalidate every 60 seconds

type Props = {
  params: { slug: string };
};

export default async function CreatorDetailPage({ params }: Props) {
  const { slug } = params;
  const lang = await getLanguage();

  const creator = await getCreatorBySlug(lang, slug);

  if (!creator || creator.isVisible === false) {
    notFound();
  }

  return <CreatorDetailPageClient creator={creator} />;
}
