
"use client";

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { DevNote } from '@/lib/data';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Calendar, User, Clock, Tag, ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Reactions } from '@/components/dev-notes/Reactions';

const calculateReadingTime = (text: string): number => {
    if (!text) return 0;
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
};

export default function DevNotePage() {
  const { language, translations } = useLanguage();
  const params = useParams();
  const slug = params.slug as string;
  
  const [note, setNote] = useState<DevNote | null | undefined>(undefined);

  useEffect(() => {
    if (!slug) return;

    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/dev-notes?slug=${slug}`);
        const data = await response.json();
        if (data.success && data.note.isVisible !== false) {
          setNote(data.note);
        } else {
          setNote(null);
        }
      } catch (error) {
        console.error("Failed to fetch note:", error);
        setNote(null);
      }
    };

    fetchNote();
  }, [slug]);

  if (note === undefined) {
    return (
        <div className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
            <Skeleton className="h-10 w-48 mb-8" />
            <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-1/2 mx-auto mb-8" />
            <Skeleton className="h-96 w-full rounded-lg mb-8" />
            <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-full mt-4" />
                <Skeleton className="h-6 w-2/3" />
            </div>
        </div>
    );
  }
  
  if (note === null) {
    notFound();
  }
  
  const readingTime = calculateReadingTime(note.content);

  return (
    <div className="bg-background pb-12 md:pb-20">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Button asChild variant="outline">
                <Link href="/dev-notes" className="inline-flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    {translations.devNotes.allNotes}
                </Link>
            </Button>
        </div>

        <div className="relative h-64 md:h-96 w-full opacity-0 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            {note.imageUrl ? (
                <Image src={note.imageUrl} alt={note.title} data-ai-hint={note.imageHint} layout="fill" objectFit="cover" priority />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ImageIcon className="w-24 h-24 text-muted-foreground" />
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
        </div>

        <article className="container mx-auto px-4 -mt-24 relative z-10 opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            
            <header className="text-center mb-12 max-w-prose mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-white mb-4 leading-tight" style={{textShadow: '0 0 20px hsl(var(--primary) / 0.7)'}}>{note.title}</h1>
                <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 text-foreground/70 text-base">
                    {note.author && (
                        <Link href={`/dev-notes?author=${encodeURIComponent(note.author)}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                            <User className="w-4 h-4" />
                            <span>{note.author}</span>
                        </Link>
                    )}
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4"/>
                        <time dateTime={note.date}>
                            {new Date(note.date).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{readingTime} min read</span>
                    </div>
                </div>
                {note.tags && note.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center items-center gap-2">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        {note.tags.map(tag => (
                            <Link key={tag} href={`/dev-notes?tag=${encodeURIComponent(tag)}`}>
                                <Badge variant="secondary" className="hover:bg-primary/20 transition-colors cursor-pointer">{tag}</Badge>
                            </Link>
                        ))}
                    </div>
                )}
            </header>

            <div className="bg-card p-6 sm:p-8 md:p-12 rounded-xl border border-border/20 shadow-2xl max-w-5xl mx-auto">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            img: ({node, ...props}) => {
                                if (!props.src) return null;
                                // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                                return <img {...props} className="rounded-lg shadow-xl mx-auto border border-border/20" />;
                            },
                        }}
                    >
                        {note.content}
                    </ReactMarkdown>
                </div>
                <Reactions noteId={note.id} initialCounts={note.reactionCounts || {}} />
            </div>
        </article>
    </div>
  );
}
