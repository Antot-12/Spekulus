
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Creator, FeaturedProject, Language, GalleryImage, Education, Certification, Achievement } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Trash2, PlusCircle, Upload, Loader2, Eye, EyeOff, Users, Heart, Camera, FileText, Link as LinkIcon, Save, Music, Briefcase, GraduationCap, Award, FolderSearch, ChevronDown, Gitlab, Disc, Globe, Facebook, Instagram
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { getCreators, updateCreators, createCreator } from '@/lib/db/actions';
import { initialData } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { FilePickerDialog } from './FilePickerDialog';

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
  return <span className="mr-2 text-base" role="img" aria-label={`${lang} flag`}></span>;
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
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [actor, setActor] = useState('admin');

  // State to hold the raw string values for comma-separated fields
  const [arrayFieldStrings, setArrayFieldStrings] = useState<Record<string, Record<string, string>>>({});

  const updateArrayFieldString = (creatorId: number, field: 'skills' | 'languages' | 'hobbies' | 'contributions', value: string) => {
    setArrayFieldStrings(prev => ({
      ...prev,
      [`${creatorId}`]: {
        ...(prev[`${creatorId}`] || {}),
        [field]: value,
      },
    }));
  };
  
  const initializeArrayFieldStrings = (creatorsData: Creator[]) => {
    const initialState: Record<string, Record<string, string>> = {};
    creatorsData.forEach(creator => {
      initialState[`${creator.id}`] = {
        skills: creator.skills?.join(', ') || '',
        languages: creator.languages?.join(', ') || '',
        hobbies: creator.hobbies?.join(', ') || '',
        contributions: creator.contributions?.join(', ') || '',
      };
    });
    setArrayFieldStrings(initialState);
  };

  useEffect(() => {
    const adminUser = localStorage.getItem('admin_user') || 'admin';
    setActor(adminUser);
  }, []);

  const fetchCreators = useCallback(async (lang: Language) => {
    setIsLoading(true);
    try {
      const data = await getCreators(lang);
      const sorted = data.sort((a,b) => a.name.localeCompare(b.name));
      const creatorsData = sorted.length > 0 ? sorted : initialData.creatorsData[lang];
      setCreators(creatorsData);
      initializeArrayFieldStrings(creatorsData);
    } catch {
      toast({ title: "Network Error", description: "Failed to connect to the server.", variant: 'destructive' });
      setCreators(initialData.creatorsData[lang]);
      initializeArrayFieldStrings(initialData.creatorsData[lang]);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchCreators(selectedLang);
  }, [selectedLang, fetchCreators]);

  const handleSave = async () => {
    setIsSaving(true);

    // Before saving, update the creators state with the array values from the string inputs
    const creatorsToSave = creators.map(creator => {
      const stringFields = arrayFieldStrings[creator.id] || {};
      return {
        ...creator,
        skills: stringFields.skills?.split(',').map(s => s.trim()).filter(Boolean) || [],
        languages: stringFields.languages?.split(',').map(s => s.trim()).filter(Boolean) || [],
        hobbies: stringFields.hobbies?.split(',').map(s => s.trim()).filter(Boolean) || [],
        contributions: stringFields.contributions?.split(',').map(s => s.trim()).filter(Boolean) || [],
      };
    });

    try {
      await updateCreators(selectedLang, creatorsToSave, actor);
      toast({
        title: "Saved!",
        description: `All creator changes for ${languageNames[selectedLang]} have been saved.`,
      });
      fetchCreators(selectedLang);
    } catch (error: any) {
      console.error("🔥 Save error:", error);
      toast({
        title: "Save Failed",
        description: error?.message || "Could not save changes.",
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (id: number, field: keyof Creator, value: any) => {
    setCreators(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  
  const handleFileSelect = (id: number, field: keyof Creator, fileId: number) => {
    handleFieldChange(id, field, fileId);
    toast({ title: 'File Selected', description: `File ID ${fileId} assigned. Remember to save your changes.`})
  }
  
  const handleGalleryFileSelect = (creatorId: number, galleryIndex: number, fileId: number) => {
    const creator = creators.find(c => c.id === creatorId);
    if (!creator) return;

    const newGallery = [...(creator.gallery ?? [])];
    if (newGallery[galleryIndex]) {
        newGallery[galleryIndex] = { ...newGallery[galleryIndex], imageId: fileId };
    }
    handleFieldChange(creatorId, 'gallery', newGallery);
    toast({ title: 'Gallery Image Selected', description: `File ID ${fileId} assigned. Remember to save.`})
  }

  const handleSocialChange = (id: number, platform: keyof Creator['socials'], value: string) => {
    const creator = creators.find(c => c.id === id);
    if (creator) handleFieldChange(id, 'socials', { ...creator.socials, [platform]: value });
  };

  const handleMusicChange = (id: number, platform: keyof NonNullable<Creator['music']>, value: string) => {
    const creator = creators.find(c => c.id === id);
    if (creator) handleFieldChange(id, 'music', { ...(creator.music ?? {}), [platform]: value });
  };

  const handleProjectChange = (id: number, field: keyof FeaturedProject, value: string) => {
    const creator = creators.find(c => c.id === id);
    const updated = { ...(creator?.featuredProject || { title: '', url: '', description: '' }), [field]: value };
    handleFieldChange(id, 'featuredProject', updated);
  };
  
  const handleCreatorAdd = async () => {
    const newSlug = `new-creator-${Date.now()}`;
    const newCreatorData: Omit<Creator, 'id'> = {
      name: 'New Creator',
      slug: newSlug,
      role: 'Team Member',
      bio: newCreatorBioExample,
      quote: '',
      quoteAuthor: '',
      music: { spotify: '' },
      socials: { github: '', twitter: '', linkedin: '', gitlab: '', discord: '', website: '', facebook: '', instagram: '' },
      skills: [],
      languages: [],
      contributions: [],
      hobbies: [],
      gallery: [],
      featuredProject: { title: '', url: '', description: '' },
      isVisible: false,
      cvUrl: '',
      imageId: null,
      featuredProjectImageId: null,
      education: [],
      certifications: [],
      achievements: [],
    };

    try {
      const newCreator = await createCreator(selectedLang, newCreatorData, actor);
      if (newCreator?.slug) {
        setCreators(prev => [...prev, newCreator]);
        setActiveAccordionItem(String(newCreator.id));
        toast({ title: "Creator Added", description: "New profile added. Save to persist." });
      } else {
        toast({ title: "Add Failed", description: "Could not add creator.", variant: 'destructive' });
      }
    } catch {
      toast({ title: "Add Failed", description: "An error occurred while adding the creator.", variant: 'destructive' });
    }
  };

  const handleCreatorDelete = (idToDelete: number) => {
    const creator = creators.find(c => c.id === idToDelete);
    setCreators(prev => prev.filter(c => c.id !== idToDelete));
    toast({ title: "Creator Removed", description: `${creator?.name} removed. Save to confirm.`, variant: 'destructive' });
  };

  const handleImageUpload = async (creatorId: number, field: 'imageId' | 'featuredProjectImageId' | `gallery.${number}` | 'cvUrl', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast({ title: "Uploading...", description: "Uploading file." });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await res.json();
      
      if (result.success && result.id) {
        if (field === 'imageId' || field === 'featuredProjectImageId') {
            handleFieldChange(creatorId, field, result.id);
        } else if (field === 'cvUrl') {
            handleFieldChange(creatorId, 'cvUrl', `/api/images/${result.id}`);
        } else if (field.startsWith('gallery.')) {
              const idx = parseInt(field.split('.')[1], 10);
              const creator = creators.find(c => c.id === creatorId);
              if (!creator) return;
              const newGallery = [...(creator.gallery ?? [])];
              if (newGallery[idx]) {
                  newGallery[idx] = { ...newGallery[idx], imageId: result.id };
              }
              handleFieldChange(creatorId, 'gallery', newGallery);
        }
        toast({ title: "Uploaded", description: "File uploaded. Save to persist." });
      } else {
        toast({ title: "Upload Failed", description: result.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: "Upload Failed", description: "Error uploading file.", variant: 'destructive' });
    } finally {
      if (event.target) event.target.value = '';
    }
  };

  const handleComplexArrayChange = <T extends Education | Certification | Achievement>(
    creatorId: number, 
    field: 'education' | 'certifications' | 'achievements',
    idx: number,
    prop: keyof T,
    value: string
  ) => {
    const creator = creators.find(c => c.id === creatorId);
    if (!creator) return;

    const array = [...(creator[field] as T[] ?? [])];
    array[idx] = { ...array[idx], [prop]: value };
    handleFieldChange(creatorId, field, array);
  };

  const handleComplexArrayAdd = (creatorId: number, field: 'education' | 'certifications' | 'achievements') => {
    const creator = creators.find(c => c.id === creatorId);
    if (!creator) return;

    let newItem;
    if (field === 'education') newItem = { institution: 'New Institution', degree: 'New Degree', year: new Date().getFullYear().toString() };
    if (field === 'certifications') newItem = { name: 'New Certification', authority: 'New Authority', year: new Date().getFullYear().toString() };
    if (field === 'achievements') newItem = { icon: 'Star', name: 'New Achievement', description: 'Description...' };

    if (newItem) {
        const array = [...(creator[field] as any[] ?? []), newItem];
        handleFieldChange(creatorId, field, array);
    }
  };

  const handleComplexArrayDelete = (creatorId: number, field: 'education' | 'certifications' | 'achievements', idx: number) => {
    const creator = creators.find(c => c.id === creatorId);
    if (!creator) return;
    const array = (creator[field] as any[])?.filter((_, i) => i !== idx);
    handleFieldChange(creatorId, field, array);
  };

  const handleGalleryChange = (creatorId: number, idx: number, value: string) => {
    const creator = creators.find(c => c.id === creatorId);
    if (!creator) return;
    const gallery = [...(creator.gallery ?? [])];
    gallery[idx] = { ...gallery[idx], description: value };
    handleFieldChange(creatorId, 'gallery', gallery);
  };

  const handleGalleryAdd = (creatorId: number) => {
    const creator = creators.find(c => c.id === creatorId);
    if (!creator) return;
    const gallery = [...(creator.gallery ?? []), { imageId: 0, description: 'New Image' }];
    handleFieldChange(creatorId, 'gallery', gallery);
    toast({ title: "Gallery Image Added" });
  };

  const handleGalleryDelete = (creatorId: number, idx: number) => {
    const creator = creators.find(c => c.id === creatorId);
    if (!creator) return;
    const gallery = creator.gallery?.filter((_, i) => i !== idx);
    handleFieldChange(creatorId, 'gallery', gallery);
    toast({ title: "Gallery Image Deleted", variant: 'destructive' });
  };

  return (
    <div className="opacity-0 animate-fade-in-up">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div>
              <CardTitle>Manage Creators</CardTitle>
            </div>
            <div className="flex gap-2">
              <Select value={selectedLang} onValueChange={v => setSelectedLang(v as Language)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue><LanguageFlag lang={selectedLang} />{languageNames[selectedLang]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en"><LanguageFlag lang="en" /> English</SelectItem>
                  <SelectItem value="uk"><LanguageFlag lang="uk" /> Ukrainian</SelectItem>
                  <SelectItem value="sk"><LanguageFlag lang="sk" /> Slovak</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreatorAdd}><PlusCircle className="mr-2 h-4 w-4" />Add Creator</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <Accordion 
        type="single" 
        collapsible 
        className="w-full mt-6 space-y-4"
        value={activeAccordionItem}
        onValueChange={setActiveAccordionItem}
       >
        {isLoading ? (
            <p>Loading profiles...</p>
        ) : (
          creators.map(creator => (
            <AccordionItem value={String(creator.id)} key={creator.id} className="border rounded-md bg-card">
              <div className="flex items-center p-4">
                <AccordionTrigger className="flex-grow p-0 hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                       <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-200 text-primary" />
                       <div className="flex-grow">
                          <h3 className="font-semibold text-lg">{creator.name}</h3>
                          <p className="text-sm text-muted-foreground">{creator.role}</p>
                       </div>
                    </div>
                </AccordionTrigger>
                 <div className="flex items-center gap-2 pl-4">
                   <Badge variant={creator.isVisible ? "default" : "secondary"}>
                      {creator.isVisible ? "Visible" : "Hidden"}
                   </Badge>
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-destructive/10 text-destructive/70 hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                          <AlertDialogDescription>This deletes "{creator.name}" from this language after saving changes. This action is not reversible.</AlertDialogDescription>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCreatorDelete(creator.id)}>Delete Profile</AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
                 </div>
              </div>
              <AccordionContent className="p-6 pt-0 space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                    <Label htmlFor={`visible-${creator.id}`} className="text-base flex items-center gap-2">
                    {creator.isVisible ? <Eye className="w-5 h-5 text-primary" /> : <EyeOff className="w-5 h-5 text-muted-foreground" />} Profile Visibility
                    </Label>
                    <Switch id={`visible-${creator.id}`} checked={!!creator.isVisible} onCheckedChange={v => handleFieldChange(creator.id, 'isVisible', v)} />
                </div>

                <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2 text-xl"><Users className="w-5 h-5" />Core Info</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor={`name-${creator.id}`}>Name</Label><Input id={`name-${creator.id}`} value={creator.name} onChange={e => handleFieldChange(creator.id, 'name', e.target.value)} /></div>
                    <div><Label htmlFor={`role-${creator.id}`}>Role</Label><Input id={`role-${creator.id}`} value={creator.role} onChange={e => handleFieldChange(creator.id, 'role', e.target.value)} /></div>
                    <div><Label htmlFor={`slug-${creator.id}`}>Slug</Label><Input id={`slug-${creator.id}`} value={creator.slug} onChange={e => handleFieldChange(creator.id, 'slug', e.target.value)} /></div>
                    <div><Label htmlFor={`location-${creator.id}`}>Location</Label><Input id={`location-${creator.id}`} value={creator.location ?? ''} onChange={e => handleFieldChange(creator.id, 'location', e.target.value)} /></div>
                    <div className="md:col-span-2">
                        <Label>Profile Image</Label>
                        <div className="flex gap-2">
                            <Input value={creator.imageId ?? ''} disabled placeholder="Upload or choose an image"/>
                             <FilePickerDialog onFileSelect={(fileId) => handleFileSelect(creator.id, 'imageId', fileId)}>
                                <Button variant="outline" size="icon"><FolderSearch className="h-4 w-4"/></Button>
                            </FilePickerDialog>
                            <Button variant="outline" size="icon" onClick={() => fileInputRefs.current[`creator-${creator.id}`]?.click()}><Upload className="h-4 w-4"/></Button>
                            <input type="file" ref={el => (fileInputRefs.current[`creator-${creator.id}`] = el)} accept="image/*" onChange={e => handleImageUpload(creator.id, 'imageId', e)} className="hidden" />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <Label>CV File</Label>
                        <div className="flex gap-2">
                            <Input value={creator.cvUrl ?? ''} disabled placeholder="Upload or choose a file"/>
                             <FilePickerDialog onFileSelect={(fileId) => handleFieldChange(creator.id, 'cvUrl', `/api/images/${fileId}`)} fileTypes={['application/pdf']}>
                                <Button variant="outline" size="icon"><FolderSearch className="h-4 w-4"/></Button>
                            </FilePickerDialog>
                            <Button variant="outline" size="icon" onClick={() => fileInputRefs.current[`cv-${creator.id}`]?.click()}><Upload className="h-4 w-4"/></Button>
                            <input type="file" ref={el => (fileInputRefs.current[`cv-${creator.id}`] = el)} accept=".pdf,.doc,.docx" onChange={e => handleImageUpload(creator.id, 'cvUrl', e)} className="hidden" />
                        </div>
                    </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-muted/30">
                  <CardHeader><CardTitle className="font-headline flex items-center gap-2 text-xl"><FileText className="w-5 h-5" />Bio</CardTitle></CardHeader>
                  <CardContent><MarkdownEditor value={creator.bio} onChange={v => handleFieldChange(creator.id, 'bio', v)} rows={10} /></CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2 text-xl"><Heart className="w-5 h-5" />Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                    <div><Label>Quote</Label><Textarea value={creator.quote ?? ''} onChange={e => handleFieldChange(creator.id, 'quote', e.target.value)} rows={2} /></div>
                    <div><Label>Quote Author</Label><Input value={creator.quoteAuthor ?? ''} onChange={e => handleFieldChange(creator.id, 'quoteAuthor', e.target.value)} /></div>
                    <div><Label>Skills (comma-separated)</Label><Input value={arrayFieldStrings[creator.id]?.skills ?? ''} onChange={e => updateArrayFieldString(creator.id, 'skills', e.target.value)} /></div>
                    <div><Label>Languages (comma-separated)</Label><Input value={arrayFieldStrings[creator.id]?.languages ?? ''} onChange={e => updateArrayFieldString(creator.id, 'languages', e.target.value)} /></div>
                    <div><Label>Contributions (comma-separated)</Label><Textarea value={arrayFieldStrings[creator.id]?.contributions ?? ''} onChange={e => updateArrayFieldString(creator.id, 'contributions', e.target.value)} rows={3} /></div>
                    <div><Label>Hobbies (comma-separated)</Label><Input value={arrayFieldStrings[creator.id]?.hobbies ?? ''} onChange={e => updateArrayFieldString(creator.id, 'hobbies', e.target.value)} /></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2 text-xl"><LinkIcon className="w-5 h-5" />Social</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><LinkIcon className="w-3 h-3"/> LinkedIn</Label>
                            <Input placeholder="LinkedIn URL" value={creator.socials.linkedin ?? ''} onChange={e => handleSocialChange(creator.id, 'linkedin', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="w-3 h-3"/> GitHub</Label>
                            <Input placeholder="GitHub Username" value={creator.socials.github ?? ''} onChange={e => handleSocialChange(creator.id, 'github', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Gitlab className="w-3 h-3"/> GitLab</Label>
                            <Input placeholder="GitLab Username" value={creator.socials.gitlab ?? ''} onChange={e => handleSocialChange(creator.id, 'gitlab', e.target.value)} />
                        </div>
                         <div className="space-y-1">
                            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Globe className="w-3 h-3"/> Website/Portfolio</Label>
                            <Input placeholder="https://..." value={creator.socials.website ?? ''} onChange={e => handleSocialChange(creator.id, 'website', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Disc className="w-3 h-3"/> Discord</Label>
                            <Input placeholder="Discord Username" value={creator.socials.discord ?? ''} onChange={e => handleSocialChange(creator.id, 'discord', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Facebook className="w-3 h-3"/> Facebook</Label>
                            <Input placeholder="Facebook Profile URL" value={creator.socials.facebook ?? ''} onChange={e => handleSocialChange(creator.id, 'facebook', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Instagram className="w-3 h-3"/> Instagram</Label>
                            <Input placeholder="Instagram Username" value={creator.socials.instagram ?? ''} onChange={e => handleSocialChange(creator.id, 'instagram', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="w-3 h-3"/> X / Twitter</Label>
                            <Input placeholder="X (Twitter) URL" value={creator.socials.twitter ?? ''} onChange={e => handleSocialChange(creator.id, 'twitter', e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="font-headline flex items-center gap-2 text-xl"><Briefcase className="w-5 h-5" />Featured Project</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div><Label>Project Title</Label><Input value={creator.featuredProject?.title ?? ''} onChange={e => handleProjectChange(creator.id, 'title', e.target.value)} /></div>
                    <div><Label>Project URL</Label><Input value={creator.featuredProject?.url ?? ''} onChange={e => handleProjectChange(creator.id, 'url', e.target.value)} /></div>
                    <div><Label>Project Description</Label><Textarea value={creator.featuredProject?.description ?? ''} onChange={e => handleProjectChange(creator.id, 'description', e.target.value)} rows={3}/></div>
                    <div>
                        <Label>Project Image</Label>
                        <div className="flex gap-2">
                            <Input value={creator.featuredProjectImageId ?? ''} disabled placeholder="Upload or choose an image"/>
                            <FilePickerDialog onFileSelect={(fileId) => handleFileSelect(creator.id, 'featuredProjectImageId', fileId)}>
                                <Button variant="outline" size="icon"><FolderSearch className="h-4 w-4"/></Button>
                            </FilePickerDialog>
                            <Button variant="outline" size="icon" onClick={() => fileInputRefs.current[`project-${creator.id}`]?.click()}><Upload className="h-4 w-4" /></Button>
                            <input type="file" ref={el => fileInputRefs.current[`project-${creator.id}`] = el} accept="image/*" onChange={e => handleImageUpload(creator.id, 'featuredProjectImageId', e)} className="hidden" />
                        </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="font-headline flex items-center gap-2 text-xl"><GraduationCap className="w-5 h-5" />Education</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {creator.education?.map((edu, idx) => (
                      <div key={idx} className="flex gap-2 items-end p-2 border rounded-md">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-grow">
                            <Input placeholder="Institution" value={edu.institution} onChange={e => handleComplexArrayChange(creator.id, 'education', idx, 'institution', e.target.value)} />
                            <Input placeholder="Degree" value={edu.degree} onChange={e => handleComplexArrayChange(creator.id, 'education', idx, 'degree', e.target.value)} />
                            <Input placeholder="Year" value={edu.year} onChange={e => handleComplexArrayChange(creator.id, 'education', idx, 'year', e.target.value)} />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleComplexArrayDelete(creator.id, 'education', idx)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => handleComplexArrayAdd(creator.id, 'education')}><PlusCircle className="mr-2 h-4 w-4"/>Add Education</Button>
                  </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2 text-xl"><Award className="w-5 h-5" />Certifications</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                    {creator.certifications?.map((cert, idx) => (
                        <div key={idx} className="flex gap-2 items-end p-2 border rounded-md">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-grow">
                            <Input placeholder="Certification Name" value={cert.name} onChange={e => handleComplexArrayChange(creator.id, 'certifications', idx, 'name', e.target.value)} />
                            <Input placeholder="Issuing Authority" value={cert.authority} onChange={e => handleComplexArrayChange(creator.id, 'certifications', idx, 'authority', e.target.value)} />
                            <Input placeholder="Year" value={cert.year} onChange={e => handleComplexArrayChange(creator.id, 'certifications', idx, 'year', e.target.value)} />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleComplexArrayDelete(creator.id, 'certifications', idx)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => handleComplexArrayAdd(creator.id, 'certifications')}><PlusCircle className="mr-2 h-4 w-4"/>Add Certification</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2 text-xl"><Award className="w-5 h-5" />Achievements</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                    {creator.achievements?.map((ach, idx) => (
                        <div key={idx} className="flex gap-2 items-start p-2 border rounded-md">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-grow">
                            <Input placeholder="Icon (e.g., Star)" value={ach.icon} onChange={e => handleComplexArrayChange(creator.id, 'achievements', idx, 'icon', e.target.value)} />
                            <Input placeholder="Achievement Name" value={ach.name} onChange={e => handleComplexArrayChange(creator.id, 'achievements', idx, 'name', e.target.value)} />
                            <Textarea placeholder="Description..." value={ach.description} onChange={e => handleComplexArrayChange(creator.id, 'achievements', idx, 'description', e.target.value)} className="sm:col-span-2"/>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleComplexArrayDelete(creator.id, 'achievements', idx)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => handleComplexArrayAdd(creator.id, 'achievements')}><PlusCircle className="mr-2 h-4 w-4"/>Add Achievement</Button>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2 text-xl"><Music className="w-5 h-5" />Music & Playlists</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                    <div>
                        <Label>Spotify Playlist ID</Label>
                        <Input value={creator.music?.spotify ?? ''} onChange={e => handleMusicChange(creator.id, 'spotify', e.target.value)} />
                    </div>
                    <div>
                        <Label>Apple Music Playlist URL</Label>
                        <Input value={creator.music?.appleMusic ?? ''} onChange={e => handleMusicChange(creator.id, 'appleMusic', e.target.value)} />
                    </div>
                    <div>
                        <Label>YouTube Music Playlist ID</Label>
                        <Input value={creator.music?.youtubeMusic ?? ''} onChange={e => handleMusicChange(creator.id, 'youtubeMusic', e.target.value)} />
                    </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="font-headline flex items-center gap-2 text-xl"><Camera className="w-5 h-5" />Gallery</CardTitle>
                            <Button size="sm" variant="outline" onClick={() => handleGalleryAdd(creator.id)}><PlusCircle className="mr-2 h-4 w-4" />Add Image</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {creator.gallery?.map((img, idx) => (
                            <div key={idx} className="flex gap-4 p-2 border rounded-md bg-muted/20 items-end">
                                <div className="flex-grow space-y-2">
                                    <Label>Image Description</Label>
                                    <Input value={img.description} onChange={e => handleGalleryChange(creator.id, idx, e.target.value)} />
                                    <Label>Image</Label>
                                    <div className="flex gap-2">
                                        <Input value={img.imageId || ''} disabled placeholder="Upload or choose an image"/>
                                        <FilePickerDialog onFileSelect={(fileId) => handleGalleryFileSelect(creator.id, idx, fileId)}>
                                            <Button variant="outline" size="icon"><FolderSearch className="h-4 w-4"/></Button>
                                        </FilePickerDialog>
                                        <Button variant="outline" size="icon" onClick={() => fileInputRefs.current[`gallery-${creator.id}-${idx}`]?.click()}><Upload className="h-4 w-4" /></Button>
                                        <input type="file" ref={el => fileInputRefs.current[`gallery-${creator.id}-${idx}`] = el} accept="image/*" onChange={e => handleImageUpload(creator.id, `gallery.${idx}`, e)} className="hidden" />
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleGalleryDelete(creator.id, idx)} className="shrink-0"><Trash2 className="w-4 w-4 text-destructive"/></Button>
                            </div>
                        ))}
                        {(!creator.gallery || creator.gallery.length === 0) && <p className="text-sm text-muted-foreground text-center py-4">No gallery images yet.</p>}
                    </CardContent>
                </Card>

              </AccordionContent>
            </AccordionItem>
          ))
        )}
      </Accordion>
    </div>
  );
}
