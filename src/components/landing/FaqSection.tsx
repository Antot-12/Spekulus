
import { FaqClient } from './FaqClient';
import type { FaqItem as FaqItemType } from '@/lib/data';
import { getLanguage } from '@/lib/getLanguage';
import { getFaqs } from '@/lib/db/actions';

export async function FaqSection({initialFaqs}: {initialFaqs: FaqItemType[] | null}){
  const lang = getLanguage();

  // The initialFaqs are passed from the parent page component to avoid waterfalls
  // but if this component were used on its own, it could fetch its own data.
  const faqs = initialFaqs || await getFaqs(lang);

  if(!faqs || faqs.length === 0) {
    return null;
  }

  return <FaqClient faqs={faqs} />;
}
