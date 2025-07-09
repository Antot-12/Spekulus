"use client";

import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ScrollButtons() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 100;
      setIsAtBottom(isBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isClient]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    const footer = document.getElementById('page-footer');
    if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
        });
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2">
       <Button
        variant="outline"
        size="icon"
        onClick={scrollToBottom}
        className={cn(
          'rounded-full h-12 w-12 shadow-lg bg-card hover:bg-card/80 transition-all duration-300',
          isScrolled && !isAtBottom ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        )}
        aria-label="Scroll to bottom"
      >
        <ArrowDown className="h-6 w-6 text-primary" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={scrollToTop}
        className={cn(
          'rounded-full h-12 w-12 shadow-lg bg-card hover:bg-card/80 transition-all duration-300',
          isScrolled ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        )}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-6 w-6 text-primary" />
      </Button>
    </div>
  );
}
