
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { productSectionData as defaultData, type ProductSectionData, type ProductComponent, type Language } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductIcon } from '@/components/ProductIcon';
import { useLanguage } from '@/contexts/LanguageContext';

export function ProductSection() {
  const { language } = useLanguage();
  const [data, setData] = useState<ProductSectionData>(defaultData.en);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async (lang: Language) => {
    setIsLoading(true);
    try {
        const response = await fetch(`/api/content?lang=${lang}&section=product-section`);
        const result = await response.json();
        if (result.success && result.content) {
            setData(result.content);
        } else {
            setData(defaultData[lang]);
        }
    } catch (error) {
        console.error("Failed to load product section data, using default.", error);
        setData(defaultData[lang]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData(language);
  }, [language, fetchData]);

  return (
    <section id="product" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{isLoading ? <Skeleton className="h-10 w-3/4 mx-auto" /> : data.title}</h2>
          {isLoading ? (
            <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
          ) : (
            <p className="text-lg text-foreground/70 mt-2">{data.subtitle}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(!isLoading ? data.components : Array(4).fill(0)).map((component: ProductComponent, index: number) => (
            !isLoading ? (
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
            ) : (
              <Card key={index} className="bg-card border-border/50 overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="p-0">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      </div>
    </section>
  );
}
