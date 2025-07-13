
"use client";

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { FaqItem } from '@/lib/data';

export function FaqClient({ faqs }: { faqs: FaqItem[] }) {
  const { translations } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAll = () => {
    if (openItems.length === filteredFaqs.length) {
      setOpenItems([]);
    } else {
      setOpenItems(filteredFaqs.map(faq => String(faq.id)));
    }
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-muted/20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{translations.faq.title}</h2>
          <p className="text-lg text-foreground/70 mt-2">{translations.faq.subtitle}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>
            <Button onClick={toggleAll} variant="outline" className="w-full sm:w-auto">
                {openItems.length === filteredFaqs.length ? 'Collapse All' : 'Expand All'}
            </Button>
        </div>

        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="w-full">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <AccordionItem 
                value={String(faq.id)} 
                key={faq.id}
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <AccordionTrigger className="text-lg font-headline hover:no-underline text-left">
                    {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-foreground/80 prose prose-invert max-w-none prose-a:text-primary hover:prose-a:text-primary/80">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{faq.answer}</ReactMarkdown>
                </AccordionContent>
              </AccordionItem>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-10">
                <p>No questions match your search.</p>
            </div>
          )}
        </Accordion>
      </div>
    </section>
  )
}
