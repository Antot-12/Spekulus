import { FaqClient } from './FaqClient';
import type { FaqItem } from '@/lib/data';

export function FaqSection({ faqs }: { faqs: FaqItem[] | null }) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return <FaqClient faqs={faqs} />;
}
