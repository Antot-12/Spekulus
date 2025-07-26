// src/components/landing/AdvantagesSection.tsx
'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { Advantage, Language } from '@/lib/data';
import { AdvantageIcon } from '@/components/AdvantageIcon';
import { translations } from '@/lib/translations';

export function AdvantagesSection({
  data,
  lang,
}: {
  data: Advantage[];
  lang: Language;
}) {
  const t = translations[lang].advantages;

  return (
    <section id="advantages" className="py-16 md:py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">
            {t.title}
          </h2>
          <p className="text-lg text-foreground/70 mt-2">
            {t.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.map((advantage, index) => (
            <div
              key={advantage.id ?? `adv-${index}`}
              className="opacity-0 animate-fade-in-up transform transition-transform duration-300 hover:-translate-y-2"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Card className="bg-card border-border/50 h-full shadow-lg hover:shadow-primary/20 p-6 flex flex-col items-start text-left">
                <div className="mb-4 rounded-lg bg-primary/10 p-3 inline-block">
                  <AdvantageIcon
                    name={advantage.icon}
                    className="w-8 h-8 text-primary"
                  />
                </div>
                <CardHeader className="p-0">
                  <CardTitle className="font-headline text-xl">
                    {advantage.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-2">
                  <p className="text-foreground/80">{advantage.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
