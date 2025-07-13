
"use client";

import { useEffect, useState } from 'react';
import { Wrench } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type MaintenancePageProps = {
  message?: string | null;
  endsAt?: Date | null;
}

export default function MaintenancePage({ message, endsAt }: MaintenancePageProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (endsAt) {
      const updateTimer = () => {
        const now = new Date();
        const endsAtDate = new Date(endsAt);
        if (now > endsAtDate) {
           setTimeLeft("should be back online now.");
           clearInterval(interval);
           // Optionally trigger a page refresh
           setTimeout(() => window.location.reload(), 2000);
        } else {
           const distance = formatDistanceToNow(endsAtDate, { addSuffix: true });
           setTimeLeft(`back online ${distance}.`);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [endsAt]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 bg-background text-foreground">
      <Wrench className="w-24 h-24 text-primary mb-6 animate-spin [animation-duration:3s]" strokeWidth={1.5} />
      <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
        We’ll Be Back Soon
      </h1>
      <p className="text-lg text-foreground/70 mb-8 max-w-md">
        {message || "We’re currently performing scheduled maintenance to improve your experience. Thank you for your patience!"}
      </p>
      
      {timeLeft && (
        <p className="text-primary font-semibold mb-8">
          Expected to be {timeLeft}
        </p>
      )}

      <div className="text-center text-foreground/60">
        <p>Need help? Contact us at <a href="mailto:spekulus.mirror@gmail.com" className="text-primary hover:underline">spekulus.mirror@gmail.com</a></p>
      </div>
    </div>
  );
}
