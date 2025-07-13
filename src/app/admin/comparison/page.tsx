
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { CompetitorFeature, ComparisonSectionData, Language } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Save, Loader2, Swords } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { logAction } from '@/lib/logger';
import { getCompetitorFeatures, updateCompetitorFeatures, getComparisonSectionData, updateComparisonSectionData } from '@/lib/db/actions';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const LanguageFlag = ({ lang }: { lang: Language }) => {
    const flags: Record<string, string> = { en: '🇬🇧', uk: '🇺🇦', sk: '🇸🇰' };
    return <span className="mr-2 text-base" role="img" aria-label={`${lang} flag`}>{flags[lang]}</span>;
};

const languageNames: Record<Language, string> = { en: 'English', uk: 'Ukrainian', sk: 'Slovak' };
const competitors = ['spekulus', 'himirror', 'simplehuman', 'mirrocool'] as const;
const competitorLabels: Record<typeof competitors[number], string> = {
    spekulus: 'Spekulus',
    himirror: 'HiMirror',
    simplehuman: 'Simplehuman',
    mirrocool: 'MirroCool'
};


export default function ComparisonAdminPage() {
    const { toast } = useToast();
    const [features, setFeatures] = useState<CompetitorFeature[]>([]);
    const [sectionData, setSectionData] = useState<ComparisonSectionData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedLang, setSelectedLang] = useState<Language>('en');

    const fetchData = useCallback(async (lang: Language) => {
        setIsLoading(true);
        try {
            const [featuresData, sectionInfo] = await Promise.all([
                getCompetitorFeatures(lang),
                getComparisonSectionData(lang),
            ]);
            setFeatures(featuresData);
            setSectionData(sectionInfo);
        } catch (error) {
            toast({ title: "Fetch Error", description: "Could not load comparison data.", variant: "destructive" });
            setFeatures([]);
            setSectionData(null);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => { 
        fetchData(selectedLang);
    }, [selectedLang, fetchData]);

    const handleSave = async () => {
        if (!sectionData) return;
        setIsSaving(true);
        try {
            // Filter out new items with negative IDs before sending to DB
            const featuresToSave = features.map(({ id, ...rest }) => ({
                id: id > 0 ? id : undefined, // Omit temp negative IDs
                ...rest,
            }));

            await Promise.all([
                updateCompetitorFeatures(selectedLang, featuresToSave),
                updateComparisonSectionData(selectedLang, sectionData)
            ]);
            toast({ title: "Saved!", description: `Comparison table for ${languageNames[selectedLang]} has been saved.`});
            logAction('Comparison Update', 'Success', `Saved comparison table for ${languageNames[selectedLang]}.`);
            fetchData(selectedLang);
        } catch (error) {
             toast({ title: "Save Failed", description: "Could not save changes.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleFeatureTextChange = (id: number, value: string) => {
        const updated = features.map(item =>
            item.id === id ? { ...item, feature: value } : item
        );
        setFeatures(updated);
    };

    const handleToggle = (id: number, competitor: typeof competitors[number]) => {
        const updated = features.map(item =>
            item.id === id ? { ...item, [competitor]: !item[competitor] } : item
        );
        setFeatures(updated);
    }

    const handleFeatureAdd = () => {
        // Use a temporary negative ID for new items to avoid key conflicts
        const newFeature: CompetitorFeature = { 
            id: -Date.now(),
            feature: 'New Awesome Feature',
            spekulus: true,
            himirror: false,
            simplehuman: false,
            mirrocool: false,
        };
        setFeatures(prev => [...prev, newFeature]);
        toast({ title: "Feature Added", description: "Remember to save your changes." });
    };
    
    const handleFeatureDelete = (id: number) => {
        const itemToDelete = features.find(item => item.id === id);
        setFeatures(features.filter(item => item.id !== id));
        toast({ title: "Feature Removed", variant: 'destructive', description: "Remember to save changes to confirm deletion."});
        if (itemToDelete) {
          logAction('Comparison Update', 'Success', `Marked feature "${itemToDelete?.feature}" for deletion in ${languageNames[selectedLang]}.`);
        }
    };
    
    const handleSectionDataChange = (field: 'title' | 'subtitle', value: string) => {
        if (sectionData) {
            setSectionData({ ...sectionData, [field]: value });
        }
    };


    return (
        <Card className="opacity-0 animate-fade-in-up">
          <CardHeader>
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <CardTitle className="flex items-center gap-2"><Swords /> Manage Comparison Table</CardTitle>
                    <CardDescription>Edit the features and text for the competitor comparison table.</CardDescription>
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
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                        Save Changes
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading || !sectionData ? (
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            ) : (
                <>
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold">Section Text</h3>
                     <div className="space-y-2">
                        <Label htmlFor="sectionTitle">Title</Label>
                        <Input id="sectionTitle" value={sectionData.title} onChange={e => handleSectionDataChange('title', e.target.value)} />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="sectionSubtitle">Subtitle</Label>
                        <Input id="sectionSubtitle" value={sectionData.subtitle} onChange={e => handleSectionDataChange('subtitle', e.target.value)} />
                     </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Features</h3>
                        <Button onClick={handleFeatureAdd} size="sm"><PlusCircle className="mr-2 h-4 w-4"/> Add Feature</Button>
                    </div>
                    <div className="border rounded-md overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[200px]">Feature</TableHead>
                                    {competitors.map(c => <TableHead key={c} className="text-center capitalize">{competitorLabels[c]}</TableHead>)}
                                    <TableHead className="text-right w-[50px]">Delete</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {features.map((feature) => (
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
                                            <Button variant="ghost" size="icon" onClick={() => handleFeatureDelete(feature.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4"/></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                </>
            )}
          </CardContent>
        </Card>
    );
}
