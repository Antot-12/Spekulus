
"use client";

import { useState, useEffect } from 'react';
import { faqData } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Language } from '@/components/AppWrapper';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { logAction } from '@/lib/logger';

type FaqItem = {
    id: string;
    question: string;
    answer: string;
};

const LOCAL_STORAGE_KEY_PREFIX = 'spekulus-faqs-';

const LanguageFlag = ({ lang }: { lang: Language }) => {
    const flags: Record<string, string> = {
      en: '🇬🇧',
      uk: '🇺🇦',
      sk: '🇸🇰',
    };
    return <span className="mr-2 text-base" role="img" aria-label={`${lang} flag`}>{flags[lang]}</span>;
};

const languageNames: Record<Language, string> = {
    en: 'English',
    uk: 'Ukrainian',
    sk: 'Slovak'
};

export default function FaqAdminPage() {
    const { toast } = useToast();
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedLang, setSelectedLang] = useState<Language>('en');

    useEffect(() => {
        setIsLoaded(false);
        const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${selectedLang}`;
        try {
            const storedFaqs = localStorage.getItem(localStorageKey);
            if (storedFaqs) {
                const parsedFaqs = JSON.parse(storedFaqs);
                setFaqs(parsedFaqs);
            } else {
                setFaqs(faqData[selectedLang] || []);
            }
        } catch (error) {
            console.error(`Failed to load FAQs from localStorage for ${selectedLang}`, error);
            setFaqs(faqData[selectedLang] || []);
        }
        setIsLoaded(true);
    }, [selectedLang]);
    
    const persistChanges = (newFaqs: FaqItem[]) => {
        const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${selectedLang}`;
        try {
            localStorage.setItem(localStorageKey, JSON.stringify(newFaqs));
            setFaqs(newFaqs);
        } catch (error) {
            console.error(`Failed to save FAQs to localStorage for ${selectedLang}`, error);
            toast({ title: "Save Failed", description: "Could not save changes.", variant: 'destructive' });
        }
    }

    const handleSave = () => {
        persistChanges(faqs);
        toast({ title: "Saved!", description: `All FAQ changes for ${languageNames[selectedLang]} have been saved.`});
        logAction('FAQ Update', 'Success', `Saved all changes for ${languageNames[selectedLang]} FAQs.`);
    }

    const handleFaqChange = (id: string, field: 'question' | 'answer', value: string) => {
        const updatedFaqs = faqs.map(faq => 
            faq.id === id ? { ...faq, [field]: value } : faq
        );
        setFaqs(updatedFaqs);
    };

    const handleFaqAdd = () => {
        const newFaq: FaqItem = {id: `q${Date.now()}`, question: 'New Question?', answer: 'New Answer.'};
        const newFaqs = [...faqs, newFaq];
        persistChanges(newFaqs);
        toast({ title: "FAQ Added", description: "A new FAQ has been added and saved." });
        logAction('FAQ Update', 'Success', `Added new FAQ for ${languageNames[selectedLang]}.`);
    };
    
    const handleFaqDelete = (idToDelete: string) => {
        const faqToDelete = faqs.find(faq => faq.id === idToDelete);
        const newFaqs = faqs.filter(faq => faq.id !== idToDelete);
        persistChanges(newFaqs);
        toast({ title: "FAQ Deleted", variant: 'destructive'});
        logAction('FAQ Update', 'Success', `Deleted FAQ "${faqToDelete?.question}" for ${languageNames[selectedLang]}.`);
    }

    return (
        <Card className="opacity-0 animate-fade-in-up">
          <CardHeader>
             <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <CardTitle>Manage FAQ</CardTitle>
                    <CardDescription>Edit questions and answers for each language. Changes are saved to your browser.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={selectedLang} onValueChange={(value) => setSelectedLang(value as Language)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue>
                                <div className="flex items-center">
                                    <LanguageFlag lang={selectedLang} />
                                    {languageNames[selectedLang]}
                                </div>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">
                                <div className="flex items-center">
                                    <LanguageFlag lang="en" />
                                    {languageNames['en']}
                                </div>
                            </SelectItem>
                            <SelectItem value="uk">
                                <div className="flex items-center">
                                    <LanguageFlag lang="uk" />
                                    {languageNames['uk']}
                                </div>
                            </SelectItem>
                            <SelectItem value="sk">
                                <div className="flex items-center">
                                    <LanguageFlag lang="sk" />
                                    {languageNames['sk']}
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleFaqAdd}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button>
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Save</Button>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isLoaded ? (
                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2 p-4 border rounded-md">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-16 w-full" />
                            <div className="flex justify-end gap-2 pt-2">
                                <Skeleton className="h-10 w-10" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : faqs.length > 0 ? (
                faqs.map((faq) => (
                  <div key={faq.id} className="space-y-2 p-4 border rounded-md">
                     <Input 
                        value={faq.question}
                        onChange={(e) => handleFaqChange(faq.id, 'question', e.target.value)}
                        className="font-bold transition-colors focus:border-primary"/>
                    <MarkdownEditor
                        value={faq.answer}
                        onChange={(value) => handleFaqChange(faq.id, 'answer', value)}
                        rows={5}
                    />
                      <div className="flex justify-end gap-2 pt-2">
                        <Button variant="destructive" size="icon" onClick={() => handleFaqDelete(faq.id)}>
                            <Trash2 className="h-4 w-4"/>
                            <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                  </div>
                ))
            ) : (
                <div className="text-center text-muted-foreground py-10">
                    <p>No FAQs found for this language.</p>
                    <p>Click "Add" to create the first one.</p>
                </div>
            )}
          </CardContent>
        </Card>
    );
}
