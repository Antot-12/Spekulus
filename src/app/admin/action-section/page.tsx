
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { actionSectionData as defaultData, type ActionSectionData, type Language } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Upload, Wand2, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { logAction } from '@/lib/logger';

const SECTION_KEY = 'action-section';

type AllActionSectionData = Record<Language, ActionSectionData>;

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

export default function ActionSectionAdminPage() {
    const { toast } = useToast();
    const [allData, setAllData] = useState<AllActionSectionData | null>(null);
    const [data, setData] = useState<ActionSectionData>(defaultData.en);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedLang, setSelectedLang] = useState<Language>('en');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const fetchData = useCallback(async (lang: Language) => {
        try {
            const response = await fetch(`/api/content?lang=${lang}&section=${SECTION_KEY}`);
            const result = await response.json();
            if (result.success && result.content) {
                return result.content;
            }
            console.warn(`No content found for ${lang}/${SECTION_KEY}, using default data.`);
            return defaultData[lang];
        } catch (error) {
            console.error(`Failed to fetch action section data for ${lang}, falling back to default.`, error);
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
        }
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
                toast({ title: "Saved!", description: `Changes to the "In Action" section for ${languageNames[selectedLang]} have been saved.`});
                logAction('Action Section Update', 'Success', `Saved all changes for ${languageNames[selectedLang]} 'In Action' section.`);
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

    const handleChange = (field: keyof ActionSectionData, value: string | boolean) => {
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
        formData.append('subdirectory', 'action-section');
        
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
                logAction('File Upload', 'Success', `Uploaded image for 'In Action' section: ${result.url}`);
            } else {
                toast({ title: "Upload Failed", description: result.error || "Could not upload image.", variant: 'destructive' });
                 logAction('File Upload', 'Failure', `Failed to upload image for 'In Action' section.`);
            }
        } catch (error) {
            console.error("Image upload error:", error);
            toast({ title: "Upload Failed", description: "An error occurred during upload.", variant: 'destructive' });
            logAction('File Upload', 'Failure', `Failed to upload image for 'In Action' section. Error: ${error}`);
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
            logAction('File Upload', 'Success', `Generated image for 'In Action' section with hint: "${data.imageHint}"`);
        } catch (error) {
            console.error("Image generation error:", error);
            toast({ title: "Generation Failed", description: "The AI could not generate an image. Please try a different hint.", variant: 'destructive' });
            logAction('File Upload', 'Failure', `Failed to generate image for 'In Action' section with hint: "${data.imageHint}"`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="opacity-0 animate-fade-in-up">
          <CardHeader>
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <CardTitle>Manage "In Action" Section</CardTitle>
                    <CardDescription>Edit the content for the "See Spekulus in Action" section on the homepage.</CardDescription>
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
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="visible" className="text-base">Section Visibility</Label>
                            <p className="text-sm text-muted-foreground">
                                {data.visible ? "This section is currently visible on the homepage." : "This section is hidden from the homepage."}
                            </p>
                        </div>
                        <Switch
                            id="visible"
                            checked={data.visible}
                            onCheckedChange={(checked) => handleChange('visible', checked)}
                            aria-label="Toggle section visibility"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="title">Section Title</Label>
                        <Input id="title" value={data.title} onChange={(e) => handleChange('title', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subtitle">Section Subtitle</Label>
                        <Input id="subtitle" value={data.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={data.description} onChange={(e) => handleChange('description', e.target.value)} rows={4} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image URL</Label>
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
                        <Label htmlFor="imageHint">Image AI Hint</Label>
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

                    <Separator className="my-6" />
                    
                    <h3 className="text-lg font-medium text-foreground">Button Settings</h3>
                    
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="buttonVisible" className="text-base">Button Visibility</Label>
                            <p className="text-sm text-muted-foreground">
                                {data.buttonVisible ? "The button is visible on the homepage." : "The button is hidden from the homepage."}
                            </p>
                        </div>
                        <Switch
                            id="buttonVisible"
                            checked={data.buttonVisible}
                            onCheckedChange={(checked) => handleChange('buttonVisible', checked)}
                            aria-label="Toggle button visibility"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="buttonText">Button Text</Label>
                        <Input id="buttonText" value={data.buttonText} onChange={(e) => handleChange('buttonText', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="buttonUrl">Button URL</Label>
                        <Input id="buttonUrl" value={data.buttonUrl} onChange={(e) => handleChange('buttonUrl', e.target.value)} />
                    </div>
                </>
            )}
          </CardContent>
        </Card>
    );
}
