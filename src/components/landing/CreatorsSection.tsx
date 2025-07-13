
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Creator } from '@/lib/data';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { getCreators } from '@/lib/db/actions';

export function CreatorsSection() {
  const { language, translations } = useLanguage();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadCreators = useCallback(async () => {
    setIsLoaded(false);
    try {
      const data = await getCreators(language);
      const visibleCreators = data.filter((c: Creator) => c && c.slug && c.isVisible !== false);
      setCreators(visibleCreators.slice(0, 5));
    } catch (error) {
      console.error("Failed to load creators", error);
      setCreators([]);
    }
    setIsLoaded(true);
  }, [language]);


  useEffect(() => {
    loadCreators();
  }, [loadCreators]);

  return (
    <section id="creators" className="py-16 md:py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{translations.creators.title}</h2>
          <p className="text-lg text-foreground/70 mt-2">{translations.creators.subtitle}</p>
        </div>
        
        {!isLoaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                <Skeleton className="h-40 w-40 rounded-full" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : creators.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-10 gap-x-6 justify-center">
              {creators.map((creator, index) => (
                <div 
                  key={creator.id}
                  className="group relative flex flex-col items-center text-center opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <Link href={`/creators/${creator.slug}`} className="block mb-4">
                    <div className="relative h-40 w-40">
                      {creator.imageId && (
                        <Image 
                            src={`/api/images/${creator.imageId}`} 
                            alt={creator.name} 
                            layout="fill" 
                            objectFit="cover" 
                            className="rounded-full group-hover:scale-105 transition-transform duration-300 shadow-lg"
                        />
                      )}
                    </div>
                    <h3 className="font-headline text-xl mt-4 group-hover:text-primary transition-colors">{creator.name}</h3>
                    <p className="text-muted-foreground">{creator.role}</p>
                  </Link>
                  <div className="flex gap-4 text-muted-foreground z-10">
                    {creator.socials.github && (
                      <a href={`https://github.com/${creator.socials.github}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="hover:text-primary transition-colors">
                        <Github className="h-5 w-5"/>
                      </a>
                    )}
                    {creator.socials.twitter && (
                      <a href={creator.socials.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter Profile" className="hover:text-primary transition-colors">
                        <Twitter className="h-5 w-5"/>
                      </a>
                    )}
                    {creator.socials.linkedin && (
                      <a href={creator.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="hover:text-primary transition-colors">
                         <Linkedin className="h-5 w-5"/>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
                <Link href="/creators" passHref>
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
                        {translations.creators.viewAll} <ArrowRight className="ml-2 h-5 w-5"/>
                    </Button>
                </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>Creator profiles are coming soon.</p>
          </div>
        )}
      </div>
    </section>
  );
}
