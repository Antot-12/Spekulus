
"use client";

import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqData } from "@/lib/data";
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

type FaqItem = {
    id: string;
    question: string;
    answer: string;
};

const LOCAL_STORAGE_KEY_PREFIX = 'spekulus-faqs-';

export function FaqSection() {
  const { language, translations } = useLanguage();
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  useEffect(() => {
    const loadFaqs = () => {
        setIsLoaded(false);
        try {
            const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${language}`;
            const storedFaqs = localStorage.getItem(localStorageKey);
            
            const dataToSet = storedFaqs ? JSON.parse(storedFaqs) : faqData[language] || faqData.en;

            if (dataToSet.length > 0) {
                setFaqs(dataToSet);
            } else {
                setFaqs(faqData[language] || faqData.en);
            }
        } catch (error) {
            console.error(`Failed to load FAQs for language: ${language}`, error);
            setFaqs(faqData[language] || faqData.en);
        }
        setIsLoaded(true);
    }

    loadFaqs();
    
    window.addEventListener('storage', loadFaqs);
    window.addEventListener('focus', loadFaqs);
    
    return () => {
        window.removeEventListener('storage', loadFaqs);
        window.removeEventListener('focus', loadFaqs);
    };

  }, [language]);
  
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAll = () => {
    if (openItems.length === filteredFaqs.length) {
      setOpenItems([]);
    } else {
      setOpenItems(filteredFaqs.map(faq => faq.id));
    }
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-background">
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
          {!isLoaded ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2 py-4 border-b">
                  <Skeleton className="h-6 w-3/4" />
                </div>
              ))
          ) : filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <AccordionItem 
                value={faq.id} 
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
