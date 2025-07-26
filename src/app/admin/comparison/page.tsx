
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { CompetitorFeature, ComparisonSectionData, Language, Competitor } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Save, Loader2, Swords } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { getCompetitorFeatures, updateCompetitorFeatures, getComparisonSectionData, updateComparisonSectionData, getCompetitors, updateCompetitors } from '@/lib/db/actions';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { initialData } from '@/lib/data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const LanguageFlag = ({ lang }: { lang: Language }) => {
    const flags: Record<string, string> = { en: '🇬🇧', uk: '🇺🇦', sk: '🇸🇰' };
    return <span className="mr-2 text-base" role="img" aria-label={`${lang} flag`}>{flags[lang]}</span>;
};

const languageNames: Record<Language, string> = { en: 'English', uk: 'Ukrainian', sk: 'Slovak' };

const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function ComparisonAdminPage() {
    const { toast } = useToast();
    const [features, setFeatures] = useState<CompetitorFeature[]>([]);
    const [sectionData, setSectionData] = useState<ComparisonSectionData | null>(null);
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedLang, setSelectedLang] = useState<Language>('en');
    const [actor, setActor] = useState('admin');

    useEffect(() => {
        const adminUser = localStorage.getItem('admin_user') || 'admin';
        setActor(adminUser);
    }, []);

    const fetchData = useCallback(async (lang: Language) => {
        setIsLoading(true);
        try {
            const [featuresData, sectionInfo, competitorsData] = await Promise.all([
                getCompetitorFeatures(lang),
                getComparisonSectionData(lang),
                getCompetitors(),
            ]);
            setFeatures(featuresData.length > 0 ? featuresData : initialData.competitorFeaturesData[lang]);
            setSectionData(sectionInfo || initialData.comparisonSectionData[lang]);
            setCompetitors(competitorsData.length > 0 ? competitorsData : initialData.competitorsData);
        } catch (error) {
            toast({ title: "Fetch Error", description: "Could not load comparison data.", variant: "destructive" });
            setFeatures(initialData.competitorFeaturesData[lang]);
            setSectionData(initialData.comparisonSectionData[lang]);
            setCompetitors(initialData.competitorsData);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchData(selectedLang);
    }, [selectedLang, fetchData]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await Promise.all([
                updateCompetitorFeatures(selectedLang, features, actor),
                updateComparisonSectionData(selectedLang, sectionData!, actor),
                updateCompetitors(competitors, actor)
            ]);
            toast({ title: "Saved!", description: `Comparison table for ${languageNames[selectedLang]} has been saved.`});
            fetchData(selectedLang);
        } catch (error) {
             toast({ title: "Save Failed", description: "Could not save changes.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleCompetitorNameChange = (id: number, newName: string) => {
        setCompetitors(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
    };
    
    const handleAddCompetitor = () => {
        const newSlug = `new-competitor-${Date.now()}`;
        const newCompetitor: Competitor = {
            id: -Date.now(), // Negative ID for temp client-side key
            name: 'New Competitor',
            slug: newSlug,
            order: competitors.length
        };
        setCompetitors(prev => [...prev, newCompetitor]);
    };
    
    const handleDeleteCompetitor = (id: number) => {
        const competitorToDelete = competitors.find(c => c.id === id);
        if (!competitorToDelete) return;

        setCompetitors(prev => prev.filter(c => c.id !== id));
        // Remove from feature support
        setFeatures(prev => prev.map(f => {
            const newSupport = { ...f.feature_support };
            delete newSupport[competitorToDelete.slug];
            return { ...f, feature_support: newSupport };
        }));
    };

    const handleFeatureTextChange = (id: number, value: string) => {
        setFeatures(prev => prev.map(item =>
            item.id === id ? { ...item, feature: value } : item
        ));
    };

    const handleToggle = (featureId: number, competitorSlug: string) => {
        setFeatures(prev => prev.map(f => {
            if (f.id === featureId) {
                const support = f.feature_support[competitorSlug] || { supported: false };
                return {
                    ...f,
                    feature_support: {
                        ...f.feature_support,
                        [competitorSlug]: { ...support, supported: !support.supported }
                    }
                };
            }
            return f;
        }));
    }

    const handleFeatureAdd = () => {
        const newFeature: CompetitorFeature = { 
            id: -Date.now(),
            feature: 'New Awesome Feature',
            feature_support: competitors.reduce((acc, c) => ({ ...acc, [c.slug]: { supported: c.slug === 'spekulus' } }), {})
        };
        setFeatures(prev => [...prev, newFeature]);
        toast({ title: "Feature Added", description: "Remember to save your changes." });
    };
    
    const handleFeatureDelete = (id: number) => {
        setFeatures(prev => prev.filter(item => item.id !== id));
        toast({ title: "Feature Removed", variant: 'destructive', description: "Remember to save changes to confirm deletion."});
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
                    <CardDescription>Edit competitors, features, and text for the comparison table.</CardDescription>
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
                        Save All Changes
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {isLoading || !sectionData ? (
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full" />
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

                <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Competitors</h3>
                        <Button onClick={handleAddCompetitor} size="sm"><PlusCircle className="mr-2 h-4 w-4"/> Add Competitor</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {competitors.map(c => (
                            <div key={c.id} className="flex items-center gap-2 p-2 border rounded-md">
                                <Input value={c.name} onChange={e => handleCompetitorNameChange(c.id, e.target.value)} className="font-semibold"/>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4"/></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Delete {c.name}?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>This will remove the competitor and all their feature data. This action is irreversible. Remember to save your changes.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteCompetitor(c.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ))}
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
                                    {competitors.map(c => <TableHead key={c.id} className="text-center capitalize">{c.name}</TableHead>)}
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
                                            <TableCell key={c.id} className="text-center">
                                                <Switch checked={feature.feature_support[c.slug]?.supported ?? false} onCheckedChange={() => handleToggle(feature.id, c.slug)} aria-label={`${c.name} switch`} />
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
