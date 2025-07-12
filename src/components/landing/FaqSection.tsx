import { FaqClient } from './FaqClient';
import type { FaqItem } from '@/lib/data';
import { getFaqs } from '@/lib/db/actions';
import { getLanguage } from '@/lib/getLanguage';
import { initialData } from '@/lib/data';

export async function FaqSection({ initialFaqs }: { initialFaqs: FaqItem[] | null }) {
  const lang = await getLanguage();

  let faqs = initialFaqs;

  if (!faqs || faqs.length === 0) {
    const fetchedFaqs = await getFaqs(lang);
    faqs = fetchedFaqs && fetchedFaqs.length > 0
      ? fetchedFaqs
      : initialData.faqData[lang].map((faq, index) => ({ ...faq, id: index + 1 }));
  }

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return <FaqClient faqs={faqs} />;
}
