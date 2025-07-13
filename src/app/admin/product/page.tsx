
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { initialData, type ProductSectionData, type ProductComponent, type Language } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Sparkles, Upload, Loader2, Image as ImageIcon, FolderSearch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { ProductIcon } from '@/components/ProductIcon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logAction } from '@/lib/logger';
import { getProductData, updateProductComponents } from '@/lib/db/actions';
import NextImage from 'next/image';
import { FilePickerDialog } from '../creators/FilePickerDialog';

const defaultData = initialData.productSectionData;

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

const createDefaultProductSectionData = (lang: Language): ProductSectionData => ({
    title: `Title for ${languageNames[lang]}`,
    subtitle: `Subtitle for ${languageNames[lang]}`,
    components: defaultData[lang].components.map(c => ({...c, imageId: null}))
});

export default function ProductSectionAdminPage() {
    const { toast } = useToast();
    const [allData, setAllData] = useState<AllProductData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedLang, setSelectedLang] = useState<Language>('en');
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    
    const data = allData?.[selectedLang] ?? null;

    useEffect(() => {
        const loadAllData = async () => {
            setIsLoading(true);
            const languages: Language[] = ['en', 'uk', 'sk'];
            const promises = languages.map(lang => getProductData(lang));
            const results = await Promise.all(promises);
            
            const newAllData = languages.reduce((acc, lang, index) => {
                const resultData = results[index];
                if (resultData && resultData.components.length > 0) {
                    acc[lang] = {
                        ...defaultData[lang], 
                        components: resultData.components
                    };
                } else {
                    acc[lang] = createDefaultProductSectionData(lang);
                }
                return acc;
            }, {} as AllProductData);

            setAllData(newAllData);
            setIsLoading(false);
        };
        loadAllData();
    }, []);

    const handleSave = async () => {
        if (!data) return;
        setIsSaving(true);
        try {
            await updateProductComponents(selectedLang, data.components);

            toast({ title: "Saved!", description: `Changes to the Product section for ${languageNames[selectedLang]} have been saved.`});
            logAction('Product Update', 'Success', `Saved all changes for ${languageNames[selectedLang]} product section.`);
        } catch (error) {
            toast({ title: "Save Failed", description: "An error occurred during save.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const updateState = (newData: ProductSectionData) => {
        setAllData(prev => prev ? { ...prev, [selectedLang]: newData } : null);
    };

    const handleMainChange = (field: 'title' | 'subtitle', value: string) => {
        if (!data) return;
        updateState({ ...data, [field]: value });
    };
    
    const handleComponentChange = (id: number, field: keyof Omit<ProductComponent, 'id'>, value: string | number | null) => {
        if (!data) return;
        const updatedComponents = data.components.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        updateState({...data, components: updatedComponents});
    };
    
    const handleFileSelect = (id: number, fileId: number) => {
        handleComponentChange(id, 'imageId', fileId);
        toast({ title: 'Image Selected', description: `File ID ${fileId} assigned. Remember to save.`})
    }

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
                </div>
            </CardHeader>
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
                              <Card key={component.id} className="p-4 relative">
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
                                <div className="space-y-2 mt-4">
                                    <Label>Image</Label>
                                    <Card>
                                        <CardContent className="p-4 flex flex-col items-center gap-4">
                                            {component.imageId ? (
                                                <div className="relative w-full aspect-video rounded-md overflow-hidden">
                                                    <NextImage src={`/api/images/${component.imageId}`} alt={component.title} layout="fill" objectFit='cover' />
                                                </div>
                                            ) : (
                                                <div className="w-full aspect-video rounded-md bg-muted flex items-center justify-center">
                                                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex gap-2 w-full">
                                                <FilePickerDialog onFileSelect={(fileId) => handleFileSelect(component.id, fileId)}>
                                                    <Button variant="outline" className="w-full"><FolderSearch className="mr-2 h-4 w-4" /> Choose</Button>
                                                </FilePickerDialog>
                                                <Button variant="outline" onClick={() => fileInputRefs.current[component.id]?.click()} className="w-full">
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload
                                                </Button>
                                            </div>
                                            <input
                                                type="file"
                                                ref={(el) => (fileInputRefs.current[component.id] = el)}
                                                onChange={(e) => handleImageUpload(component.id, e)}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                              </Card>
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
