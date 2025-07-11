
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { heroSectionData as defaultData, type HeroSectionData, type Language } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Upload, Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logAction } from '@/lib/logger';

const SECTION_KEY = 'hero';

type AllHeroData = Record<Language, HeroSectionData>;

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

export default function HeroSectionAdminPage() {
    const { toast } = useToast();
    const [allData, setAllData] = useState<AllHeroData | null>(null);
    const [data, setData] = useState<HeroSectionData>(defaultData.en);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedLang, setSelectedLang] = useState<Language>('en');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const fetchData = useCallback(async (lang: Language): Promise<HeroSectionData> => {
        try {
            const response = await fetch(`/api/content?lang=${lang}&section=${SECTION_KEY}`);
            const result = await response.json();
            if (result.success && result.content) {
                return result.content;
            }
            console.warn(`No content found for ${lang}/${SECTION_KEY}, using default data.`);
            return defaultData[lang];
        } catch (error) {
            console.error(`Failed to fetch hero data for ${lang}, falling back to default.`, error);
            return defaultData[lang];
        }
    }, []);

    useEffect(() => {
        const loadAllData = async () => {
            setIsLoading(true);
            const enData = await fetchData('en');
            const ukData = await fetchData('uk');
            const skData = await fetchData('sk');
            const newAllData = { en: enData, uk: ukData, sk: skData };
            setAllData(newAllData);
            setData(newAllData[selectedLang]);
            setIsLoading(false);
        };
        loadAllData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (allData) {
            setData(allData[selectedLang]);
        }
    }, [selectedLang, allData]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lang: selectedLang, section: SECTION_KEY, content: data }),
            });
            const result = await response.json();
            if (result.success) {
                toast({ title: "Saved!", description: `Changes to the Hero section for ${languageNames[selectedLang]} have been saved.`});
                logAction('Hero Update', 'Success', `Saved changes for ${languageNames[selectedLang]} hero section.`);
                const newContent = await fetchData(selectedLang);
                setAllData(prev => prev ? ({ ...prev, [selectedLang]: newContent }) : null);
                setData(newContent);
            } else {
                toast({ title: "Save Failed", description: result.error || "Could not save changes.", variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: "Save Failed", description: "An error occurred during save.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (field: keyof HeroSectionData, value: string | boolean) => {
        const updatedData = { ...data, [field]: value };
        setData(updatedData);
        if (allData) {
            setAllData({ ...allData, [selectedLang]: updatedData });
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('subdirectory', 'hero');
        
        toast({ title: "Uploading...", description: "Please wait while the image is uploaded." });

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                handleChange('imageUrl', result.url);
                toast({ title: "Image Uploaded", description: "Image has been updated. Remember to save your changes." });
                logAction('File Upload', 'Success', `Uploaded new hero image: ${result.url}`);
            } else {
                toast({ title: "Upload Failed", description: result.error || "Could not upload image.", variant: 'destructive' });
                logAction('File Upload', 'Failure', `Failed to upload hero image.`);
            }
        } catch (error: any) {
            console.error("Image upload error:", error);
            toast({ title: "Upload Failed", description: "An error occurred during upload.", variant: 'destructive' });
            logAction('File Upload', 'Failure', `Failed to upload hero image. Reason: ${error.message}`);
        } finally {
             if (event.target) {
                event.target.value = '';
            }
        }
    };

    const handleImageGenerate = async () => {
        if (!data.imageHint) {
            toast({ title: "Hint required", description: "Please provide an AI hint to generate an image.", variant: 'destructive' });
            return;
        }

        setIsGenerating(true);
        toast({ title: "Generating Image...", description: "The AI is creating an image based on your hint. This may take a moment." });

        try {
            const imageUrl = await generateImage(data.imageHint);
            handleChange('imageUrl', imageUrl);
            toast({ title: "Image Generated!", description: "The new image has been set. Remember to save changes." });
            logAction('File Upload', 'Success', `Generated hero image with hint: "${data.imageHint}"`);
        } catch (error: any) {
            console.error("Image generation error:", error);
            toast({ title: "Generation Failed", description: "The AI could not generate an image. Please try a different hint.", variant: 'destructive' });
            logAction('File Upload', 'Failure', `Failed to generate hero image with hint: "${data.imageHint}". Reason: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="opacity-0 animate-fade-in-up">
          <CardHeader>
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <CardTitle>Manage Hero Section</CardTitle>
                    <CardDescription>Edit the content for the main hero section on the homepage.</CardDescription>
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
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                        Save Changes
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading || !data ? (
                <div className="space-y-4 p-4">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={data.title} onChange={(e) => handleChange('title', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subtitle">Subtitle</Label>
                        <Textarea id="subtitle" value={data.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} rows={3}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">Background Image URL</Label>
                        <div className="flex gap-2">
                            <Input id="imageUrl" value={data.imageUrl} onChange={(e) => handleChange('imageUrl', e.target.value)} />
                            <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} aria-label="Upload image">
                                <Upload className="h-4 w-4" />
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="imageHint">Background Image AI Hint</Label>
                        <div className="flex gap-2">
                            <Input id="imageHint" value={data.imageHint} onChange={(e) => handleChange('imageHint', e.target.value)} />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleImageGenerate}
                                disabled={isGenerating}
                                aria-label="Generate image with AI"
                            >
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground pt-4">Note: The four features and the call-to-action button text are managed in the site's translation files (`src/lib/translations.ts`).</p>
                </>
            )}
          </CardContent>
        </Card>
    );
}
