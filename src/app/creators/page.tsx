
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { creatorsData, type Creator } from '@/lib/data';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Github, Twitter, Linkedin } from 'lucide-react';

export default function CreatorsPage() {
  const { language, translations } = useLanguage();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadCreators = useCallback(() => {
    const LOCAL_STORAGE_KEY = `spekulus-creators-${language}`;
    try {
      const storedCreators = localStorage.getItem(LOCAL_STORAGE_KEY);
      const creatorsDataList: Creator[] = storedCreators ? JSON.parse(storedCreators) : creatorsData[language];
      setCreators(creatorsDataList.filter(c => c && c.slug && c.isVisible !== false));
    } catch (error) {
      console.error("Failed to load creators", error);
      setCreators(creatorsData[language].filter(c => c.isVisible !== false));
    }
    setIsLoaded(true);
  }, [language]);

  useEffect(() => {
    loadCreators();

    window.addEventListener('storage', loadCreators);
    window.addEventListener('focus', loadCreators);

    return () => {
      window.removeEventListener('storage', loadCreators);
      window.removeEventListener('focus', loadCreators);
    };
  }, [loadCreators]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">{translations.creators.title}</h1>
        <p className="text-xl text-foreground/70 mt-3">{translations.creators.subtitle}</p>
      </div>

      {!isLoaded ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-card border-border/50 overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                 <Skeleton className="h-6 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : creators.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {creators.map((creator, index) => (
            <Link href={`/creators/${creator.slug}`} key={creator.id} className="block group">
              <Card
                className="bg-card border-border/50 overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-primary/20 opacity-0 animate-fade-in-up flex flex-col h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-64 w-full">
                  <Image src={creator.imageUrl} alt={creator.name} data-ai-hint={creator.imageHint} layout="fill" objectFit="cover" />
                </div>
                <CardHeader>
                  <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors">{creator.name}</CardTitle>
                  <CardDescription>{creator.role}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end">
                  <div className="flex gap-4 text-muted-foreground">
                    {creator.socials.github && <Github className="h-5 w-5 hover:text-primary" />}
                    {creator.socials.twitter && <Twitter className="h-5 w-5 hover:text-primary" />}
                    {creator.socials.linkedin && <Linkedin className="h-5 w-5 hover:text-primary" />}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">Creator profiles are not available yet.</p>
            <p>Check back soon to meet the team!</p>
        </div>
      )}
    </div>
  );
}

    