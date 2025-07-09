
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { actionSectionData } from '@/lib/data';
import type { ActionSectionData } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function ActionSection() {
  const { language } = useLanguage();
  const [data, setData] = useState<ActionSectionData>(actionSectionData.en);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const LOCAL_STORAGE_KEY = `spekulus-action-section-${language}`;
    const loadData = () => {
      try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
          setData({ ...actionSectionData[language], ...JSON.parse(storedData) });
        } else {
          setData(actionSectionData[language]);
        }
      } catch (error) {
        console.error("Failed to load action section data from localStorage", error);
        setData(actionSectionData[language]);
      }
      setIsLoaded(true);
    };

    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('focus', loadData);

    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('focus', loadData);
    };
  }, [language]);

  if (!isLoaded) {
    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 text-center">
                 <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
                 <Skeleton className="h-6 w-1/2 mx-auto mb-12" />
                 <Skeleton className="aspect-video w-full max-w-5xl mx-auto rounded-lg mb-8" />
                 <Skeleton className="h-5 w-4/5 mx-auto" />
                 <Skeleton className="h-5 w-2/3 mx-auto mt-2" />
            </div>
        </section>
    );
  }
  
  if (!data.visible) {
    return null;
  }

  return (
    <section id="action-section" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline opacity-0 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            {data.title}
          </h2>
          <p className="text-lg text-foreground/70 mt-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            {data.subtitle}
          </p>
        </div>
        <div className="flex flex-col items-center opacity-0 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
          <div className="relative w-full max-w-5xl aspect-video rounded-lg overflow-hidden shadow-2xl group">
            <Image
              src={data.imageUrl}
              alt={data.title}
              data-ai-hint={data.imageHint}
              layout="fill"
              objectFit="cover"
              className="group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <p className="mt-8 max-w-3xl text-center text-foreground/80 text-lg">
            {data.description}
          </p>
          {data.buttonVisible && data.buttonUrl && (
            <div className="mt-8">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
                <a href={data.buttonUrl} target="_blank" rel="noopener noreferrer">
                  {data.buttonText} <ArrowRight className="ml-2 h-5 w-5"/>
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
