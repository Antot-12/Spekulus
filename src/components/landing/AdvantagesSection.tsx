
"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { advantagesData, type Advantage } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvantageIcon } from '@/components/AdvantageIcon';

export function AdvantagesSection() {
  const { language, translations } = useLanguage();
  const [advantages, setAdvantages] = useState<Advantage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const LOCAL_STORAGE_KEY = `spekulus-advantages-${language}`;
    const loadAdvantages = () => {
      setIsLoaded(false);
      try {
        const storedAdvantages = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedAdvantages) {
          setAdvantages(JSON.parse(storedAdvantages));
        } else {
          setAdvantages(advantagesData[language]);
        }
      } catch (error) {
        console.error("Failed to load advantages from localStorage", error);
        setAdvantages(advantagesData[language]);
      }
      setIsLoaded(true);
    };

    loadAdvantages();
    window.addEventListener('storage', loadAdvantages);
    window.addEventListener('focus', loadAdvantages);

    return () => {
      window.removeEventListener('storage', loadAdvantages);
      window.removeEventListener('focus', loadAdvantages);
    };
  }, [language]);


  return (
    <section id="advantages" className="py-16 md:py-24 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{translations.advantages.title}</h2>
          <p className="text-lg text-foreground/70 mt-2">{translations.advantages.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!isLoaded ? (
             [...Array(6)].map((_, index) => (
                <Card key={index} className="bg-card border-border/50 h-full p-6">
                  <div className="mb-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                  </div>
                  <CardHeader className="p-0">
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent className="p-0 mt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mt-2" />
                  </CardContent>
                </Card>
             ))
          ) : (
            advantages.map((advantage, index) => (
              <div
                key={advantage.id}
                className="opacity-0 animate-fade-in-up transform transition-transform duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <Card className="bg-card border-border/50 h-full shadow-lg hover:shadow-primary/20 p-6 flex flex-col items-start text-left">
                  <div className="mb-4 rounded-lg bg-primary/10 p-3 inline-block">
                      <AdvantageIcon name={advantage.icon} className="w-8 h-8 text-primary" />
                  </div>
                  <CardHeader className="p-0">
                    <CardTitle className="font-headline text-xl">{advantage.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 mt-2">
                    <p className="text-foreground/80">{advantage.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
