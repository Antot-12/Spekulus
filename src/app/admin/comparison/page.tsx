
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { CompetitorFeature, Language } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Save, Loader2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { logAction } from '@/lib/logger';
import { getCompetitorFeatures, updateCompetitorFeatures } from '@/lib/db/actions';
import { initialData } from '@/lib/data';

type AllFeaturesData = Record<Language, CompetitorFeature[]>;

const LanguageFlag = ({ lang }: { lang: Language }) => {
    const flags: Record<string, string> = { en: '🇬🇧', uk: '🇺🇦', sk: '🇸🇰' };
    return <span className="mr-2 text-base" role="img" aria-label={`${lang} flag`}>{flags[lang]}</span>;
};

const languageNames: Record<Language, string> = { en: 'English', uk: 'Ukrainian', sk: 'Slovak' };
const competitors = ['spekulus', 'himirror', 'simplehuman', 'mirrocool'] as const;

export default function ComparisonAdminPage() {
    const { toast } = useToast();
    const [allData, setAllData] = useState<AllFeaturesData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedLang, setSelectedLang] = useState<Language>('en');

    const features = allData?.[selectedLang] ?? [];

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const languages: Language[] = ['en', 'uk', 'sk'];
        const promises = languages.map(lang => getCompetitorFeatures(lang));
        const results = await Promise.all(promises);
        
        const newAllData = languages.reduce((acc, lang, index) => {
            const resultData = results[index];
            if (resultData && resultData.length > 0) acc[lang] = resultData;
            else acc[lang] = initialData.competitorFeaturesData[lang];
            return acc;
        }, {} as AllFeaturesData);

        setAllData(newAllData);
        setIsLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async () => {
        if (!allData) return;
        setIsSaving(true);
        try {
            await updateCompetitorFeatures(selectedLang, allData[selectedLang]);
            toast({ title: "Saved!", description: `Comparison table for ${languageNames[selectedLang]} has been saved.`});
            logAction('Comparison Update', 'Success', `Saved comparison table for ${languageNames[selectedLang]}.`);
        } catch (error) {
             toast({ title: "Save Failed", description: "Could not save changes.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const updateState = (newFeatures: CompetitorFeature[]) => {
        setAllData(prev => prev ? { ...prev, [selectedLang]: newFeatures } : null);
    };

    const handleFeatureTextChange = (id: number, value: string) => {
        const updated = features.map(item =>
            item.id === id ? { ...item, feature: value } : item
        );
        updateState(updated);
    };

    const handleToggle = (id: number, competitor: typeof competitors[number]) => {
        const updated = features.map(item =>
            item.id === id ? { ...item, [competitor]: !item[competitor] } : item
        );
        updateState(updated);
    }

    const handleFeatureAdd = () => {
        const newFeature: CompetitorFeature = { 
            id: Date.now(),
            feature: 'New Awesome Feature',
            spekulus: true,
            himirror: false,
            simplehuman: false,
            mirrocool: false,
        };
        updateState([...features, newFeature]);
        toast({ title: "Feature Added", description: "Remember to save your changes." });
    };
    
    const handleFeatureDelete = (id: number) => {
        const itemToDelete = features.find(item => item.id === id);
        updateState(features.filter(item => item.id !== id));
        toast({ title: "Feature Deleted", variant: 'destructive', description: "Remember to save changes."});
        logAction('Comparison Update', 'Success', `Deleted feature "${itemToDelete?.feature}" for ${languageNames[selectedLang]}.`);
    };

    return (
        <Card className="opacity-0 animate-fade-in-up">
          <CardHeader>
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <CardTitle>Manage Comparison Table</CardTitle>
                    <CardDescription>Edit the features for the competitor comparison table.</CardDescription>
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
                    <Button onClick={handleFeatureAdd}><PlusCircle className="mr-2 h-4 w-4"/> Add Feature</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                        Save Changes
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-md overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[200px]">Feature</TableHead>
                            {competitors.map(c => <TableHead key={c} className="text-center capitalize">{c}</TableHead>)}
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            [...Array(3)].map((_, i) => (
                                <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                            ))
                        ) : (
                            features.map((feature) => (
                                <TableRow key={feature.id}>
                                    <TableCell>
                                        <Input value={feature.feature} onChange={(e) => handleFeatureTextChange(feature.id, e.target.value)} />
                                    </TableCell>
                                    {competitors.map(c => (
                                        <TableCell key={c} className="text-center">
                                            <Switch checked={!!feature[c]} onCheckedChange={() => handleToggle(feature.id, c)} aria-label={`${c} switch`} />
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right">
                                        <Button variant="destructive" size="icon" onClick={() => handleFeatureDelete(feature.id)}><Trash2 className="w-4 h-4"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
    );
}
