
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Creator, FeaturedProject, Language, GalleryImage, Education, Certification, Achievement } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Trash2,
  PlusCircle,
  Upload,
  Loader2,
  Eye,
  EyeOff,
  Users,
  Heart,
  Camera,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Save,
  Music,
  Briefcase,
  GraduationCap,
  Award,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { logAction } from '@/lib/logger';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getCreators, updateCreators, createCreator } from '@/lib/db/actions';
import { initialData } from '@/lib/data';

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
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchCreators = useCallback(async (lang: Language) => {
    setIsLoading(true);
    try {
      const data = await getCreators(lang);
      setCreators(data.length > 0 ? data : initialData.creatorsData[lang]);
    } catch {
      toast({ title: "Network Error", description: "Failed to connect to the server.", variant: 'destructive' });
      setCreators(initialData.creatorsData[lang]);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchCreators(selectedLang);
  }, [selectedLang, fetchCreators]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCreators(selectedLang, creators);
      toast({
        title: "Saved!",
        description: `All creator changes for ${languageNames[selectedLang]} have been saved.`,
      });
      logAction('Creators Update', 'Success', `Saved all changes for ${languageNames[selectedLang]} creators.`);
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

  const handleSocialChange = (id: number, platform: 'github' | 'twitter' | 'linkedin', value: string) => {
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
    const newCreatorData: Omit<Creator, 'id'> = {
      name: 'New Creator',
      slug: `new-creator-${Date.now()}`,
      role: 'Team Member',
      bio: newCreatorBioExample,
      quote: '',
      quoteAuthor: '',
      music: { spotify: '' },
      socials: { github: '', twitter: '', linkedin: '' },
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
      const newCreator = await createCreator(selectedLang, newCreatorData);
      if (newCreator?.id) {
        setCreators(prev => [...prev, newCreator]);
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

  const handleImageUpload = async (creatorId: number, field: 'imageId' | 'featuredProjectImageId' | `gallery.${number}`, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const creator = creators.find(c => c.id === creatorId);
    if (!creator) return;
    toast({ title: "Uploading...", description: "Uploading image." });
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.success) {
        if (field === 'featuredProjectImageId') handleFieldChange(creatorId, 'featuredProjectImageId', result.id);
        else if (field.startsWith('gallery.')) {
          const idx = parseInt(field.split('.')[1], 10);
          const gallery = [...(creator.gallery ?? [])];
          gallery[idx] = { ...gallery[idx], imageId: result.id };
          handleFieldChange(creatorId, 'gallery', gallery);
        } else handleFieldChange(creatorId, 'imageId', result.id);
        toast({ title: "Uploaded", description: "Image uploaded. Save to persist." });
        logAction('File Upload', 'Success', `Uploaded image for creator ${creator.name}.`);
      } else {
        toast({ title: "Upload Failed", description: result.error, variant: 'destructive' });
        logAction('File Upload', 'Failure', `Failed upload for ${creator.name}.`);
      }
    } catch {
      toast({ title: "Upload Failed", description: "Error uploading image.", variant: 'destructive' });
      logAction('File Upload', 'Failure', `Error uploading for ${creator.name}.`);
    } finally {
      if (event.target) event.target.value = '';
    }
  };

  const handleArrayChange = (id: number, field: 'skills' | 'languages' | 'hobbies' | 'contributions', value: string) => {
    const arr = value.split(',').map(s => s.trim()).filter(Boolean);
    handleFieldChange(id, field, arr);
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
    <Card className="opacity-0 animate-fade-in-up">
      <CardHeader>
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <CardTitle>Manage Creators</CardTitle>
            <CardDescription>Press Save to persist changes.</CardDescription>
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
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="space-y-4 p-4 border rounded-md">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-40 w-full" />
              </div>
            ))}
          </div>
        ) : (
          creators.map(creator => (
            <div key={`${creator.slug}-${creator.id}`} className="space-y-6 p-4 border rounded-md">
              <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                <Label htmlFor={`visible-${creator.id}`} className="text-base flex items-center gap-2">
                  {creator.isVisible ? <Eye className="w-5 h-5 text-primary" /> : <EyeOff className="w-5 h-5 text-muted-foreground" />} Profile Visibility
                </Label>
                <Switch id={`visible-${creator.id}`} checked={!!creator.isVisible} onCheckedChange={v => handleFieldChange(creator.id, 'isVisible', v)} />
              </div>

              <Card>
                <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Users className="w-6 h-6" />Core Info</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label htmlFor={`name-${creator.id}`}>Name</Label><Input id={`name-${creator.id}`} value={creator.name} onChange={e => handleFieldChange(creator.id, 'name', e.target.value)} /></div>
                  <div><Label htmlFor={`role-${creator.id}`}>Role</Label><Input id={`role-${creator.id}`} value={creator.role} onChange={e => handleFieldChange(creator.id, 'role', e.target.value)} /></div>
                  <div><Label htmlFor={`slug-${creator.id}`}>Slug</Label><Input id={`slug-${creator.id}`} value={creator.slug} onChange={e => handleFieldChange(creator.id, 'slug', e.target.value)} /></div>
                  <div><Label htmlFor={`location-${creator.id}`}>Location</Label><Input id={`location-${creator.id}`} value={creator.location ?? ''} onChange={e => handleFieldChange(creator.id, 'location', e.target.value)} /></div>
                  <div className="md:col-span-2"><Label htmlFor={`cvUrl-${creator.id}`}>CV URL</Label><Input id={`cvUrl-${creator.id}`} value={creator.cvUrl ?? ''} onChange={e => handleFieldChange(creator.id, 'cvUrl', e.target.value)} /></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="font-headline flex items-center gap-2"><ImageIcon className="w-6 h-6" />Profile Image</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input value={creator.imageId ?? ''} disabled placeholder="Upload an image to get an ID"/>
                    <Button variant="outline" size="icon" onClick={() => fileInputRefs.current[`creator-${creator.id}`]?.click()}><Upload className="h-4 w-4"/></Button>
                    <input type="file" ref={el => (fileInputRefs.current[`creator-${creator.id}`] = el)} accept="image/*" onChange={e => handleImageUpload(creator.id, 'imageId', e)} className="hidden" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Heart className="w-6 h-6" />Details</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <Label>Quote</Label><Textarea value={creator.quote ?? ''} onChange={e => handleFieldChange(creator.id, 'quote', e.target.value)} rows={2} />
                  <Label>Quote Author</Label><Input value={creator.quoteAuthor ?? ''} onChange={e => handleFieldChange(creator.id, 'quoteAuthor', e.target.value)} />
                  <Label>Skills (comma-separated)</Label><Input value={creator.skills?.join(', ') ?? ''} onChange={e => handleArrayChange(creator.id, 'skills', e.target.value)} />
                  <Label>Languages (comma-separated)</Label><Input value={creator.languages?.join(', ') ?? ''} onChange={e => handleArrayChange(creator.id, 'languages', e.target.value)} />
                  <Label>Contributions (comma-separated)</Label><Textarea value={creator.contributions?.join(', ') ?? ''} onChange={e => handleArrayChange(creator.id, 'contributions', e.target.value)} rows={3} />
                  <Label>Hobbies (comma-separated)</Label><Input value={creator.hobbies?.join(', ') ?? ''} onChange={e => handleArrayChange(creator.id, 'hobbies', e.target.value)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="font-headline flex items-center gap-2"><LinkIcon className="w-6 h-6" />Social</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input placeholder="GitHub" value={creator.socials.github ?? ''} onChange={e => handleSocialChange(creator.id, 'github', e.target.value)} />
                  <Input placeholder="Twitter" value={creator.socials.twitter ?? ''} onChange={e => handleSocialChange(creator.id, 'twitter', e.target.value)} />
                  <Input placeholder="LinkedIn" value={creator.socials.linkedin ?? ''} onChange={e => handleSocialChange(creator.id, 'linkedin', e.target.value)} />
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardHeader><CardTitle className="font-headline flex items-center gap-2"><FileText className="w-6 h-6" />Bio</CardTitle></CardHeader>
                <CardContent><MarkdownEditor value={creator.bio} onChange={v => handleFieldChange(creator.id, 'bio', v)} rows={10} /></CardContent>
              </Card>
              
              <Card>
                <CardHeader><CardTitle className="font-headline flex items-center gap-2"><GraduationCap className="w-6 h-6" />Education</CardTitle></CardHeader>
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
                <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Award className="w-6 h-6" />Certifications</CardTitle></CardHeader>
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
                <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Music className="w-6 h-6" />Music & Playlists</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor={`spotify-${creator.id}`}>Spotify Playlist ID</Label>
                    <Input id={`spotify-${creator.id}`} value={creator.music?.spotify ?? ''} onChange={e => handleMusicChange(creator.id, 'spotify', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor={`apple-${creator.id}`}>Apple Music Playlist URL</Label>
                    <Input id={`apple-${creator.id}`} value={creator.music?.appleMusic ?? ''} onChange={e => handleMusicChange(creator.id, 'appleMusic', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor={`youtube-${creator.id}`}>YouTube Music Playlist ID</Label>
                    <Input id={`youtube-${creator.id}`} value={creator.music?.youtubeMusic ?? ''} onChange={e => handleMusicChange(creator.id, 'youtubeMusic', e.target.value)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Briefcase className="w-6 h-6" />Featured Project</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Project Title</Label><Input value={creator.featuredProject?.title ?? ''} onChange={e => handleProjectChange(creator.id, 'title', e.target.value)} /></div>
                  <div><Label>Project URL</Label><Input value={creator.featuredProject?.url ?? ''} onChange={e => handleProjectChange(creator.id, 'url', e.target.value)} /></div>
                  <div><Label>Project Description</Label><Textarea value={creator.featuredProject?.description ?? ''} onChange={e => handleProjectChange(creator.id, 'description', e.target.value)} rows={3}/></div>
                  <div>
                    <Label>Project Image</Label>
                    <div className="flex gap-2">
                        <Input value={creator.featuredProjectImageId ?? ''} disabled placeholder="Upload an image to get an ID"/>
                        <Button variant="outline" size="icon" onClick={() => fileInputRefs.current[`project-${creator.id}`]?.click()}><Upload className="h-4 w-4" /></Button>
                        <input type="file" ref={el => fileInputRefs.current[`project-${creator.id}`] = el} accept="image/*" onChange={e => handleImageUpload(creator.id, 'featuredProjectImageId', e)} className="hidden" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="font-headline flex items-center gap-2"><Camera className="w-6 h-6" />Gallery</CardTitle>
                        <Button size="sm" onClick={() => handleGalleryAdd(creator.id)}><PlusCircle className="mr-2 h-4 w-4" />Add Image</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {creator.gallery?.map((img, idx) => (
                        <div key={idx} className="flex gap-4 p-4 border rounded-md bg-muted/20">
                            <div className="flex-grow space-y-2">
                                <Label>Image Description</Label>
                                <Input value={img.description} onChange={e => handleGalleryChange(creator.id, idx, e.target.value)} />
                                <Label>Image</Label>
                                <div className="flex gap-2">
                                    <Input value={img.imageId || ''} disabled placeholder="Upload an image to get an ID"/>
                                    <Button variant="outline" size="icon" onClick={() => fileInputRefs.current[`gallery-${creator.id}-${idx}`]?.click()}><Upload className="h-4 w-4" /></Button>
                                    <input type="file" ref={el => fileInputRefs.current[`gallery-${creator.id}-${idx}`] = el} accept="image/*" onChange={e => handleImageUpload(creator.id, `gallery.${idx}`, e)} className="hidden" />
                                </div>
                            </div>
                            <Button variant="destructive" size="icon" onClick={() => handleGalleryDelete(creator.id, idx)} className="shrink-0 self-end"><Trash2 className="w-4 h-4"/></Button>
                        </div>
                    ))}
                    {!creator.gallery || creator.gallery.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No gallery images yet.</p>}
                </CardContent>
              </Card>


              <div className="flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                    <AlertDialogDescription>This deletes "{creator.name}" after saving changes.</AlertDialogDescription>
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
