
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { FaqItem, Language } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { logAction } from '@/lib/logger';
import { getFaqs, updateFaqs, createFaq } from '@/lib/db/actions';

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
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedLang, setSelectedLang] = useState<Language>('en');

    const fetchFaqs = useCallback(async (lang: Language) => {
        setIsLoading(true);
        try {
            const data = await getFaqs(lang);
            setFaqs(data || []);
        } catch (error) {
            toast({ title: "Network Error", description: "Failed to connect to the server.", variant: 'destructive' });
        }
        setIsLoading(false);
    }, [toast]);
    
    useEffect(() => {
        fetchFaqs(selectedLang);
    }, [selectedLang, fetchFaqs]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateFaqs(selectedLang, faqs);
            toast({ title: "Saved!", description: `All FAQ changes for ${languageNames[selectedLang]} have been saved.` });
            logAction('FAQ Update', 'Success', `Saved all changes for ${languageNames[selectedLang]} FAQs.`);
        } catch (error) {
            toast({ title: "Save Failed", description: "Could not save changes.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFaqChange = (id: number, field: 'question' | 'answer', value: string) => {
        const updatedFaqs = faqs.map(faq => 
            faq.id === id ? { ...faq, [field]: value } : faq
        );
        setFaqs(updatedFaqs);
    };

    const handleFaqAdd = async () => {
        const newFaqData = {question: 'New Question?', answer: 'New Answer.'};
        try {
            const newFaq = await createFaq(selectedLang, newFaqData);
            if(newFaq){
                setFaqs(prev => [...prev, newFaq]);
                toast({ title: "FAQ Added", description: "A new FAQ has been added. Remember to save your changes." });
            } else {
                toast({ title: "Add Failed", description: "Could not add FAQ.", variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: "Add Failed", description: "Could not add FAQ.", variant: 'destructive' });
        }
    };
    
    const handleFaqDelete = (idToDelete: number) => {
        const faqToDelete = faqs.find(faq => faq.id === idToDelete);
        setFaqs(prev => prev.filter(faq => faq.id !== idToDelete));
        toast({ title: "FAQ Deleted", variant: 'destructive', description: "Remember to save your changes."});
    };

    return (
        <Card className="opacity-0 animate-fade-in-up">
          <CardHeader>
             <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <CardTitle>Manage FAQ</CardTitle>
                    <CardDescription>Edit questions and answers for each language. Changes are saved to Cloudinary.</CardDescription>
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
                            <SelectItem value="en"><LanguageFlag lang="en" />{languageNames['en']}</SelectItem>
                            <SelectItem value="uk"><LanguageFlag lang="uk" />{languageNames['uk']}</SelectItem>
                            <SelectItem value="sk"><LanguageFlag lang="sk" />{languageNames['sk']}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleFaqAdd}><PlusCircle className="mr-2 h-4 w-4"/> Add</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                        Save
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2 p-4 border rounded-md">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-16 w-full" />
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
