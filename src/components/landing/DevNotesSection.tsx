
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { DevNote } from '@/lib/data';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ImageIcon, Calendar, User } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';

export function DevNotesSection() {
  const { language, translations } = useLanguage();
  const [notes, setNotes] = useState<DevNote[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchNotes = useCallback(async () => {
    setIsLoaded(false);
    try {
        const response = await fetch('/api/dev-notes');
        const data = await response.json();
        if (data.success) {
            const visibleNotes = data.notes.filter((note: DevNote) => note.isVisible !== false);
            const sortedNotes = visibleNotes.sort((a: DevNote, b: DevNote) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setNotes(sortedNotes.slice(0, 3));
        } else {
            console.error("Failed to fetch notes for landing page:", data.error);
        }
    } catch (error) {
        console.error("Network error fetching notes:", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return (
    <section id="dev-notes" className="py-16 md:py-24 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{translations.devNotes.title}</h2>
          <p className="text-lg text-foreground/70 mt-2">{translations.devNotes.subtitle}</p>
        </div>
        
        {!isLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-card border-border/50 overflow-hidden">
                <Skeleton className="h-56 w-full" />
                <CardHeader>
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-10 w-32 mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : notes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {notes.map((note, index) => (
                <Card 
                  key={note.id} 
                  className="bg-card border-border/50 overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-primary/20 opacity-0 animate-fade-in-up flex flex-col group"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <Link href={`/dev-notes/${note.slug}`} className="block overflow-hidden">
                    <div className="relative h-56 w-full bg-muted">
                      {note.imageId ? (
                        <Image src={`/api/images/${note.imageId}`} alt={note.title} layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardHeader>
                     <CardDescription className="flex items-center gap-x-4 text-xs">
                       {note.author && <Link href={`/dev-notes?author=${encodeURIComponent(note.author)}`} className="flex items-center gap-1.5 hover:text-primary transition-colors"><User className="w-3 h-3"/> {note.author}</Link>}
                       <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />
                       {new Date(note.date).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}
                       </span>
                     </CardDescription>
                    <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors pt-1">
                      <Link href={`/dev-notes/${note.slug}`}>
                        {note.title}
                      </Link>
                    </CardTitle>
                    {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            {note.tags.map(tag => (
                                <Link key={tag} href={`/dev-notes?tag=${encodeURIComponent(tag)}`}>
                                    <Badge variant="secondary" className="text-xs hover:bg-primary/20 transition-colors cursor-pointer">{tag}</Badge>
                                </Link>
                            ))}
                        </div>
                     )}
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <p className="text-foreground/80 flex-grow text-sm">{note.summary}</p>
                    <div className="mt-4">
                      <Link href={`/dev-notes/${note.slug}`} passHref>
                         <Button variant="link" className="p-0 text-primary hover:text-primary/80">
                           {translations.devNotes.readMore} <ArrowRight className="ml-2 h-4 w-4" />
                         </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
                <Link href="/dev-notes" passHref>
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
                        {translations.devNotes.allNotes}
                    </Button>
                </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>{translations.devNotes.noNotesFoundSubtitle}</p>
          </div>
        )}
      </div>
    </section>
  );
}
