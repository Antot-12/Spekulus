
"use client";

import { useState, useEffect, useRef } from 'react';
import type { PartnerSectionData, Language } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Upload, Loader2, Image as ImageIcon, FolderSearch, Handshake } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { logAction } from '@/lib/logger';
import { getPartnerSectionData, updatePartnerSectionData } from '@/lib/db/actions';
import { FilePickerDialog } from '../creators/FilePickerDialog';
import NextImage from 'next/image';

const languageNames: Record<Language, string> = { en: 'English', uk: 'Ukrainian', sk: 'Slovak' };
const LanguageFlag = ({ lang }: { lang: Language }) => {
  const flags: Record<string, string> = { en: '🇬🇧', uk: '🇺🇦', sk: '🇸🇰' };
  return <span className="mr-2 text-base" role="img" aria-label={`${lang} flag`}>{flags[lang]}</span>;
};

const createDefaultData = (lang: Language): PartnerSectionData => ({
  id: 0,
  title: `Title for ${languageNames[lang]}`,
  text: '',
  ctaLabel: 'Contact Us',
  imageId: null,
});

export default function PartnerSectionAdminPage() {
  const { toast } = useToast();
  const [allData, setAllData] = useState<Record<Language, PartnerSectionData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const data = allData?.[selectedLang] ?? null;

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      const languages: Language[] = ['en', 'uk', 'sk'];
      const promises = languages.map(lang => getPartnerSectionData(lang));
      const results = await Promise.all(promises);
      const newAllData = languages.reduce((acc, lang, index) => {
        acc[lang] = results[index] || createDefaultData(lang);
        return acc;
      }, {} as Record<Language, PartnerSectionData>);
      setAllData(newAllData);
      setIsLoading(false);
    };
    loadAllData();
  }, []);

  const updateLocalData = (updates: Partial<PartnerSectionData>) => {
    setAllData(prev => prev ? { ...prev, [selectedLang]: { ...prev[selectedLang], ...updates } } : null);
  };

  const handleFileSelect = (fileId: number) => {
    updateLocalData({ imageId: fileId });
    toast({ title: 'Image Selected', description: `File ID ${fileId} assigned. Remember to save.` });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    toast({ title: 'Uploading...', description: 'Please wait...' });
    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await response.json();
      if (result.success) {
        updateLocalData({ imageId: result.id });
        toast({ title: 'Image Uploaded', description: 'Remember to save.' });
      } else {
        toast({ title: 'Upload Failed', description: result.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Upload Error', description: 'Could not upload file.', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    const current = allData?.[selectedLang];
    if (!current) return;
    setIsSaving(true);
    try {
      await updatePartnerSectionData(selectedLang, current);
      toast({ title: 'Saved!', description: `Partner CTA for ${languageNames[selectedLang]} has been saved.` });
      logAction('Partner CTA Update', 'Success', `Saved changes for ${languageNames[selectedLang]} Partner CTA.`);
    } catch (error) {
      toast({ title: 'Save Failed', description: 'An error occurred.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="opacity-0 animate-fade-in-up">
      <CardHeader>
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2"><Handshake /> Manage Partner CTA Section</CardTitle>
            <CardDescription>Edit the content for the "Partner with Us" section on the homepage.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedLang} onValueChange={value => setSelectedLang(value as Language)}>
              <SelectTrigger className="w-[150px]"><SelectValue><LanguageFlag lang={selectedLang} /> {languageNames[selectedLang]}</SelectValue></SelectTrigger>
              <SelectContent>
                <SelectItem value="en"><LanguageFlag lang="en" /> English</SelectItem>
                <SelectItem value="uk"><LanguageFlag lang="uk" /> Ukrainian</SelectItem>
                <SelectItem value="sk"><LanguageFlag lang="sk" /> Slovak</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading || !data ? (
          <div className="space-y-4 p-4">
            <Skeleton className="h-10 w-1/3" /><Skeleton className="h-24 w-full" /><Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Section Title</Label>
                <Input id="title" value={data.title} onChange={e => updateLocalData({ title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="text">Description Text</Label>
                <Textarea id="text" value={data.text} onChange={e => updateLocalData({ text: e.target.value })} rows={5} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaLabel">Button Label</Label>
                <Input id="ctaLabel" value={data.ctaLabel} onChange={e => updateLocalData({ ctaLabel: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ctaUrl">Button URL</Label>
                <Input id="ctaUrl" value={data.ctaUrl || ''} onChange={e => updateLocalData({ ctaUrl: e.target.value })} placeholder="e.g., mailto:founders@spekulus.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <Card>
                <CardContent className="p-4 flex flex-col items-center gap-4">
                  {data.imageId ? (
                    <div className="relative w-full aspect-square rounded-md overflow-hidden bg-muted">
                      <NextImage src={`/api/images/${data.imageId}`} alt="Partner section image" layout="fill" objectFit="contain" />
                    </div>
                  ) : (
                    <div className="w-full aspect-square rounded-md bg-muted flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex w-full gap-2">
                    <FilePickerDialog onFileSelect={handleFileSelect}>
                      <Button variant="outline" className="w-full"><FolderSearch className="mr-2 h-4 w-4" /> Choose Existing</Button>
                    </FilePickerDialog>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full"><Upload className="mr-2 h-4 w-4" /> Upload New</Button>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
