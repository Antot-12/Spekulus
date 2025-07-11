
"use server";

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import type { HeroSectionData } from '@/lib/data';
import { translations } from '@/lib/translations';
import { getLanguage } from '@/lib/getLanguage';

export async function HeroSection({ data }: { data: HeroSectionData | null }) {
  const lang = getLanguage();
  const t = translations[lang];

  if (!data) {
    return (
      <section className="relative w-full min-h-[80vh] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-muted" />
      </section>
    );
  }

  return (
    <section className="relative w-full min-h-[80vh] flex items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 z-0">
          {data.imageId ? (
            <Image
                src={`/api/images/${data.imageId}`}
                alt={data.title}
                fill
                className="object-cover"
                priority
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 container px-4 md:px-6 flex flex-col items-center">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter font-headline text-white drop-shadow-lg opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              {data.title}
            </h1>
            <p className="text-lg md:text-xl text-gray-200 drop-shadow-md opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              {data.subtitle}
            </p>
            <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-left text-gray-200 opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>{t.hero.feature1}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>{t.hero.feature2}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>{t.hero.feature3}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>{t.hero.feature4}</span>
              </div>
            </div>
            <div className="flex justify-center pt-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
              <Link href="/#action-section">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold px-8 py-6 rounded-full shadow-lg">
                  {t.hero.cta}
                </Button>
              </Link>
            </div>
          </div>
      </div>
    </section>
  );
}
