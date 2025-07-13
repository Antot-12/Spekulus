
'use client';
import { Button } from '@/components/ui/button';
import type { PartnerSectionData } from '@/lib/data';
import { ArrowRight, Handshake, Expand } from 'lucide-react';
import NextImage from 'next/image';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function PartnerSection({ data }: { data: PartnerSectionData | null }) {
  if (!data) return null;

  return (
    <section id="partner" className="py-16 md:py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-4 text-primary">
                <Handshake className="w-8 h-8"/>
                <h2 className="text-3xl md:text-4xl font-bold font-headline">{data.title}</h2>
            </div>
            <p className="text-lg text-foreground/80 mb-6">{data.text}</p>
            {data.ctaUrl && (
              <Button asChild size="lg" className="text-lg font-semibold px-8 py-6 rounded-full shadow-lg transition-transform hover:scale-105">
                <a href={data.ctaUrl} target="_blank" rel="noopener noreferrer">
                  {data.ctaLabel} <ArrowRight className="ml-2" />
                </a>
              </Button>
            )}
          </div>
          <div className="relative aspect-square max-w-md mx-auto w-full opacity-0 animate-fade-in-up group" style={{ animationDelay: '400ms' }}>
            {data.imageId && (
               <Dialog>
                 <DialogTrigger asChild>
                    <div className="cursor-pointer overflow-hidden rounded-lg">
                      <NextImage
                        src={`/api/images/${data.imageId}`}
                        alt={data.title}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Expand className="w-10 h-10 text-white drop-shadow-lg" />
                      </div>
                    </div>
                 </DialogTrigger>
                 <DialogContent className="max-w-4xl p-2 bg-transparent border-none shadow-none">
                    <DialogHeader>
                        <DialogTitle className="sr-only">{data.title}</DialogTitle>
                    </DialogHeader>
                     <img src={`/api/images/${data.imageId}`} alt={data.title} className="max-h-[90vh] w-auto h-auto rounded-lg mx-auto" />
                 </DialogContent>
               </Dialog>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
