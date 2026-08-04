'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';
import type { HeroSectionData, Language } from '@/lib/data';
import { translations } from '@/lib/translations';
import { AdvantageIcon } from '../AdvantageIcon';

import { getBlurDataURL } from '@/lib/blurPlaceholder';

export function HeroSection({ data, lang }: { data: HeroSectionData | null, lang: Language }) {
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
            priority
            sizes="100vw"
            quality={85}
            placeholder="blur"
            blurDataURL={getBlurDataURL(1920, 1080)}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 container px-4 md:px-6 flex flex-col items-center">
        <div className="max-w-3xl space-y-6">
          <h1
            className="text-4xl md:text-6xl font-bold tracking-tighter font-headline text-white drop-shadow-lg opacity-0 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            {data.title}
          </h1>
          <p
            className="text-lg md:text-xl text-gray-200 drop-shadow-md opacity-0 animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            {data.subtitle}
          </p>
          <div
            className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-left text-gray-200 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '600ms' }}
          >
            {data.features?.map((feature) => (
              <div key={feature.id} className="flex items-center gap-2">
                <AdvantageIcon name={feature.icon} className="w-5 h-5 text-primary" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
          <div
            className="flex justify-center pt-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: '800ms' }}
          >
            <Link href="/#action-section">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold px-8 py-6 rounded-full shadow-lg"
              >
                {t.hero.cta}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
