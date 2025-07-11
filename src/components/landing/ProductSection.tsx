
"use server";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import type { ProductSectionData, ProductComponent } from '@/lib/data';
import { ProductIcon } from '@/components/ProductIcon';

export function ProductSection({ data }: { data: ProductSectionData }) {
  
  return (
    <section id="product" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{data.title}</h2>
          <p className="text-lg text-foreground/70 mt-2">{data.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.components.map((component: ProductComponent, index: number) => (
              <Card 
                key={component.id} 
                className="bg-card border-border/50 overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-primary/20 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <ProductIcon name={component.icon} className="w-10 h-10 text-primary" />
                  <CardTitle className="font-headline text-xl">{component.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative h-48 w-full">
                      <Image src={component.imageUrl} alt={component.title} layout="fill" objectFit="cover" data-ai-hint={component.imageHint} />
                  </div>
                  <p className="p-4 text-foreground/80">{component.description}</p>
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
