
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { heroSectionData as defaultData, type HeroSectionData, type Language } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';

export function HeroSection() {
  const { language, translations } = useLanguage();
  const [data, setData] = useState<HeroSectionData>(defaultData.en);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async (lang: Language) => {
    setIsLoading(true);
    try {
        const response = await fetch(`/api/content?lang=${lang}&section=hero`);
        const result = await response.json();
        if (result.success && result.content) {
            setData(result.content);
        } else {
            setData(defaultData[lang]);
        }
    } catch (error) {
        console.error("Failed to load hero data, using default.", error);
        setData(defaultData[lang]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData(language);
  }, [language, fetchData]);

  return (
    <section className="relative w-full min-h-[80vh] flex items-center justify-center text-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <Image
            src={data.imageUrl}
            alt={data.title}
            data-ai-hint={data.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 container px-4 md:px-6 flex flex-col items-center">
        {isLoading ? (
          <div className="max-w-3xl w-full space-y-6 flex flex-col items-center">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-8 w-4/5" />
            <div className="pt-8 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="pt-4">
              <Skeleton className="h-14 w-48 rounded-full" />
            </div>
          </div>
        ) : (
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
                <span>{translations.hero.feature1}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>{translations.hero.feature2}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>{translations.hero.feature3}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>{translations.hero.feature4}</span>
              </div>
            </div>
            <div className="flex justify-center pt-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
              <Link href="/#action-section">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold px-8 py-6 rounded-full shadow-lg">
                  {translations.hero.cta}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
