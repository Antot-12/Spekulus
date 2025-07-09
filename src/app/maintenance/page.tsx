
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] text-center px-4">
      <Wrench className="w-24 h-24 text-primary mb-6 animate-spin [animation-duration:3s]" strokeWidth={1.5} />
      <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
        We&rsquo;ll Be Back Soon
      </h1>
      <p className="text-lg text-foreground/70 mb-8 max-w-md">
        We&rsquo;re currently performing scheduled maintenance to improve your experience. Thank you for your patience!
      </p>
      
      <div className="text-center text-foreground/60 mb-8">
        <p>Need help? Contact us at <a href="mailto:spekulus.mirror@gmail.com" className="text-primary hover:underline">spekulus.mirror@gmail.com</a></p>
      </div>

      <Link href="/">
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
          Return to Homepage
        </Button>
      </Link>
    </div>
  );
}

    