
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Creator, FeaturedProject, Language, GalleryImage } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Upload, Github, Twitter, Linkedin, Wand2, Loader2, Music, Eye, EyeOff, Users, Heart, Camera, FileText, Link as LinkIcon, Image as ImageIcon, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { logAction } from '@/lib/logger';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { creatorsData as staticCreatorsData } from '@/lib/data';

const newCreatorBioExample = `### About Me

This is my bio. I am passionate about technology and design. You can use **Markdown** to style this text.

- My first hobby
- My second hobby

> "A quote I live by."
`;

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

export default function CreatorsAdminPage() {
    const { toast } = useToast();
    const [creators, setCreators] = useState<Creator[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
    const [selectedLang, setSelectedLang] = useState<Language>('en');
    
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const fetchCreators = useCallback(async (lang: Language) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/creators?lang=${lang}`);
            const data = await response.json();
            if (data.success) {
                // If no creators are returned, initialize with static data for that language
                setCreators(data.creators.length > 0 ? data.creators : staticCreatorsData[lang]);
            } else {
                toast({ title: "Error", description: `Could not fetch creators for ${languageNames[lang]}.`, variant: 'destructive' });
                setCreators(staticCreatorsData[lang]);
            }
        } catch (error) {
            toast({ title: "Network Error", description: "Failed to connect to the server.", variant: 'destructive' });
            setCreators(staticCreatorsData[lang]);
        }
        setIsLoading(false);
    }, [toast]);
    
    useEffect(() => {
        fetchCreators(selectedLang);
    }, [selectedLang, fetchCreators]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/creators', {
                method: 'POST', // Using POST to create/update the whole set
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lang: selectedLang, creators }),
            });
            const result = await response.json();
            if (result.success) {
                toast({ title: "Saved!", description: `All creator changes for ${languageNames[selectedLang]} have been saved.` });
                logAction('Creators Update', 'Success', `Saved all changes for ${languageNames[selectedLang]} creators.`);
                fetchCreators(selectedLang);
            } else {
                toast({ title: "Save Failed", description: result.error || "Could not save changes.", variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: "Network Error", description: "Failed to save changes.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleFieldChange = (id: number, field: keyof Creator, value: any) => {
        const updatedCreators = creators.map(creator =>
            creator.id === id ? { ...creator, [field]: value } : creator
        );
        setCreators(updatedCreators);
    };
    
    const handleSocialChange = (id: number, platform: 'github' | 'twitter' | 'linkedin', value: string) => {
        handleFieldChange(id, 'socials', { ...creators.find(c => c.id === id)?.socials, [platform]: value });
    };

    const handleMusicChange = (id: number, platform: keyof NonNullable<Creator['music']>, value: string) => {
        handleFieldChange(id, 'music', { ...(creators.find(c => c.id === id)?.music || {}), [platform]: value });
    };

    const handleProjectChange = (id: number, field: keyof FeaturedProject, value: string) => {
        const creator = creators.find(c => c.id === id);
        const updatedProject = { ...(creator?.featuredProject || { title: '', url: '', description: '', imageUrl: '', imageHint: ''}), [field]: value };
        handleFieldChange(id, 'featuredProject', updatedProject);
    };

    const handleCreatorAdd = () => {
        const newCreator: Creator = {
            id: Date.now(), name: 'New Creator', slug: `new-creator-${Date.now()}`, role: 'Team Member',
            bio: newCreatorBioExample, imageUrl: 'https://placehold.co/800x800.png', imageHint: 'person portrait',
            quote: '', quoteAuthor: '', music: { spotify: '' }, socials: { github: '', twitter: '', linkedin: '' },
            skills: [], gallery: [], featuredProject: { title: '', url: '', description: '', imageUrl: '', imageHint: '' },
            isVisible: false,
        };
        setCreators([...creators, newCreator]);
        toast({ title: "Creator Added", description: "A new profile has been added. Remember to save." });
    };

    const handleCreatorDelete = (idToDelete: number) => {
        const creatorToDelete = creators.find(creator => creator.id === idToDelete);
        setCreators(creators.filter(creator => creator.id !== idToDelete));
        toast({ title: "Creator Removed", description: `"${creatorToDelete?.name}" has been removed. Press 'Save Changes' to confirm the deletion.`, variant: 'destructive' });
    };

    const handleImageUpload = async (creatorId: number, field: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const creator = creators.find(c => c.id === creatorId);
        if (!creator || !creator.slug) {
            toast({ title: "Creator or slug not found", description: "Please ensure the creator has a valid slug before uploading.", variant: "destructive" });
            return;
        }

        toast({ title: "Uploading...", description: "Please wait while the image is uploaded." });
        const formData = new FormData();
        formData.append('file', file);
        const subdirectory = `spekulus/creators/${selectedLang}/${creator.slug}`;
        formData.append('subdirectory', subdirectory);
        
        try {
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const result = await response.json();

            if (result.success) {
                if (field === 'featuredProject') {
                    handleProjectChange(creatorId, 'imageUrl', result.url);
                } else if (field.startsWith('gallery.')) {
                    const index = parseInt(field.split('.')[1], 10);
                    handleGalleryChange(creatorId, index, 'imageUrl', result.url);
                } else {
                    handleFieldChange(creatorId, field as keyof Creator, result.url);
                }
                toast({ title: "Image Uploaded", description: "Image has been updated. Remember to save." });
                logAction('File Upload', 'Success', `Uploaded image for creator '${creator.name}' to ${result.url}`);
            } else {
                toast({ title: "Upload Failed", description: result.error, variant: 'destructive' });
                logAction('File Upload', 'Failure', `Failed to upload for creator '${creator.name}'. Reason: ${result.error}`);
            }
        } catch (error: any) {
            toast({ title: "Upload Failed", description: "An error occurred during upload.", variant: 'destructive' });
            logAction('File Upload', 'Failure', `Failed to upload for creator '${creator.name}'. Reason: ${error.message}`);
        } finally {
            if (event.target) event.target.value = '';
        }
    };
    
    const handleImageGenerate = async (creatorId: number, field: string, hint: string, galleryIndex?: number) => {
        if (!hint) {
            toast({ title: "Hint required", description: "Please provide an AI hint.", variant: 'destructive' });
            return;
        }
        
        const creatorName = creators.find(c => c.id === creatorId)?.name || 'Unknown';
        const uniqueId = galleryIndex !== undefined ? `${creatorId}-gallery.${galleryIndex}` : `${creatorId}-${field}`;
        setGeneratingImages(prev => ({ ...prev, [uniqueId]: true }));
        toast({ title: "Generating Image...", description: "The AI is creating an image. This may take a moment." });
    
        try {
            const imageUrl = await generateImage(hint);
            if (field === 'featuredProject') {
                handleProjectChange(creatorId, 'imageUrl', imageUrl);
            } else if (field.startsWith('gallery') && galleryIndex !== undefined) {
                handleGalleryChange(creatorId, galleryIndex, 'imageUrl', imageUrl);
            } else {
                handleFieldChange(creatorId, field as keyof Creator, imageUrl);
            }
            toast({ title: "Image Generated!", description: "The new image has been set. Remember to save." });
            logAction('File Upload', 'Success', `Generated image for creator '${creatorName}' with hint: "${hint}"`);
        } catch (error: any) {
            toast({ title: "Generation Failed", description: "The AI could not generate an image.", variant: 'destructive' });
            logAction('File Upload', 'Failure', `Failed to generate image for creator '${creatorName}'. Reason: ${error.message}`);
        } finally {
            setGeneratingImages(prev => ({ ...prev, [uniqueId]: false }));
        }
    };

    const handleArrayChange = (id: number, field: keyof Creator, value: string) => {
        handleFieldChange(id, field, value.split(',').map(s => s.trim()).filter(Boolean));
    };

    const handleGalleryChange = (creatorId: number, index: number, field: keyof GalleryImage, value: string) => {
        const creator = creators.find(c => c.id === creatorId);
        if (!creator) return;
        const newGallery = [...(creator.gallery || [])];
        newGallery[index] = { ...newGallery[index], [field]: value };
        handleFieldChange(creatorId, 'gallery', newGallery);
    };

    const handleGalleryAdd = (creatorId: number) => {
        const newImage: GalleryImage = { imageUrl: 'https://placehold.co/600x400.png', description: 'New Image', imageHint: 'placeholder' };
        const creator = creators.find(c => c.id === creatorId);
        if (!creator) return;
        handleFieldChange(creatorId, 'gallery', [...(creator.gallery || []), newImage]);
        toast({ title: "Gallery Image Added" });
    };

    const handleGalleryDelete = (creatorId: number, index: number) => {
        const creator = creators.find(c => c.id === creatorId);
        if (!creator) return;
        const newGallery = (creator.gallery || []).filter((_, i) => i !== index);
        handleFieldChange(creatorId, 'gallery', newGallery);
        toast({ title: "Gallery Image Deleted", variant: 'destructive' });
    };

    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardHeader>
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div>
                        <CardTitle>Manage Creators</CardTitle>
                        <CardDescription>Add, edit, or delete creator profiles. Press Save to persist all changes.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Select value={selectedLang} onValueChange={(value) => setSelectedLang(value as Language)}>
                            <SelectTrigger className="w-[150px]"><SelectValue><div className="flex items-center"><LanguageFlag lang={selectedLang} />{languageNames[selectedLang]}</div></SelectValue></SelectTrigger>
                            <SelectContent>
                               <SelectItem value="en"><LanguageFlag lang="en" /> {languageNames['en']}</SelectItem>
                               <SelectItem value="uk"><LanguageFlag lang="uk" /> {languageNames['uk']}</SelectItem>
                               <SelectItem value="sk"><LanguageFlag lang="sk" /> {languageNames['sk']}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleCreatorAdd}><PlusCircle className="mr-2 h-4 w-4" /> Add Creator</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                          Save Changes
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {isLoading ? (
                    <div className="space-y-6">{[...Array(2)].map((_, i) => (<div key={i} className="space-y-4 p-4 border rounded-md"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-10 w-1/2" /><Skeleton className="h-40 w-full" /></div>))}</div>
                ) : (
                    creators.map((creator) => (
                        <div key={creator.id} className="space-y-6 p-4 border rounded-md">
                            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                                <div className="space-y-0.5">
                                    <Label htmlFor={`visible-${creator.id}`} className="text-base flex items-center gap-2">
                                        {creator.isVisible !== false ? <Eye className="w-5 h-5 text-primary" /> : <EyeOff className="w-5 h-5 text-muted-foreground" />} Profile Visibility
                                    </Label>
                                    <p className="text-sm text-muted-foreground">{creator.isVisible !== false ? "This profile is visible to the public." : "This profile is hidden."}</p>
                                </div>
                                <Switch id={`visible-${creator.id}`} checked={creator.isVisible !== false} onCheckedChange={(checked) => handleFieldChange(creator.id, 'isVisible', checked)} aria-label="Toggle profile visibility"/>
                            </div>

                            <Card><CardHeader><CardTitle className="font-headline flex items-center gap-2"><Users className="w-6 h-6"/>Core Information</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label htmlFor={`name-${creator.id}`}>Name</Label><Input id={`name-${creator.id}`} value={creator.name ?? ''} onChange={(e) => handleFieldChange(creator.id, 'name', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`role-${creator.id}`}>Role</Label><Input id={`role-${creator.id}`} value={creator.role ?? ''} onChange={(e) => handleFieldChange(creator.id, 'role', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`slug-${creator.id}`}>Slug (URL)</Label><Input id={`slug-${creator.id}`} value={creator.slug ?? ''} onChange={(e) => handleFieldChange(creator.id, 'slug', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`location-${creator.id}`}>Location</Label><Input id={`location-${creator.id}`} value={creator.location ?? ''} onChange={(e) => handleFieldChange(creator.id, 'location', e.target.value)} placeholder="e.g., Kyiv, Ukraine" /></div>
                                    <div className="space-y-2 md:col-span-2"><Label htmlFor={`cvUrl-${creator.id}`}>CV URL</Label><Input id={`cvUrl-${creator.id}`} value={creator.cvUrl ?? ''} onChange={(e) => handleFieldChange(creator.id, 'cvUrl', e.target.value)} placeholder="/documents/cv.pdf" /></div>
                                </CardContent>
                            </Card>

                            <Card><CardHeader><CardTitle className="font-headline flex items-center gap-2"><ImageIcon className="w-6 h-6"/>Profile Image</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2"><Label htmlFor={`imageUrl-${creator.id}`}>Image URL</Label>
                                        <div className="flex gap-2">
                                            <Input id={`imageUrl-${creator.id}`} value={creator.imageUrl ?? ''} onChange={(e) => handleFieldChange(creator.id, 'imageUrl', e.target.value)} />
                                            <Button variant="outline" size="icon" onClick={() => fileInputRefs.current[`creator-${creator.id}`]?.click()}><Upload className="h-4 w-4" /></Button>
                                            <input type="file" ref={(el) => (fileInputRefs.current[`creator-${creator.id}`] = el)} onChange={(e) => handleImageUpload(creator.id, 'imageUrl', e)} accept="image/*" className="hidden" />
                                        </div>
                                    </div>
                                    <div className="space-y-2"><Label htmlFor={`imageHint-${creator.id}`}>Image AI Hint</Label>
                                        <div className="flex gap-2">
                                            <Input id={`imageHint-${creator.id}`} value={creator.imageHint ?? ''} onChange={(e) => handleFieldChange(creator.id, 'imageHint', e.target.value)} />
                                            <Button variant="outline" size="icon" onClick={() => handleImageGenerate(creator.id, 'imageUrl', creator.imageHint || '')} disabled={generatingImages[`${creator.id}-imageUrl`]}>
                                                {generatingImages[`${creator.id}-imageUrl`] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card><CardHeader><CardTitle className="font-headline flex items-center gap-2"><Heart className="w-6 h-6"/>Personality &amp; Details</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2"><Label htmlFor={`quote-${creator.id}`}>Inspirational Quote</Label><Textarea id={`quote-${creator.id}`} value={creator.quote ?? ''} onChange={(e) => handleFieldChange(creator.id, 'quote', e.target.value)} rows={2}/></div>
                                    <div className="space-y-2"><Label htmlFor={`quote-author-${creator.id}`}>Quote Author</Label><Input id={`quote-author-${creator.id}`} value={creator.quoteAuthor ?? ''} onChange={(e) => handleFieldChange(creator.id, 'quoteAuthor', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`skills-${creator.id}`}>Skills (comma-separated)</Label><Input id={`skills-${creator.id}`} value={creator.skills?.join(', ') ?? ''} onChange={(e) => handleArrayChange(creator.id, 'skills', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`languages-${creator.id}`}>Languages (comma-separated)</Label><Input id={`languages-${creator.id}`} value={creator.languages?.join(', ') ?? ''} onChange={(e) => handleArrayChange(creator.id, 'languages', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`contributions-${creator.id}`}>Contributions (comma-separated)</Label><Textarea id={`contributions-${creator.id}`} value={creator.contributions?.join(', ') ?? ''} onChange={(e) => handleArrayChange(creator.id, 'contributions', e.target.value)} rows={3}/></div>
                                    <div className="space-y-2"><Label htmlFor={`hobbies-${creator.id}`}>Hobbies (comma-separated)</Label><Input id={`hobbies-${creator.id}`} value={creator.hobbies?.join(', ') ?? ''} onChange={(e) => handleArrayChange(creator.id, 'hobbies', e.target.value)} /></div>
                                </CardContent>
                            </Card>

                            <Card><CardHeader><CardTitle className="font-headline flex items-center gap-2"><LinkIcon className="w-6 h-6"/>Social Links</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <div className="flex items-center gap-2 rounded-md border border-input pr-3"><div className="p-2 bg-muted rounded-l-md"><Github className="w-5 h-5"/></div><Input placeholder="GitHub Username" className="border-0 focus-visible:ring-0" value={creator.socials.github ?? ''} onChange={(e) => handleSocialChange(creator.id, 'github', e.target.value)} /></div>
                                    <div className="flex items-center gap-2 rounded-md border border-input pr-3"><div className="p-2 bg-muted rounded-l-md"><Twitter className="w-5 h-5"/></div><Input placeholder="Twitter URL" className="border-0 focus-visible:ring-0" value={creator.socials.twitter ?? ''} onChange={(e) => handleSocialChange(creator.id, 'twitter', e.target.value)} /></div>
                                    <div className="flex items-center gap-2 rounded-md border border-input pr-3"><div className="p-2 bg-muted rounded-l-md"><Linkedin className="w-5 h-5"/></div><Input placeholder="LinkedIn URL" className="border-0 focus-visible:ring-0" value={creator.socials.linkedin ?? ''} onChange={(e) => handleSocialChange(creator.id, 'linkedin', e.target.value)} /></div>
                                </CardContent>
                            </Card>

                            <Card className="bg-muted/30"><CardHeader><CardTitle className="font-headline flex items-center gap-2"><Music className="w-6 h-6"/>Music &amp; Playlists</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2"><Label htmlFor={`spotify-${creator.id}`}>Spotify Playlist ID</Label><Input id={`spotify-${creator.id}`} value={creator.music?.spotify ?? ''} onChange={(e) => handleMusicChange(creator.id, 'spotify', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`apple-music-${creator.id}`}>Apple Music Playlist URL</Label><Input id={`apple-music-${creator.id}`} value={creator.music?.appleMusic ?? ''} onChange={(e) => handleMusicChange(creator.id, 'appleMusic', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`youtube-music-${creator.id}`}>YouTube Music Playlist ID</Label><Input id={`youtube-music-${creator.id}`} value={creator.music?.youtubeMusic ?? ''} onChange={(e) => handleMusicChange(creator.id, 'youtubeMusic', e.target.value)} /></div>
                                </CardContent>
                            </Card>
                            
                            <Card className="bg-muted/30"><CardHeader><CardTitle className="font-headline">Featured Project</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2"><Label htmlFor={`project-title-${creator.id}`}>Project Title</Label><Input id={`project-title-${creator.id}`} value={creator.featuredProject?.title ?? ''} onChange={(e) => handleProjectChange(creator.id, 'title', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`project-url-${creator.id}`}>Project URL</Label><Input id={`project-url-${creator.id}`} value={creator.featuredProject?.url ?? ''} onChange={(e) => handleProjectChange(creator.id, 'url', e.target.value)} /></div>
                                    <div className="space-y-2"><Label htmlFor={`project-desc-${creator.id}`}>Project Description</Label><Textarea id={`project-desc-${creator.id}`} value={creator.featuredProject?.description ?? ''} onChange={(e) => handleProjectChange(creator.id, 'description', e.target.value)} rows={3} /></div>
                                    <div className="space-y-2"><Label htmlFor={`project-imageUrl-${creator.id}`}>Project Image URL</Label>
                                        <div className="flex gap-2">
                                            <Input id={`project-imageUrl-${creator.id}`} value={creator.featuredProject?.imageUrl ?? ''} onChange={(e) => handleProjectChange(creator.id, 'imageUrl', e.target.value)} />
                                            <Button variant="outline" size="icon" onClick={() => fileInputRefs.current[`project-${creator.id}`]?.click()}><Upload className="h-4 w-4" /></Button>
                                            <input type="file" ref={(el) => (fileInputRefs.current[`project-${creator.id}`] = el)} onChange={(e) => handleImageUpload(creator.id, 'featuredProject', e)} accept="image/*" className="hidden" />
                                        </div>
                                    </div>
                                    <div className="space-y-2"><Label htmlFor={`project-imageHint-${creator.id}`}>Project Image AI Hint</Label>
                                        <div className="flex gap-2">
                                            <Input id={`project-imageHint-${creator.id}`} value={creator.featuredProject?.imageHint ?? ''} onChange={(e) => handleProjectChange(creator.id, 'imageHint', e.target.value)} />
                                            <Button variant="outline" size="icon" onClick={() => handleImageGenerate(creator.id, 'featuredProject', creator.featuredProject?.imageHint || '')} disabled={generatingImages[`${creator.id}-featuredProject`]}>
                                                {generatingImages[`${creator.id}-featuredProject`] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card><CardHeader><CardTitle className="font-headline flex items-center gap-2"><Camera className="w-6 h-6"/>Gallery</CardTitle><CardDescription>Manage this creator's gallery. Remember to save changes.</CardDescription></CardHeader>
                                <CardContent className="space-y-4">
                                    {(creator.gallery ?? []).map((image, index) => (
                                        <div key={index} className="space-y-4 p-4 border rounded-lg bg-muted/20 relative">
                                            <div className="space-y-2"><Label htmlFor={`gallery-url-${creator.id}-${index}`}>Image URL</Label>
                                                <div className="flex gap-2">
                                                    <Input id={`gallery-url-${creator.id}-${index}`} value={image.imageUrl} onChange={(e) => handleGalleryChange(creator.id, index, 'imageUrl', e.target.value)} />
                                                    <Button variant="outline" size="icon" onClick={() => fileInputRefs.current[`gallery-${creator.id}-${index}`]?.click()}><Upload className="h-4 w-4" /></Button>
                                                    <input type="file" ref={(el) => (fileInputRefs.current[`gallery-${creator.id}-${index}`] = el)} onChange={(e) => handleImageUpload(creator.id, `gallery.${index}`, e)} accept="image/*" className="hidden" />
                                                </div>
                                            </div>
                                            <div className="space-y-2"><Label htmlFor={`gallery-desc-${creator.id}-${index}`}>Description / Alt Text</Label><Input id={`gallery-desc-${creator.id}-${index}`} value={image.description} onChange={(e) => handleGalleryChange(creator.id, index, 'description', e.target.value)} /></div>
                                            <div className="space-y-2"><Label htmlFor={`gallery-hint-${creator.id}-${index}`}>AI Hint</Label>
                                                <div className="flex gap-2">
                                                    <Input id={`gallery-hint-${creator.id}-${index}`} value={image.imageHint} onChange={(e) => handleGalleryChange(creator.id, index, 'imageHint', e.target.value)} />
                                                    <Button variant="outline" size="icon" onClick={() => handleImageGenerate(creator.id, `gallery`, image.imageHint, index)} disabled={generatingImages[`${creator.id}-gallery.${index}`]}>
                                                        {generatingImages[`${creator.id}-gallery.${index}`] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button variant="destructive" size="icon" className="absolute top-4 right-4" onClick={() => handleGalleryDelete(creator.id, index)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    ))}
                                    <Button onClick={() => handleGalleryAdd(creator.id)}><PlusCircle className="mr-2 h-4 w-4"/> Add Gallery Image</Button>
                                </CardContent>
                            </Card>

                            <Card><CardHeader><CardTitle className="font-headline flex items-center gap-2"><FileText className="w-6 h-6"/>Bio</CardTitle></CardHeader>
                                <CardContent>
                                    <MarkdownEditor value={creator.bio ?? ''} onChange={(value) => handleFieldChange(creator.id, 'bio', value)} rows={10} uploadSubdirectory={`spekulus/creators/${selectedLang}/${creator.slug}`} />
                                </CardContent>
                            </Card>
                            
                            <p className="text-sm text-muted-foreground">Note: Education, Certifications, and Achievements are currently editable only in `src/lib/data.ts`.</p>
                            
                            <div className="flex justify-end pt-2">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Delete Creator</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This will remove the creator "{creator.name}" from this list. This action is not final until you press "Save Changes".</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleCreatorDelete(creator.id)}>Remove</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
