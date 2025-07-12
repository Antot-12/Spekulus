import { getCreators } from '@/lib/db/actions';
import { getLanguage } from '@/lib/getLanguage';
import CreatorsPageClient from './CreatorsPageClient';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function CreatorsPage() {
  const lang = await getLanguage();
  const allCreators = await getCreators(lang);
  const visibleCreators = allCreators.filter(c => c && c.slug && c.isVisible !== false);

  return <CreatorsPageClient initialCreators={visibleCreators} />;
}
