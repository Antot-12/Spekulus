
"use client";

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import type { DevNote, Language } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Upload, Loader2, Eye, EyeOff, Save, FolderSearch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { getDevNotes, createDevNote, updateDevNote, deleteDevNote, getDevNoteBySlug } from '@/lib/db/actions';
import { FilePickerDialog } from '../creators/FilePickerDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const newNoteContentExample = `### This is a Subheading

This is a paragraph of text. You can use **bold**, *italics*, or ~~strikethrough~~. You can even <u>underline text</u>.

> This is a blockquote, perfect for highlighting a key takeaway.

- Here is a list item
- And another one

[This is a link to Google](https://google.com)
`;

const languageNames: Record<Language, string> = {
  en: 'English',
  uk: 'Ukrainian',
  sk: 'Slovak'
};

const LanguageFlag = ({ lang }: { lang: Language }) => {
  const flags: Record<string, string> = { en: '🇬🇧', uk: '🇺🇦', sk: '🇸🇰' };
  return <span className="mr-2 text-base" role="img" aria-label={`${lang} flag`}>{flags[lang]}</span>;
};

const generateSlug = (title: string) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') 
        .replace(/\s+/g, '-')         
        .replace(/-+/g, '-');          
};

type NoteTranslations = {
    en?: DevNote;
    uk?: DevNote;
    sk?: DevNote;
};

// Memoize the notes list to prevent re-renders on selection change
const NotesList = memo(function NotesList({ notes, activeSlug, onSelectNote, isLoading }: { notes: DevNote[], activeSlug: string | null, onSelectNote: (slug: string) => void, isLoading: boolean }) {
    return (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {isLoading ? (
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
            ) : (
                notes.map(note => (
                    <Button
                        key={note.id}
                        variant={activeSlug === note.slug ? "secondary" : "ghost"}
                        onClick={() => onSelectNote(note.slug)}
                        className="w-full h-auto justify-between"
                    >
                        <div className="flex justify-between items-center w-full gap-2">
                            <span className="truncate text-left">{note.title}</span>
                            <Badge variant={note.isVisible ? "default" : "outline"} className="shrink-0">
                                {note.isVisible ? "Visible" : "Draft"}
                            </Badge>
                        </div>
                    </Button>
                ))
            )}
        </div>
    )
});


export default function NotesAdminPage() {
    const { toast } = useToast();
    const [allNotes, setAllNotes] = useState<DevNote[]>([]);
    const [activeTranslations, setActiveTranslations] = useState<NoteTranslations>({});
    const [activeLang, setActiveLang] = useState<Language>('en');
    const [activeSlug, setActiveSlug] = useState<string | null>(null);

    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingNote, setIsLoadingNote] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [actor, setActor] = useState('admin');

    useEffect(() => {
        const adminUser = localStorage.getItem('admin_user') || 'admin';
        setActor(adminUser);
    }, []);

    const getActiveNote = useCallback(() => {
        if (!activeSlug) return null;

        const currentTranslation = activeTranslations[activeLang];
        if (currentTranslation) {
            return currentTranslation;
        }

        const englishVersion = activeTranslations.en;
        if (!englishVersion) return null;

        // Create a new, unsaved translation based on the English version
        return {
            ...englishVersion,
            id: 0, // IMPORTANT: Set ID to 0 to indicate it's a new record
            lang: activeLang,
            title: `[${activeLang.toUpperCase()}] ${englishVersion.title}`,
            summary: englishVersion.summary,
            content: englishVersion.content,
        };
    }, [activeTranslations, activeLang, activeSlug]);

    const activeNote = getActiveNote();

    const fetchAllNotes = useCallback(async () => {
        setIsLoadingList(true);
        try {
            const data = await getDevNotes('en'); 
            const sortedNotes = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setAllNotes(sortedNotes);
        } catch (error) {
            toast({ title: "Network Error", description: "Failed to load notes list.", variant: 'destructive' });
        } finally {
            setIsLoadingList(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchAllNotes();
    }, [fetchAllNotes]); 

    const handleSelectNote = async (slug: string) => {
        setIsLoadingNote(true);
        setActiveSlug(slug);
        setActiveLang('en');
        try {
            const notes = await getDevNoteBySlug(slug);
            const translations: NoteTranslations = {};
            if (notes) {
                for (const note of notes) {
                    translations[note.lang as Language] = note;
                }
            }
            setActiveTranslations(translations);
        } catch (error) {
            toast({ title: "Error", description: "Could not fetch note translations.", variant: "destructive" });
        } finally {
            setIsLoadingNote(false);
        }
    };

    const handleFieldChange = (field: keyof DevNote, value: any) => {
        if (!activeNote) return;
        
        const updatedNote = { ...activeNote, [field]: value };
        
        setActiveTranslations(prev => ({
            ...prev,
            [activeLang]: updatedNote,
        }));
        
        if (field === 'title' && activeLang === 'en' && typeof value === 'string') {
            const newSlug = generateSlug(value);
            setActiveSlug(newSlug);
            setActiveTranslations(prev => {
                const updatedTranslations: NoteTranslations = {};
                for (const lang in prev) {
                    updatedTranslations[lang as Language] = { ...prev[lang as Language]!, slug: newSlug };
                }
                return updatedTranslations;
            });
        }
    };

    const handleArrayChange = (field: keyof DevNote, value: string) => {
        const arrayValue = value.split(',').map(s => s.trim()).filter(Boolean);
        handleFieldChange(field, arrayValue);
    };
    
    const handleSaveNote = async () => {
        if (!activeNote || !activeSlug) return;
        setIsSaving(true);
        
        // Always use the robust upsert action.
        // The server will handle whether to insert or update.
        const noteToSave: DevNote = { ...activeNote, slug: activeSlug };
    
        try {
            await updateDevNote(noteToSave, actor);
            
            toast({ title: "Note Saved", description: `"${activeNote.title}" (${languageNames[activeLang]}) has been saved.` });
            await fetchAllNotes();
            await handleSelectNote(activeSlug); 
        } catch (error: any) {
            toast({ title: "Save Failed", description: error.message || "Could not save changes.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleNoteAdd = async () => {
        const newSlug = `new-note-title-${Date.now()}`;
        const newNoteData: Omit<DevNote, 'id'> = {
            title: 'New Note Title',
            slug: newSlug,
            lang: 'en',
            date: new Date(),
            summary: 'A brief summary of the new note.',
            content: newNoteContentExample,
            author: 'Spekulus Team',
            tags: ['Update'],
            isVisible: false,
            reactionCounts: {},
            imageId: null,
        };

        try {
            const newNote = await createDevNote(newNoteData, actor);
            if (newNote) {
                await fetchAllNotes();
                setActiveSlug(newNote.slug);
                setActiveTranslations({ en: newNote });
                setActiveLang('en');
                toast({ title: "Note Created", description: "You are now editing a new note." });
            } else {
                toast({ title: "Creation Failed", description: "Could not create a new note.", variant: 'destructive' });
            }
        } catch (error: any) {
            toast({ title: "Creation Failed", description: error.message, variant: 'destructive' });
        }
    };

    const handleNoteDelete = async () => {
        if (!activeSlug) return;
        const noteToDelete = allNotes.find(n => n.slug === activeSlug);
        if (!noteToDelete) return;

        try {
            await deleteDevNote(noteToDelete.id, actor, true); 
            toast({ title: "Note Deleted", description: `"${noteToDelete.title}" and all its translations have been deleted.`, variant: 'destructive' });
            setActiveSlug(null);
            setActiveTranslations({});
            await fetchAllNotes();
        } catch (error: any) {
            toast({ title: "Deletion Failed", description: error.message, variant: 'destructive' });
        }
    };
    
    const handleFileSelect = (fileId: number) => {
        handleFieldChange('imageId', fileId);
        toast({ title: 'Image Selected', description: `File ID ${fileId} assigned. Remember to save.`})
    }

    const handleHeaderImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !activeNote) return;

        const formData = new FormData();
        formData.append('file', file);
        
        toast({ title: "Uploading...", description: "Please wait while the header image is uploaded." });

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.success) {
                handleFieldChange('imageId', result.id);
                toast({ title: "Image Uploaded", description: "Header image has been updated. Save the note to persist this change." });
            } else {
                toast({ title: "Upload Failed", description: result.error || "Could not upload image.", variant: 'destructive' });
            }
        } catch (error: any) {
            console.error("Header image upload error:", error);
            toast({ title: "Upload Failed", description: "An error occurred during upload.", variant: 'destructive' });
        } finally {
             if (event.target) event.target.value = '';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-4">
                <Card className="opacity-0 animate-fade-in-up">
                    <CardHeader>
                        <CardTitle>Developer Notes</CardTitle>
                        <CardDescription>Select a note to edit or create a new one.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleNoteAdd} className="w-full"><PlusCircle className="mr-2 h-4 w-4"/> Add New Note</Button>
                        <Separator className="my-4"/>
                        <NotesList 
                            notes={allNotes}
                            activeSlug={activeSlug}
                            onSelectNote={handleSelectNote}
                            isLoading={isLoadingList}
                        />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                {activeSlug ? (
                    isLoadingNote ? (
                        <Card className="h-96 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </Card>
                    ) : (
                    <Card className="opacity-0 animate-fade-in-up">
                        <CardHeader>
                            <div className="flex justify-between items-start gap-4 flex-wrap">
                                <div>
                                    <CardTitle>Editing: {activeTranslations.en?.title || activeSlug}</CardTitle>
                                    <CardDescription>Use the dropdown to manage translations.</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete "{activeTranslations.en?.title}" and **all its translations**. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleNoteDelete}>Delete Note</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <Button onClick={handleSaveNote} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 border rounded-lg bg-muted/20">
                                <Label>Translation Language</Label>
                                <Select value={activeLang} onValueChange={(v) => setActiveLang(v as Language)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue><LanguageFlag lang={activeLang} />{languageNames[activeLang]}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(languageNames).map(lang => (
                                            <SelectItem key={lang} value={lang}>
                                                <div className="flex justify-between w-full items-center">
                                                    <span><LanguageFlag lang={lang as Language} /> {languageNames[lang as Language]}</span>
                                                    {activeTranslations[lang as Language] ? 
                                                        <Badge variant="secondary">Saved</Badge> : 
                                                        <Badge variant="outline">New</Badge>}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {activeNote && (
                                <>
                                    {!activeTranslations[activeLang] && (
                                        <div className="text-center p-3 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                                            This note has not been translated to {languageNames[activeLang]} yet.
                                            <br/>
                                            Content from the English version is pre-filled below.
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <Label htmlFor="visible" className="text-base flex items-center gap-2">
                                            {activeNote.isVisible ? <Eye className="w-5 h-5 text-primary" /> : <EyeOff className="w-5 h-5 text-muted-foreground" />}
                                            Note Visibility
                                        </Label>
                                        <Switch
                                            id="visible"
                                            checked={!!activeNote.isVisible}
                                            onCheckedChange={(checked) => handleFieldChange('isVisible', checked)}
                                            aria-label="Toggle note visibility"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Title</Label>
                                            <Input id="title" value={activeNote.title} onChange={(e) => handleFieldChange('title', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Date</Label>
                                            <Input id="date" type="date" value={format(new Date(activeNote.date), 'yyyy-MM-dd')} onChange={(e) => handleFieldChange('date', new Date(e.target.value))} />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug (auto-generated from English title)</Label>
                                        <Input id="slug" value={activeSlug || ''} disabled className="text-muted-foreground" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="author">Author</Label>
                                            <Input id="author" value={activeNote.author || ''} onChange={(e) => handleFieldChange('author', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="tags">Tags (comma-separated)</Label>
                                            <Input id="tags" value={activeNote.tags?.join(', ') || ''} onChange={(e) => handleArrayChange('tags', e.target.value)} />
                                        </div>
                                    </div>
                                    
                                    <Separator />

                                    <div className="space-y-2">
                                        <Label htmlFor="imageId">Header Image</Label>
                                        <div className="flex gap-2">
                                            <Input id="imageId" value={activeNote.imageId || ''} disabled placeholder="Upload or choose an image"/>
                                            <FilePickerDialog onFileSelect={handleFileSelect}>
                                                <Button variant="outline" size="icon"><FolderSearch className="h-4 w-4"/></Button>
                                            </FilePickerDialog>
                                            <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4" /></Button>
                                            <input type="file" ref={fileInputRef} onChange={handleHeaderImageUpload} accept="image/*" className="hidden" />
                                        </div>
                                    </div>
                                    
                                    <Separator />
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="summary">Summary</Label>
                                        <Textarea id="summary" value={activeNote.summary} onChange={(e) => handleFieldChange('summary', e.target.value)} rows={3} />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="content">Content (Markdown)</Label>
                                        <MarkdownEditor
                                            value={activeNote.content}
                                            onChange={(value) => handleFieldChange('content', value)}
                                            rows={12}
                                        />
                                    </div>
                                </>
                           )}
                        </CardContent>
                    </Card>
                    )
                ) : (
                    <Card className="opacity-0 animate-fade-in-up flex items-center justify-center h-96">
                        <div className="text-center text-muted-foreground">
                            <p>Select a note from the left to begin editing.</p>
                            <p>Or, create a new note to get started.</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}

    
