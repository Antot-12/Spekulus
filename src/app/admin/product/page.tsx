
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { productSectionData as defaultData, type ProductSectionData, type ProductComponent, type Language } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Sparkles, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { ProductIcon } from '@/components/ProductIcon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logAction } from '@/lib/logger';
import NextImage from 'next/image';

const SECTION_KEY = 'product-section';

type AllProductData = Record<Language, ProductSectionData>;

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

export default function ProductSectionAdminPage() {
    const { toast } = useToast();
    const [allData, setAllData] = useState<AllProductData | null>(null);
    const [data, setData] = useState<ProductSectionData>(defaultData.en);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedLang, setSelectedLang] = useState<Language>('en');
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});


    const fetchData = useCallback(async (lang: Language): Promise<ProductSectionData> => {
        try {
            const response = await fetch(`/api/content?lang=${lang}&section=${SECTION_KEY}`);
            const result = await response.json();
            if (result.success && result.content) {
                return result.content;
            }
            console.warn(`No content found for ${lang}/${SECTION_KEY}, using default data.`);
            return defaultData[lang];
        } catch (error) {
            console.error(`Failed to fetch product section data for ${lang}, falling back to default.`, error);
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
                toast({ title: "Saved!", description: `Changes to the Product section for ${languageNames[selectedLang]} have been saved.`});
                logAction('Product Update', 'Success', `Saved all changes for ${languageNames[selectedLang]} product section.`);
                const updatedAllData = { ...allData, [selectedLang]: data };
                setAllData(updatedAllData as AllProductData);
            } else {
                toast({ title: "Save Failed", description: result.error || "Could not save changes.", variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: "Save Failed", description: "An error occurred during save.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const updateState = (newData: ProductSectionData) => {
        setData(newData);
    };

    const handleMainChange = (field: 'title' | 'subtitle', value: string) => {
        updateState({ ...data, [field]: value });
    };
    
    const handleComponentChange = (id: number, field: keyof ProductComponent, value: string | number | null) => {
        const updatedComponents = data.components.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        updateState({...data, components: updatedComponents});
    };
    
    const handleImageUpload = async (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        
        toast({ title: "Uploading...", description: "Please wait while the image is uploaded." });

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();

            if (result.success) {
                handleComponentChange(id, 'imageId', result.id);
                toast({ title: "Image Uploaded", description: "Image has been updated. Remember to save your changes." });
                logAction('File Upload', 'Success', `Uploaded image for product component ID '${id}': ${result.id}`);
            } else {
                toast({ title: "Upload Failed", description: result.error || "Could not upload image.", variant: 'destructive' });
                logAction('File Upload', 'Failure', `Failed to upload for product component ID '${id}'. Reason: ${result.error}`);
            }
        } catch (error: any) {
            console.error("Image upload error:", error);
            toast({ title: "Upload Failed", description: "An error occurred during upload.", variant: 'destructive' });
            logAction('File Upload', 'Failure', `Failed to upload for product component ID '${id}'. Reason: ${error.message}`);
        } finally {
             if (event.target) {
                event.target.value = '';
            }
        }
    };

    return (
        <Card className="opacity-0 animate-fade-in-up">
          <CardHeader>
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <CardTitle>Manage Product Section</CardTitle>
                    <CardDescription>Edit the content for the "Anatomy of a Smart Mirror" section on the homepage.</CardDescription>
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
            </Header>
          <CardContent className="space-y-6">
            {isLoading || !data ? (
                <div className="space-y-4 p-4">
                    <Skeleton className="h-10 w-1/3" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="title">Section Title</Label>
                        <Input id="title" value={data.title} onChange={(e) => handleMainChange('title', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subtitle">Section Subtitle</Label>
                        <Input id="subtitle" value={data.subtitle} onChange={(e) => handleMainChange('subtitle', e.target.value)} />
                    </div>

                    <div className="space-y-6 pt-4">
                        {data.components.map((component) => (
                          <div key={component.id} className="space-y-4 p-4 border rounded-md relative">
                            <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="rounded-lg bg-primary/10 p-3">
                                        <ProductIcon name={component.icon} className="w-6 h-6 text-primary" />
                                    </div>
                                    <Input 
                                        value={component.icon}
                                        onChange={(e) => handleComponentChange(component.id, 'icon', e.target.value)}
                                        placeholder="Icon Name"
                                        className="w-28 text-center text-xs" />
                                </div>
                                <div className="flex-grow space-y-2">
                                     <Input 
                                        value={component.title}
                                        onChange={(e) => handleComponentChange(component.id, 'title', e.target.value)}
                                        className="font-bold text-lg"/>
                                     <Textarea 
                                        value={component.description} 
                                        onChange={(e) => handleComponentChange(component.id, 'description', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`imageId-${component.id}`}>Image</Label>
                                <div className="flex gap-2">
                                    {component.imageId && <NextImage src={`/api/images/${component.imageId}`} alt={component.title} width={100} height={56} className="rounded-md aspect-video object-cover border" />}
                                    <Button variant="outline" size="sm" onClick={() => fileInputRefs.current[component.id]?.click()} aria-label="Upload image" className="flex-grow">
                                        <Upload className="mr-2 h-4 w-4" /> Upload
                                    </Button>
                                    <input type="file" ref={(el) => (fileInputRefs.current[component.id] = el)} onChange={(e) => handleImageUpload(component.id, e)} accept="image/*" className="hidden" />
                                </div>
                            </div>
                          </div>
                        ))}
                    </div>
                     <div className="text-sm text-muted-foreground p-4 border-dashed border-2 rounded-md">
                        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4"/>Icon Tip</h4>
                        <p>Enter the name of a `lucide-react` icon (e.g., `ScanEye`, `Cpu`, `BrainCircuit`, `HeartPulse`). The icon preview will update automatically. Case matters!</p>
                    </div>
                </>
            )}
          </CardContent>
        </Card>
    );
}
