
'use client';

import type { Language, Scenario } from '@/lib/data';
import { translations } from '@/lib/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coffee, Thermometer, Zap, Home, Sparkles } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { FC } from 'react';

const icons: Record<string, FC<LucideProps>> = {
  Coffee,
  Thermometer,
  Zap,
  Home,
  Sparkles,
};

const ScenarioIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = icons[name] || Sparkles;
  return <IconComponent className={className} />;
};


export function WhySpekulusSection({ data, lang, }: { data: Scenario[]; lang: Language; }) {
  const t = translations[lang].scenarios;

  return (
    <section id="why-spekulus" className="py-16 md:py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.title}</h2>
          <p className="text-lg text-foreground/70 mt-2">{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.map((scenario, index) => (
            <div
              key={scenario.id ?? `scenario-${index}`}
              className="opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Card className="bg-card border-border/50 h-full shadow-lg hover:shadow-primary/20 p-6 flex flex-col items-start text-left hover:-translate-y-2 transition-transform duration-300">
                <div className="mb-4 rounded-lg bg-primary/10 p-3 inline-block">
                  <ScenarioIcon name={scenario.icon} className="w-8 h-8 text-primary" />
                </div>
                <CardHeader className="p-0">
                  <CardTitle className="font-headline text-lg text-primary">{scenario.question}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-2">
                  <p className="text-foreground/80">{scenario.answer}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
