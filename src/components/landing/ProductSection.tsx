
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { productSectionData, type ProductSectionData, type ProductComponent } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductIcon } from '@/components/ProductIcon';
import { useLanguage } from '@/contexts/LanguageContext';

export function ProductSection() {
  const { language } = useLanguage();
  const [data, setData] = useState<ProductSectionData>(productSectionData.en);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const LOCAL_STORAGE_KEY = `spekulus-product-section-${language}`;
    const loadData = () => {
      try {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData && parsedData.components && parsedData.components.length > 0) {
            setData(parsedData);
          } else {
            setData(productSectionData[language]);
          }
        } else {
          setData(productSectionData[language]);
        }
      } catch (error) {
        console.error("Failed to load product section data from localStorage", error);
        setData(productSectionData[language]);
      }
      setIsLoaded(true);
    };

    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('focus', loadData);

    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('focus', loadData);
    };
  }, [language]);

  return (
    <section id="product" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{isLoaded ? data.title : <Skeleton className="h-10 w-3/4 mx-auto" />}</h2>
          {isLoaded ? (
            <p className="text-lg text-foreground/70 mt-2">{data.subtitle}</p>
          ) : (
            <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(!isLoaded ? Array(4).fill(0) : data.components).map((component: ProductComponent, index: number) => (
            !isLoaded ? (
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
            ) : (
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
            )
          ))}
        </div>
      </div>
    </section>
  );
}
