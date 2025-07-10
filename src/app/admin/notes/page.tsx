
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { DevNote } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Upload, Wand2, Loader2, Eye, EyeOff, RotateCcw, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { logAction } from '@/lib/logger';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';

const newNoteContentExample = `### This is a Subheading

This is a paragraph of text. You can use **bold**, *italics*, or ~~strikethrough~~. You can even <u>underline text</u>.

> This is a blockquote, perfect for highlighting a key takeaway.

- Here is a list item
- And another one

[This is a link to Google](https://google.com)
`;

export default function NotesAdminPage() {
    const { toast } = useToast();
    const [notes, setNotes] = useState<DevNote[]>([]);
    const [activeNote, setActiveNote] = useState<DevNote | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});
    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    const fetchNotes = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/dev-notes');
            const data = await response.json();
            if (data.success) {
                const sortedNotes = data.notes.sort((a: DevNote, b: DevNote) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setNotes(sortedNotes);
                // If an active note was being edited, refresh its state from the fetched data
                if (activeNote) {
                    setActiveNote(sortedNotes.find(n => n.id === activeNote.id) || null);
                }
            } else {
                toast({ title: "Error", description: "Could not fetch developer notes.", variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: "Network Error", description: "Failed to connect to the server.", variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [toast, activeNote]);

    useEffect(() => {
        fetchNotes();
    }, []); // Run only once on mount

    const handleFieldChange = (field: keyof DevNote, value: any) => {
        if (!activeNote) return;
        setActiveNote(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleArrayChange = (field: keyof DevNote, value: string) => {
        const arrayValue = value.split(',').map(s => s.trim()).filter(Boolean);
        handleFieldChange(field, arrayValue);
    };
    
    const handleSaveNote = async () => {
        if (!activeNote) return;
        setIsSaving(true);
        try {
            const response = await fetch('/api/dev-notes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activeNote),
            });
            const result = await response.json();
            if (result.success) {
                toast({ title: "Note Saved", description: `"${activeNote.title}" has been updated.` });
                logAction('Notes Update', 'Success', `Saved changes for note '${activeNote.title}'.`);
                // Refresh the list to show the updated data
                fetchNotes();
            } else {
                toast({ title: "Update Failed", description: result.error || "Could not save changes to the server.", variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: "Network Error", description: "Failed to connect to the server.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleNoteAdd = async () => {
        const slug = `new-note-${Date.now()}`;
        const newNote: DevNote = {
            id: Date.now(),
            title: 'New Note Title',
            slug: slug,
            date: new Date().toISOString().split('T')[0],
            summary: 'A brief summary of the new note.',
            content: newNoteContentExample,
            imageUrl: 'https://placehold.co/1200x600.png',
            imageHint: 'placeholder image',
            author: 'Spekulus Team',
            tags: ['Update'],
            isVisible: false,
            reactionCounts: {},
        };

        try {
            const response = await fetch('/api/dev-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNote),
            });
            const result = await response.json();
            if (result.success) {
                toast({ title: "Note Added", description: "A new draft note has been created." });
                logAction('Notes Update', 'Success', `Added new note 'New Note Title'.`);
                await fetchNotes(); // Refresh list
                setActiveNote(newNote); // Set the new note as active for editing
            } else {
                toast({ title: "Creation Failed", description: result.error, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: "Network Error", description: "Failed to create note.", variant: 'destructive' });
        }
    };

    const handleNoteDelete = async (noteToDelete: DevNote) => {
        try {
            const response = await fetch(`/api/dev-notes?slug=${noteToDelete.slug}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (result.success) {
                toast({ title: "Note Deleted", variant: 'destructive' });
                logAction('Notes Update', 'Success', `Deleted note '${noteToDelete.title}'.`);
                if (activeNote?.id === noteToDelete.id) {
                    setActiveNote(null);
                }
                fetchNotes();
            } else {
                toast({ title: "Deletion Failed", description: result.error, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: "Network Error", description: "Failed to delete note.", variant: 'destructive' });
        }
    };
    
    const handleHeaderImageUpload = async (note: DevNote, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('subdirectory', `spekulus/dev-notes/${note.slug}`);
        
        toast({ title: "Uploading...", description: "Please wait while the header image is uploaded." });

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.success) {
                handleFieldChange('imageUrl', result.url);
                toast({ title: "Image Uploaded", description: "Header image has been updated. Save the note to persist this change." });
                logAction('File Upload', 'Success', `Uploaded image for note '${note.title}': ${result.url}`);
            } else {
                toast({ title: "Upload Failed", description: result.error || "Could not upload image.", variant: 'destructive' });
                logAction('File Upload', 'Failure', `Failed to upload image for note '${note.title}'. Reason: ${result.error}`);
            }
        } catch (error: any) {
            console.error("Header image upload error:", error);
            toast({ title: "Upload Failed", description: "An error occurred during upload.", variant: 'destructive' });
            logAction('File Upload', 'Failure', `Failed to upload image for note '${note.title}'. Reason: ${error.message}`);
        } finally {
             if (event.target) event.target.value = '';
        }
    };

    const handleHeaderImageGenerate = async (note: DevNote, hint: string) => {
        if (!hint) {
            toast({ title: "Hint required", description: "Please provide an AI hint to generate an image.", variant: 'destructive' });
            return;
        }

        setGeneratingImages(prev => ({ ...prev, [note.id]: true }));
        toast({ title: "Generating Image...", description: "The AI is creating an image..." });

        try {
            const imageUrl = await generateImage(hint);
            handleFieldChange('imageUrl', imageUrl);
            toast({ title: "Image Generated!", description: "The new header image has been set. Save the note to persist this change." });
            logAction('File Upload', 'Success', `Generated image for note '${note.title}' with hint: "${hint}"`);
        } catch (error: any) {
            toast({ title: "Generation Failed", description: "The AI could not generate an image. Please try a different hint.", variant: 'destructive' });
            logAction('File Upload', 'Failure', `Failed to generate image for note '${note.title}' with hint: "${hint}". Reason: ${error.message}`);
        } finally {
            setGeneratingImages(prev => ({ ...prev, [note.id]: false }));
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
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {isLoading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                            </div>
                        ) : (
                            notes.map(note => (
                                <Button
                                    key={note.id}
                                    variant={activeNote?.id === note.id ? "secondary" : "ghost"}
                                    onClick={() => setActiveNote(note)}
                                    className="w-full justify-between"
                                >
                                    <span className="truncate">{note.title}</span>
                                    <Badge variant={note.isVisible ? "default" : "outline"}>
                                        {note.isVisible ? "Visible" : "Draft"}
                                    </Badge>
                                </Button>
                            ))
                        )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                {activeNote ? (
                    <Card className="opacity-0 animate-fade-in-up">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Editing Note</CardTitle>
                                    <CardDescription>Change the details and save your work.</CardDescription>
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
                                                    This will permanently delete the note "{activeNote.title}" and all its assets. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleNoteDelete(activeNote)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <Button onClick={handleSaveNote} disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                                <Label htmlFor="visible" className="text-base flex items-center gap-2">
                                    {activeNote.isVisible ? <Eye className="w-5 h-5 text-primary" /> : <EyeOff className="w-5 h-5 text-muted-foreground" />}
                                    Note Visibility
                                </Label>
                                <Switch
                                    id="visible"
                                    checked={activeNote.isVisible}
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
                                    <Input id="date" type="date" value={activeNote.date} onChange={(e) => handleFieldChange('date', e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="author">Author</Label>
                                    <Input id="author" value={activeNote.author} onChange={(e) => handleFieldChange('author', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                                    <Input id="tags" value={activeNote.tags?.join(', ') || ''} onChange={(e) => handleArrayChange('tags', e.target.value)} />
                                </div>
                            </div>
                            
                            <Separator />

                            <div className="space-y-2">
                                <Label htmlFor="imageUrl">Header Image URL</Label>
                                <div className="flex gap-2">
                                    <Input id="imageUrl" value={activeNote.imageUrl} onChange={(e) => handleFieldChange('imageUrl', e.target.value)} />
                                    <Button variant="outline" size="icon" onClick={() => fileInputRefs.current[activeNote.id]?.click()}><Upload className="h-4 w-4" /></Button>
                                    <input type="file" ref={(el) => (fileInputRefs.current[activeNote.id] = el)} onChange={(e) => handleHeaderImageUpload(activeNote, e)} accept="image/*" className="hidden" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="imageHint">Header Image AI Hint</Label>
                                <div className="flex gap-2">
                                    <Input id="imageHint" value={activeNote.imageHint} onChange={(e) => handleFieldChange('imageHint', e.target.value)} />
                                    <Button variant="outline" size="icon" onClick={() => handleHeaderImageGenerate(activeNote, activeNote.imageHint)} disabled={generatingImages[activeNote.id]}><Wand2 className="h-4 w-4" /></Button>
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
                                    uploadSubdirectory={`spekulus/dev-notes/${activeNote.slug}`}
                                />
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <Button variant="outline" onClick={() => handleResetReactions(activeNote.id)}>
                                    <RotateCcw className="mr-2 h-4 w-4"/> Reset Local Reactions
                                </Button>
                            </div>

                        </CardContent>
                    </Card>
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

const handleResetReactions = (noteId: number) => {
    // This functionality is purely client-side as reactions are per-user.
    // In a real app with user accounts, this would be a server call.
    try {
        const userReactionKey = `spekulus-user-reaction-${noteId}`;
        localStorage.removeItem(userReactionKey);
        // Note: We are not resetting the global counts here, just the user's vote.
        // A full implementation would require a backend to store reaction counts.
        alert(`Your personal reactions for this note have been cleared from this browser.`);
    } catch (error) {
        console.error("Failed to reset reactions", error);
    }
};

