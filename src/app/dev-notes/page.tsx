
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { DevNote } from '@/lib/data';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as Icon from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { getDevNotes } from '@/lib/db/actions';

type SortOrder = 'newest' | 'oldest';

const calculateReadingTime = (text: string): number => {
    if (!text) return 0;
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
};

export default function DevNotesPage() {
  const { language, translations } = useLanguage();
  const [notes, setNotes] = useState<DevNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const tagFilter = searchParams.get('tag');
  const authorFilter = searchParams.get('author');

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
        const data = await getDevNotes(language);
        setNotes(data);
    } catch (error) {
        console.error("Network error fetching notes:", error);
    }
    setIsLoading(false);
  }, [language]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredAndSortedNotes = useMemo(() => {
    return notes
      .filter(note => note.isVisible !== false)
      .filter(note => !tagFilter || note.tags?.includes(tagFilter))
      .filter(note => !authorFilter || note.author === authorFilter)
      .filter(note => 
        (note.title && note.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (note.summary && note.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [notes, searchTerm, sortOrder, tagFilter, authorFilter]);

  const handleClearFilters = () => {
    router.push('/dev-notes');
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="mb-8">
          <Button asChild variant="outline">
            <Link href="/" className="inline-flex items-center gap-2">
              <Icon.ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">{translations.devNotes.title}</h1>
        <p className="text-xl text-foreground/70 mt-3">{translations.devNotes.subtitle}</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center items-center max-w-2xl mx-auto">
        <div className="relative w-full md:flex-grow">
          <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="text"
            placeholder={translations.devNotes.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={translations.devNotes.sortBy} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{translations.devNotes.sortNewest}</SelectItem>
            <SelectItem value="oldest">{translations.devNotes.sortOldest}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {(tagFilter || authorFilter) && (
        <div className="flex justify-center items-center gap-2 mb-8">
          <p className="text-muted-foreground">
            Filtering by {tagFilter ? 'tag' : 'author'}:
          </p>
          <Badge variant="outline" className="text-base font-semibold">
            {tagFilter || authorFilter}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearFilters}
              className="ml-1 h-5 w-5 rounded-full"
              aria-label="Clear filter"
            >
              <Icon.X className="h-3 w-3" />
            </Button>
          </Badge>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-card border-border/50 overflow-hidden">
              <Skeleton className="h-56 w-full" />
              <CardHeader>
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-8 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-32 mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedNotes.map((note, index) => {
            const readingTime = calculateReadingTime(note.content);
            return (
                <Card
                  key={note.id}
                  className="bg-card border-border/50 overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-primary/20 opacity-0 animate-fade-in-up flex flex-col group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Link href={`/dev-notes/${note.slug}`} className="block overflow-hidden">
                    <div className="relative h-56 w-full bg-muted">
                      {note.imageId ? (
                        <Image src={`/api/images/${note.imageId}`} alt={note.title} layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon.ImageIcon className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <CardHeader>
                     <CardDescription className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs">
                       {note.author && <Link href={`/dev-notes?author=${encodeURIComponent(note.author)}`} className="flex items-center gap-1.5 hover:text-primary transition-colors"><Icon.User className="w-3 h-3"/> {note.author}</Link>}
                       <span className="flex items-center gap-1.5"><Icon.Calendar className="w-3 h-3" />
                       {new Date(note.date).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}
                       </span>
                       <span className="flex items-center gap-1.5"><Icon.Clock className="w-3 h-3"/> {readingTime} min read</span>
                     </CardDescription>
                    <CardTitle className="font-headline text-xl group-hover:text-primary transition-colors pt-1">
                      <Link href={`/dev-notes/${note.slug}`}>{note.title}</Link>
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
                          {translations.devNotes.readMore} <Icon.ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          {notes.length > 0 ? (
            <>
              <p className="text-lg">{translations.devNotes.noResults}</p>
              <p>{translations.devNotes.noResultsSubtitle}</p>
            </>
          ) : (
            <>
              <p className="text-lg">{translations.devNotes.noNotesFound}</p>
              <p>{translations.devNotes.noNotesFoundSubtitle}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
