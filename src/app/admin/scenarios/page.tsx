
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Scenario, Language } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Save, Loader2, Sparkles, Coffee, Thermometer, Zap, Home, MessageSquareQuote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getScenarios, updateScenarios, createScenario } from '@/lib/db/actions';
import { initialData } from '@/lib/data';
import type { LucideProps } from 'lucide-react';
import type { FC } from 'react';

const icons: Record<string, FC<LucideProps>> = { Coffee, Thermometer, Zap, Home, Sparkles };
const ScenarioIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = icons[name] || Sparkles;
  return <IconComponent className={className} />;
};


type AllScenariosData = Record<Language, Scenario[]>;

const LanguageFlag = ({ lang }: { lang: Language }) => {
    const flags: Record<string, string> = { en: '🇬🇧', uk: '🇺🇦', sk: '🇸🇰' };
    return <span className="mr-2 text-base" role="img" aria-label={`${lang} flag`}>{flags[lang]}</span>;
};

const languageNames: Record<Language, string> = { en: 'English', uk: 'Ukrainian', sk: 'Slovak' };

export default function ScenariosAdminPage() {
    const { toast } = useToast();
    const [allData, setAllData] = useState<AllScenariosData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedLang, setSelectedLang] = useState<Language>('en');
    const [actor, setActor] = useState('admin');

    useEffect(() => {
        const adminUser = localStorage.getItem('admin_user') || 'admin';
        setActor(adminUser);
    }, []);

    const scenarios = allData?.[selectedLang] ?? [];

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const languages: Language[] = ['en', 'uk', 'sk'];
        const promises = languages.map(lang => getScenarios(lang));
        const results = await Promise.all(promises);
        
        const newAllData = languages.reduce((acc, lang, index) => {
            const resultData = results[index];
            if (resultData && resultData.length > 0) acc[lang] = resultData;
            else acc[lang] = initialData.scenariosData[lang];
            return acc;
        }, {} as AllScenariosData);

        setAllData(newAllData);
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async () => {
        if (!allData) return;
        setIsSaving(true);
        try {
            await updateScenarios(selectedLang, allData[selectedLang], actor);
            toast({ title: "Saved!", description: `All scenario changes for ${languageNames[selectedLang]} have been saved.`});
        } catch (error) {
             toast({ title: "Save Failed", description: "Could not save changes.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const updateState = (newScenarios: Scenario[]) => {
        setAllData(prev => prev ? { ...prev, [selectedLang]: newScenarios } : null);
    };

    const handleScenarioChange = (id: number, field: keyof Omit<Scenario, 'id'>, value: string) => {
        const updatedItems = scenarios.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        updateState(updatedItems);
    };

    const handleScenarioAdd = async () => {
        const newScenarioData = { 
            question: 'New Scenario Question?', 
            answer: 'A helpful answer from Spekulus.',
            icon: 'Sparkles'
        };
        try {
            const newScenario = await createScenario(selectedLang, newScenarioData, actor);
            if (newScenario) {
                updateState([...scenarios, newScenario]);
                toast({ title: "Scenario Added", description: "A new scenario has been added. Remember to save." });
            } else {
                 toast({ title: "Add Failed", description: "Could not add scenario.", variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: "Add Failed", description: "Could not add scenario.", variant: 'destructive' });
        }
    };
    
    const handleScenarioDelete = (id: number) => {
        updateState(scenarios.filter(item => item.id !== id));
        toast({ title: "Scenario Deleted", variant: 'destructive', description: "Remember to save changes."});
    };

    return (
        <Card className="opacity-0 animate-fade-in-up">
          <CardHeader>
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <CardTitle className="flex items-center gap-2"><MessageSquareQuote /> Manage Scenarios</CardTitle>
                    <CardDescription>Edit the "Why Spekulus?" scenarios displayed on the homepage.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Select value={selectedLang} onValueChange={(value) => setSelectedLang(value as Language)}>
                        <SelectTrigger className="w-[150px]"><SelectValue><LanguageFlag lang={selectedLang} />{languageNames[selectedLang]}</SelectValue></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="en"><LanguageFlag lang="en" /> {languageNames['en']}</SelectItem>
                           <SelectItem value="uk"><LanguageFlag lang="uk" /> {languageNames['uk']}</SelectItem>
                           <SelectItem value="sk"><LanguageFlag lang="sk" /> {languageNames['sk']}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleScenarioAdd}><PlusCircle className="mr-2 h-4 w-4"/> Add Scenario</Button>
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
                        <div key={i} className="space-y-2 p-4 border rounded-md"><Skeleton className="h-24 w-full" /></div>
                    ))}
                </div>
            ) : (
                scenarios.map((scenario) => (
                  <div key={scenario.id} className="space-y-4 p-4 border rounded-md relative">
                    <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <ScenarioIcon name={scenario.icon} className="w-6 h-6 text-primary" />
                            </div>
                            <Input value={scenario.icon} onChange={(e) => handleScenarioChange(scenario.id, 'icon', e.target.value)} placeholder="Icon" className="w-28 text-center text-xs" />
                        </div>
                        <div className="flex-grow space-y-2">
                             <Input placeholder="Question" value={scenario.question} onChange={(e) => handleScenarioChange(scenario.id, 'question', e.target.value)} className="font-bold text-lg"/>
                             <Textarea placeholder="Answer" value={scenario.answer} onChange={(e) => handleScenarioChange(scenario.id, 'answer', e.target.value)} rows={2} />
                        </div>
                         <Button variant="destructive" size="icon" onClick={() => handleScenarioDelete(scenario.id)} className="shrink-0">
                            <Trash2 className="h-4 w-4"/><span className="sr-only">Delete</span>
                        </Button>
                    </div>
                  </div>
                ))
            )}
            <div className="text-sm text-muted-foreground p-4 border-dashed border-2 rounded-md">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4"/>Icon Tip</h4>
                <p>Enter the name of a `lucide-react` icon (e.g., `Coffee`, `Thermometer`, `Zap`, `Home`). The icon preview will update automatically. Case matters!</p>
            </div>
          </CardContent>
        </Card>
    );
}
