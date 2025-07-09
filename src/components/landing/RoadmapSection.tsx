
"use client";

import { useState, useEffect } from 'react';
import { roadmapEvents as staticRoadmapEvents } from '@/lib/data';
import { Calendar, Lightbulb, FlaskConical, Rocket, Store, Wand2, PackageCheck, Globe, Flag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import type { RoadmapEvent } from '@/lib/data';

const LOCAL_STORAGE_KEY_PREFIX = 'spekulus-roadmap-events-';

const getRoadmapIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('idea')) return <Lightbulb className="mx-auto text-primary-foreground h-4 w-4" />;
    if (lowerTitle.includes('demo')) return <FlaskConical className="mx-auto text-primary-foreground h-4 w-4" />;
    if (lowerTitle.includes('implementation')) return <Rocket className="mx-auto text-primary-foreground h-4 w-4" />;
    if (lowerTitle.includes('widget')) return <Store className="mx-auto text-primary-foreground h-4 w-4" />;
    if (lowerTitle.includes('makeup')) return <Wand2 className="mx-auto text-primary-foreground h-4 w-4" />;
    if (lowerTitle.includes('release')) return <PackageCheck className="mx-auto text-primary-foreground h-4 w-4" />;
    if (lowerTitle.includes('market')) return <Globe className="mx-auto text-primary-foreground h-4 w-4" />;
    return <Flag className="mx-auto text-primary-foreground h-4 w-4" />;
};

export function RoadmapSection() {
  const { language, translations } = useLanguage();
  const [roadmapEvents, setRoadmapEvents] = useState<RoadmapEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${language}`;
    const loadRoadmap = () => {
        try {
            const storedRoadmap = localStorage.getItem(localStorageKey);
            if (storedRoadmap) {
                setRoadmapEvents(JSON.parse(storedRoadmap));
            } else {
                setRoadmapEvents(staticRoadmapEvents[language]);
            }
        } catch (error) {
            console.error("Failed to load roadmap from localStorage", error);
            setRoadmapEvents(staticRoadmapEvents[language]);
        }
        setIsLoaded(true);
    }
    
    loadRoadmap();

    window.addEventListener('storage', loadRoadmap);
    window.addEventListener('focus', loadRoadmap);
    
    return () => {
        window.removeEventListener('storage', loadRoadmap);
        window.removeEventListener('focus', loadRoadmap);
    };
  }, [language]);

  return (
    <section id="roadmap" className="py-16 md:py-24 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{translations.roadmap.title}</h2>
          <p className="text-lg text-foreground/70 mt-2">{translations.roadmap.subtitle}</p>
        </div>

        <div className="relative wrap overflow-hidden p-2 md:p-10 h-full">
          <div className="absolute h-full border border-dashed border-border/40 left-5 md:left-1/2 -translate-x-1/2"></div>
          
          {!isLoaded ? (
            [...Array(4)].map((_, i) => (
                <div key={i} className={`mb-8 flex justify-between items-center w-full ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                    <div className="order-1 w-5/12"></div>
                    <div className="z-20 flex items-center order-1 bg-muted shadow-xl w-8 h-8 rounded-full"></div>
                    <div className="order-1 w-5/12 px-1 py-4">
                        <Card className="border-border/50">
                            <CardHeader>
                                <Skeleton className="h-5 w-28 mb-2" />
                                <Skeleton className="h-7 w-48" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-10 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ))
          ) : (
            roadmapEvents.map((event, index) => {
              const isRight = index % 2 === 0;
              const dt = new Date(event.date);
              const formattedDate = !isNaN(dt.getTime()) ? dt.toLocaleDateString(language, { year: 'numeric', month: 'short', day: 'numeric' }) : event.date;

              return (
                <div 
                  key={index} 
                  className={`mb-8 flex md:justify-between items-center w-full ${isRight ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="hidden md:block order-1 w-5/12"></div>
                  
                  <div className="z-20 flex items-center order-1 bg-primary shadow-xl w-10 h-10 rounded-full shrink-0">
                    {getRoadmapIcon(event.title)}
                  </div>

                  <div 
                    className={`order-1 w-full md:w-5/12 px-1 py-4 ml-4 md:ml-0 opacity-0 animate-fade-in-up`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                      <Card className={`border-border/50 shadow-md hover:border-primary/50 transition-colors ${isRight ? 'text-left' : 'md:text-right'}`}>
                          <CardHeader className={`${isRight ? '' : 'md:items-end'}`}>
                              <p className={`text-primary font-semibold flex items-center gap-2 ${isRight ? '' : 'md:flex-row-reverse'}`}>
                                  <Calendar className="w-4 h-4" />
                                  {formattedDate}
                              </p>
                              <CardTitle className="font-headline text-xl md:text-2xl">{event.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                              <p className="text-foreground/80">{event.description}</p>
                          </CardContent>
                      </Card>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
