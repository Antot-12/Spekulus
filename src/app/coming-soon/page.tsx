"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-4xl md:text-6xl font-bold font-mono tracking-tighter text-primary">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-sm md:text-base font-medium text-foreground/70 uppercase tracking-widest">{label}</span>
  </div>
);

export default function ComingSoonPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Set target date to Dec 16, 2024 (Implementation Start from roadmap)
    const targetDate = new Date("2024-12-16T00:00:00");

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] text-center px-4">
      <Construction className="w-24 h-24 text-primary mb-6 animate-bounce" strokeWidth={1.5} />
      <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
        We’re launching soon!
      </h1>
      <p className="text-lg text-foreground/70 mb-8 max-w-md">
        Stay tuned for something amazing. Our next big milestone is just around the corner:
      </p>

      {isClient && (
        <div className="flex items-center justify-center gap-4 md:gap-8 mb-10">
          <CountdownUnit value={timeLeft.days} label="Days" />
          <span className="text-4xl md:text-6xl font-bold text-primary/50">:</span>
          <CountdownUnit value={timeLeft.hours} label="Hours" />
          <span className="text-4xl md:text-6xl font-bold text-primary/50">:</span>
          <CountdownUnit value={timeLeft.minutes} label="Minutes" />
          <span className="text-4xl md:text-6xl font-bold text-primary/50">:</span>
          <CountdownUnit value={timeLeft.seconds} label="Seconds" />
        </div>
      )}

      <Link href="/">
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
          Return to Homepage
        </Button>
      </Link>
    </div>
  );
}
