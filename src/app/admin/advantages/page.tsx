
"use client";

import { useState, useEffect, useCallback } from 'react';
import { type Advantage, type Language } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Save, Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvantageIcon } from '@/components/AdvantageIcon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logAction } from '@/lib/logger';
import { getAdvantagesData, updateAdvantagesData } from '@/lib/db/actions';
import { initialData } from '@/lib/data';

type AllAdvantagesData = Record<Language, Advantage[]>;

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

export default function AdvantagesAdminPage() {
    const { toast } = useToast();
    const [allData, setAllData] = useState<AllAdvantagesData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedLang, setSelectedLang] = useState<Language>('en');

    const advantages = allData?.[selectedLang] ?? [];

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const languages: Language[] = ['en', 'uk', 'sk'];
        const promises = languages.map(lang => getAdvantagesData(lang));
        const results = await Promise.all(promises);
        
        const newAllData = languages.reduce((acc, lang, index) => {
            const resultData = results[index];
            if (resultData && resultData.length > 0) {
                acc[lang] = resultData;
            } else {
                acc[lang] = initialData.advantagesData[lang];
            }
            return acc;
        }, {} as AllAdvantagesData);

        setAllData(newAllData);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async () => {
        if (!allData) return;
        setIsSaving(true);
        try {
            await updateAdvantagesData(selectedLang, allData[selectedLang]);
            toast({ title: "Saved!", description: `All advantage changes for ${languageNames[selectedLang]} have been saved.`});
            logAction('Advantages Update', 'Success', `Saved all changes for ${languageNames[selectedLang]} advantages.`);
        } catch (error) {
             toast({ title: "Save Failed", description: "Could not save changes.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const updateState = (newAdvantages: Advantage[]) => {
        setAllData(prev => prev ? { ...prev, [selectedLang]: newAdvantages } : null);
    };

    const handleAdvantageChange = (id: number, field: keyof Advantage, value: string) => {
        const updatedAdvantages = advantages.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        updateState(updatedAdvantages);
    };

    const handleAdvantageAdd = () => {
        const newAdvantage: Advantage = { 
            id: Date.now(), 
            title: 'New Advantage', 
            description: 'A brief description of this new advantage.',
            icon: 'Sparkles'
        };
        updateState([...advantages, newAdvantage]);
        toast({ title: "Advantage Added", description: "A new advantage has been added. Remember to save." });
    };
    
    const handleAdvantageDelete = (id: number) => {
        const itemToDelete = advantages.find(item => item.id === id);
        updateState(advantages.filter(item => item.id !== id));
        toast({ title: "Advantage Deleted", variant: 'destructive', description: "Remember to save changes."});
        logAction('Advantages Update', 'Success', `Deleted advantage "${itemToDelete?.title}" for ${languageNames[selectedLang]}.`);
    };

    return (
        <Card className="opacity-0 animate-fade-in-up">
          <CardHeader>
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <CardTitle>Manage Advantages</CardTitle>
                    <CardDescription>Edit the key advantages displayed on the homepage. Press Save to persist changes.</CardDescription>
                </div>
                <div className="flex gap-2">
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
                           <SelectItem value="en"><LanguageFlag lang="en" /> {languageNames['en']}</SelectItem>
                           <SelectItem value="uk"><LanguageFlag lang="uk" /> {languageNames['uk']}</SelectItem>
                           <SelectItem value="sk"><LanguageFlag lang="sk" /> {languageNames['sk']}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleAdvantageAdd}><PlusCircle className="mr-2 h-4 w-4"/> Add Advantage</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                        Save Changes
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
            ) : (
                advantages.map((advantage) => (
                  <div key={advantage.id} className="space-y-4 p-4 border rounded-md relative">
                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <AdvantageIcon name={advantage.icon} className="w-6 h-6 text-primary" />
                            </div>
                            <Input 
                                value={advantage.icon}
                                onChange={(e) => handleAdvantageChange(advantage.id, 'icon', e.target.value)}
                                placeholder="Icon Name"
                                className="w-28 text-center text-xs" />
                        </div>
                        <div className="flex-grow space-y-2">
                             <Input 
                                value={advantage.title}
                                onChange={(e) => handleAdvantageChange(advantage.id, 'title', e.target.value)}
                                className="font-bold text-lg"/>
                             <Textarea 
                                value={advantage.description} 
                                onChange={(e) => handleAdvantageChange(advantage.id, 'description', e.target.value)}
                                rows={3}
                            />
                        </div>
                         <Button variant="destructive" size="icon" onClick={() => handleAdvantageDelete(advantage.id)} className="shrink-0">
                            <Trash2 className="h-4 w-4"/>
                            <span className="sr-only">Delete</span>
                        </Button>
                    </div>
                  </div>
                ))
            )}
            <div className="text-sm text-muted-foreground p-4 border-dashed border-2 rounded-md">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4"/>Icon Tip</h4>
                <p>Enter the name of a `lucide-react` icon (e.g., `ScanFace`, `Home`, `Languages`, `GitMerge`, `Activity`). The icon preview will update automatically. Case matters!</p>
            </div>
          </CardContent>
        </Card>
    );
}
