
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Frown } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] text-center px-4">
      <Frown className="w-24 h-24 text-primary mb-6" strokeWidth={1.5} />
      <h1 className="text-5xl md:text-7xl font-bold font-headline text-primary">
        404
      </h1>
      <h2 className="text-2xl md:text-3xl font-semibold font-headline mt-4 mb-2">
        Oops! Page Not Found.
      </h2>
      <p className="text-lg text-foreground/70 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link href="/">
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
          Back to Homepage
        </Button>
      </Link>
    </div>
  );
}

    