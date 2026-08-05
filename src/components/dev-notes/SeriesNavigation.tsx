"use client";

import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SeriesPost {
  slug: string;
  title: string;
  order: number;
}

interface SeriesNavigationProps {
  seriesName: string;
  currentSlug: string;
  posts: SeriesPost[];
}

export function SeriesNavigation({ seriesName, currentSlug, posts }: SeriesNavigationProps) {
  if (!posts || posts.length <= 1) return null;

  const sortedPosts = [...posts].sort((a, b) => a.order - b.order);
  const currentIndex = sortedPosts.findIndex(p => p.slug === currentSlug);
  const prevPost = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;

  return (
    <Card className="p-4 bg-muted/30 border-primary/20">
      {/* Series Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/50">
        <BookOpen className="h-5 w-5 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Series</p>
          <h3 className="font-semibold text-primary">{seriesName}</h3>
        </div>
        <span className="ml-auto text-sm text-muted-foreground">
          Part {currentIndex + 1} of {sortedPosts.length}
        </span>
      </div>

      {/* Posts List */}
      <div className="space-y-1 mb-4">
        {sortedPosts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/dev-notes/${post.slug}`}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              post.slug === currentSlug
                ? "bg-primary/10 text-primary font-medium"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <span className={cn(
              "flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium",
              post.slug === currentSlug
                ? "bg-primary text-primary-foreground"
                : "bg-muted-foreground/20"
            )}>
              {index + 1}
            </span>
            <span className="truncate">{post.title}</span>
          </Link>
        ))}
      </div>

      {/* Prev/Next Navigation */}
      <div className="flex gap-2 pt-3 border-t border-border/50">
        {prevPost ? (
          <Link
            href={`/dev-notes/${prevPost.slug}`}
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Previous</p>
              <p className="text-sm font-medium truncate">{prevPost.title}</p>
            </div>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {nextPost ? (
          <Link
            href={`/dev-notes/${nextPost.slug}`}
            className="flex-1 flex items-center justify-end gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/80 transition-colors group text-right"
          >
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Next</p>
              <p className="text-sm font-medium truncate">{nextPost.title}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </Card>
  );
}
