
"use client";

import { useState, useEffect } from 'react';
import { advantagesData, type Advantage, type Language } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Save, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvantageIcon } from '@/components/AdvantageIcon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logAction } from '@/lib/logger';

const LOCAL_STORAGE_KEY_PREFIX = 'spekulus-advantages-';

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
    const [advantages, setAdvantages] = useState<Advantage[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedLang, setSelectedLang] = useState<Language>('en');

    useEffect(() => {
        setIsLoaded(false);
        const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${selectedLang}`;
        try {
            const storedData = localStorage.getItem(localStorageKey);
            if (storedData) {
                setAdvantages(JSON.parse(storedData));
            } else {
                setAdvantages(advantagesData[selectedLang]);
            }
        } catch (error) {
            console.error("Failed to load advantages from localStorage", error);
            setAdvantages(advantagesData[selectedLang]);
        }
        setIsLoaded(true);
    }, [selectedLang]);

    const persistChanges = (newData: Advantage[]) => {
        const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${selectedLang}`;
        try {
            localStorage.setItem(localStorageKey, JSON.stringify(newData));
            setAdvantages(newData);
        } catch (error) {
            console.error("Failed to save advantages to localStorage", error);
            toast({ title: "Save Failed", description: "Could not save changes.", variant: 'destructive' });
        }
    };

    const handleSave = () => {
        persistChanges(advantages);
        toast({ title: "Saved!", description: `All advantage changes for ${languageNames[selectedLang]} have been saved.`});
        logAction('Advantages Update', 'Success', `Saved all changes for ${languageNames[selectedLang]} advantages.`);
    };

    const handleAdvantageChange = (id: number, field: keyof Advantage, value: string) => {
        const updatedAdvantages = advantages.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        setAdvantages(updatedAdvantages);
    };

    const handleAdvantageAdd = () => {
        const newAdvantage: Advantage = { 
            id: Date.now(), 
            title: 'New Advantage', 
            description: 'A brief description of this new advantage.',
            icon: 'Sparkles'
        };
        const newAdvantages = [...advantages, newAdvantage];
        persistChanges(newAdvantages);
        toast({ title: "Advantage Added", description: "A new advantage has been added." });
        logAction('Advantages Update', 'Success', `Added new advantage for ${languageNames[selectedLang]}.`);
    };
    
    const handleAdvantageDelete = (id: number) => {
        const itemToDelete = advantages.find(item => item.id === id);
        const newAdvantages = advantages.filter(item => item.id !== id);
        persistChanges(newAdvantages);
        toast({ title: "Advantage Deleted", variant: 'destructive'});
        logAction('Advantages Update', 'Success', `Deleted advantage "${itemToDelete?.title}" for ${languageNames[selectedLang]}.`);
    };

    return (
        <Card className="opacity-0 animate-fade-in-up">
          <CardHeader>
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <CardTitle>Manage Advantages</CardTitle>
                    <CardDescription>Edit the key advantages displayed on the homepage. Changes are saved to your browser.</CardDescription>
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
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Save Changes</Button>
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
