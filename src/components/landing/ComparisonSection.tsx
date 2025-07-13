
'use client';

import type { Language, CompetitorFeature } from '@/lib/data';
import { translations } from '@/lib/translations';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Checkmark = ({ checked }: { checked: boolean }) => {
  if (checked) {
    return <Check className="text-green-500 mx-auto" />;
  }
  return <X className="text-destructive mx-auto opacity-50" />;
};

export function ComparisonSection({ data, lang }: { data: CompetitorFeature[]; lang: Language }) {
  const t = translations[lang].comparison;

  return (
    <section id="comparison" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{t.title}</h2>
          <p className="text-lg text-foreground/70 mt-2">{t.subtitle}</p>
        </div>
        <Card className="border-border/50 shadow-lg opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%] font-bold text-lg">{t.feature}</TableHead>
                    <TableHead className="text-center font-bold text-lg text-primary">{t.spekulus}</TableHead>
                    <TableHead className="text-center">{t.himirror}</TableHead>
                    <TableHead className="text-center">{t.simplehuman}</TableHead>
                    <TableHead className="text-center">{t.mirrocool}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index} className="[&_td]:py-4">
                      <TableCell className="font-medium">{item.feature}</TableCell>
                      <TableCell className="text-center"><Checkmark checked={item.spekulus} /></TableCell>
                      <TableCell className="text-center"><Checkmark checked={item.himirror} /></TableCell>
                      <TableCell className="text-center"><Checkmark checked={item.simplehuman} /></TableCell>
                      <TableCell className="text-center"><Checkmark checked={item.mirrocool} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
