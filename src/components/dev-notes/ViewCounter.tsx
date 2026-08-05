"use client";

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { incrementDevNoteViewCount } from '@/lib/db/actions';
import type { Language } from '@/lib/data';
import { useLanguage } from '@/contexts/LanguageContext';

interface ViewCounterProps {
  slug: string;
  lang: Language;
  initialCount?: number;
}

export function ViewCounter({ slug, lang, initialCount = 0 }: ViewCounterProps) {
  const { translations } = useLanguage();
  const [count, setCount] = useState(initialCount);
  const [hasIncremented, setHasIncremented] = useState(false);

  useEffect(() => {
    // Only increment once per page load and check sessionStorage to avoid re-counting on navigation
    const viewedKey = `viewed-${slug}-${lang}`;
    const hasViewed = sessionStorage.getItem(viewedKey);

    if (!hasIncremented && !hasViewed) {
      setHasIncremented(true);
      sessionStorage.setItem(viewedKey, 'true');

      // Increment view count
      incrementDevNoteViewCount(slug, lang).then((newCount) => {
        if (newCount > 0) {
          setCount(newCount);
        }
      });
    }
  }, [slug, lang, hasIncremented]);

  const formatCount = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Eye className="h-4 w-4" />
      <span className="text-sm">{formatCount(count)} {translations.devNotes.views}</span>
    </div>
  );
}
