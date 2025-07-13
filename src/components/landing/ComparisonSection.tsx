
'use client';

import type { Language, CompetitorFeature, ComparisonSectionData } from '@/lib/data';
import { translations } from '@/lib/translations';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Checkmark = ({ checked }: { checked: boolean }) => {
  if (checked) {
    return <Check className="text-green-500 mx-auto h-5 w-5" />;
  }
  return <X className="text-destructive mx-auto opacity-70 h-5 w-5" />;
};

export function ComparisonSection({ sectionData, featuresData, lang }: { sectionData: ComparisonSectionData | null, featuresData: CompetitorFeature[]; lang: Language }) {
  const t = translations[lang].comparison;

  return (
    <section id="comparison" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{sectionData?.title || t.title}</h2>
          <p className="text-lg text-foreground/70 mt-2">{sectionData?.subtitle || t.subtitle}</p>
        </div>
        <Card className="border-border/50 shadow-lg opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-[35%] md:w-[40%] font-bold text-lg p-4">{t.feature}</TableHead>
                    <TableHead className="text-center font-bold text-lg text-primary p-4">{t.spekulus}</TableHead>
                    <TableHead className="text-center font-semibold text-lg p-4">{t.himirror}</TableHead>
                    <TableHead className="text-center font-semibold text-lg p-4">{t.simplehuman}</TableHead>
                    <TableHead className="text-center font-semibold text-lg p-4">{t.mirrocool}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featuresData.map((item, index) => (
                    <TableRow key={index} className="[&_td]:py-4 [&_td]:px-4 odd:bg-muted/20">
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
