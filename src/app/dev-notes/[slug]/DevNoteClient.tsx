"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { DevNote, Language } from "@/lib/data";
import { useLanguage } from "@/contexts/LanguageContext";
import * as Icon from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reactions } from "@/components/dev-notes/Reactions";
import { getDevNoteBySlug, getSeriesPosts } from "@/lib/db/actions";
import { cloudinaryUrl } from "@/lib/cloudinary";

// New components
import { ShareButtons } from "@/components/dev-notes/ShareButtons";
import { CodeBlock, InlineCode } from "@/components/dev-notes/CodeBlock";
import { SeriesNavigation } from "@/components/dev-notes/SeriesNavigation";
import { ReadingProgress } from "@/components/dev-notes/ReadingProgress";
import { ViewCounter } from "@/components/dev-notes/ViewCounter";

const calculateReadingTime = (text: string): number => {
  if (!text) return 0;
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

interface DevNoteClientProps {
  slug: string;
}

export default function DevNoteClient({ slug }: DevNoteClientProps) {
  const { language, translations } = useLanguage();

  const [note, setNote] = useState<DevNote | null | undefined>(undefined);
  const [seriesPosts, setSeriesPosts] = useState<{ slug: string; title: string; order: number }[]>([]);

  useEffect(() => {
    if (!slug || !language) return;
    const fetchNote = async () => {
      try {
        const notes = await getDevNoteBySlug(slug, language);
        const noteForLang = Array.isArray(notes) ? notes[0] : notes;
        if (noteForLang && noteForLang.isVisible !== false) {
          setNote(noteForLang as DevNote);

          // Fetch series posts if this note is part of a series
          if (noteForLang.series) {
            const posts = await getSeriesPosts(noteForLang.series, language);
            setSeriesPosts(posts);
          }
        } else {
          setNote(null);
        }
      } catch {
        setNote(null);
      }
    };
    fetchNote();
  }, [slug, language]);

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
  const noteDateObj = note.date instanceof Date ? note.date : new Date(note.date as any);
  const isValidDate = note.date && !isNaN(noteDateObj.getTime());

  // Use cloudinaryId for fast loading, fallback to API route
  const imageSrc = (note as any).cloudinaryId
    ? cloudinaryUrl((note as any).cloudinaryId)
    : note.imageId
      ? `/api/images/${note.imageId}`
      : null;

  return (
    <div className="bg-background pb-12 md:pb-20">
      {/* Reading Progress Bar */}
      <ReadingProgress />

      <div
        className="relative h-44 md:h-56 w-full opacity-0 animate-fade-in-up"
        style={{ animationDelay: "150ms" }}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={note.title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Icon.Image className="w-24 h-24 text-muted-foreground" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

        <div className="absolute top-2 left-4 z-10">
          <Button asChild variant="outline" size="sm">
            <Link href="/dev-notes" className="inline-flex items-center gap-2">
              <Icon.ArrowLeft className="w-4 h-4" />
              {translations.devNotes.allNotes}
            </Link>
          </Button>
        </div>
      </div>

      <article
        className="container mx-auto px-4 -mt-16 relative z-10 opacity-0 animate-fade-in-up"
        style={{ animationDelay: "300ms" }}
      >
        <header className="text-center mb-6 max-w-prose mx-auto">
          <h1
            className="text-4xl md:text-5xl font-bold font-headline text-white mb-4 leading-tight"
            style={{ textShadow: "0 0 20px hsl(var(--primary) / 0.7)" }}
          >
            {note.title}
          </h1>
          <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 text-foreground/70 text-base">
            {note.author && (
              <Link
                href={`/dev-notes?author=${encodeURIComponent(note.author)}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Icon.User className="w-4 h-4" />
                <span>{note.author}</span>
              </Link>
            )}
            {isValidDate && (
              <div className="flex items-center gap-2">
                <Icon.Calendar className="w-4 h-4" />
                <time dateTime={noteDateObj.toISOString()}>
                  {noteDateObj.toLocaleDateString(language, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Icon.Clock className="w-4 h-4" />
              <span>{readingTime} min read</span>
            </div>
            {/* View Counter */}
            <ViewCounter slug={slug} lang={language as Language} initialCount={note.viewCount || 0} />
          </div>
          {note.tags && note.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center items-center gap-2">
              <Icon.Tag className="w-4 h-4 text-muted-foreground" />
              {note.tags.map((tag) => (
                <Link key={tag} href={`/dev-notes?tag=${encodeURIComponent(tag)}`}>
                  <Badge variant="secondary" className="hover:bg-primary/20 transition-colors cursor-pointer">
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Series Navigation (if part of a series) */}
        {note.series && seriesPosts.length > 1 && (
          <div className="max-w-5xl mx-auto mb-8">
            <SeriesNavigation
              seriesName={note.series}
              currentSlug={slug}
              posts={seriesPosts}
            />
          </div>
        )}

        <div className="bg-card p-6 sm:p-8 md:p-12 rounded-xl border border-border/20 shadow-2xl max-w-5xl mx-auto">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                // Syntax highlighted code blocks
                code: ({ node, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match && !className;

                  if (isInline) {
                    return <InlineCode {...props}>{children}</InlineCode>;
                  }

                  return (
                    <CodeBlock language={match ? match[1] : 'text'}>
                      {String(children).replace(/\n$/, '')}
                    </CodeBlock>
                  );
                },
                // Remove default pre wrapper since CodeBlock handles it
                pre: ({ children }) => <>{children}</>,
                // Custom image handling
                img: ({ node, ...props }) => {
                  if (!props.src) return null;
                  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                  return <img {...props} className="rounded-lg shadow-xl mx-auto border border-border/20" />;
                },
              }}
            >
              {note.content}
            </ReactMarkdown>
          </div>

          {/* Share buttons at the end of article */}
          <div className="mt-8 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">{translations.devNotes.shareEnjoy}</p>
            <ShareButtons title={note.title} summary={note.summary} slug={slug} />
          </div>

          <Reactions noteId={note.id} initialCounts={note.reactionCounts || {}} />
        </div>

        {/* Series Navigation at the bottom too */}
        {note.series && seriesPosts.length > 1 && (
          <div className="max-w-5xl mx-auto mt-8">
            <SeriesNavigation
              seriesName={note.series}
              currentSlug={slug}
              posts={seriesPosts}
            />
          </div>
        )}
      </article>
    </div>
  );
}
