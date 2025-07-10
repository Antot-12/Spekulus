
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import type { DevNote, Language } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Upload, Wand2, Loader2, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Textarea } from '@/components/ui/textarea';
import { generateImage } from '@/ai/flows/generate-image-flow';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { logAction } from '@/lib/logger';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
    const [isLoading, setIsLoading] = useState(true);
    const [generatingImages, setGeneratingImages] = useState<Record<number, boolean>>({});
    const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

    const fetchNotes = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/dev-notes');
            const data = await response.json();
            if (data.success) {
                // Assuming language-specific notes are not yet implemented in the backend,
                // we'll manage one list of notes for now.
                setNotes(data.notes.sort((a: DevNote, b: DevNote) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } else {
                toast({ title: "Error", description: "Could not fetch developer notes.", variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: "Network Error", description: "Failed to connect to the server.", variant: 'destructive' });
        }
        setIsLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleNoteChange = async (id: number, field: keyof DevNote, value: any) => {
        const updatedNotes = notes.map(note =>
            note.id === id ? { ...note, [field]: value } : note
        );
        setNotes(updatedNotes);
        
        const noteToUpdate = updatedNotes.find(n => n.id === id);
        if (noteToUpdate) {
            try {
                const response = await fetch('/api/dev-notes', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(noteToUpdate),
                });
                const result = await response.json();
                if (!result.success) {
                    toast({ title: "Update Failed", description: "Could not save changes to the server.", variant: 'destructive' });
                    // Revert state if update fails
                    fetchNotes();
                } else {
                     if (field === 'isVisible') {
                        const noteTitle = notes.find(n => n.id === id)?.title || 'Unknown';
                        toast({ title: "Visibility Updated", description: `Note '${noteTitle}' is now ${value ? 'visible' : 'hidden'}.` });
                        logAction('Notes Update', 'Success', `Visibility for note '${noteTitle}' (ID: ${id}) set to ${value ? 'visible' : 'hidden'}.`);
                    }
                }
            } catch (error) {
                 toast({ title: "Network Error", description: "Failed to connect to the server.", variant: 'destructive' });
                 fetchNotes(); // Revert state
            }
        }
    };

    const handleArrayChange = (id: number, field: keyof DevNote, value: string) => {
        const arrayValue = value.split(',').map(s => s.trim()).filter(Boolean);
        handleNoteChange(id, field, arrayValue);
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
                setNotes(prev => [newNote, ...prev]);
                toast({ title: "Note Added", description: "A new draft note has been created." });
                logAction('Notes Update', 'Success', `Added new note 'New Note Title'.`);
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
                setNotes(prev => prev.filter(note => note.id !== noteToDelete.id));
                toast({ title: "Note Deleted", variant: 'destructive' });
                logAction('Notes Update', 'Success', `Deleted note '${noteToDelete.title}'.`);
            } else {
                toast({ title: "Deletion Failed", description: result.error, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: "Network Error", description: "Failed to delete note.", variant: 'destructive' });
        }
    };
    
    const handleHeaderImageUpload = async (noteId: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const note = notes.find(n => n.id === noteId);
        if (!note) {
            toast({ title: "Note not found", variant: "destructive" });
            return;
        }

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
                handleNoteChange(noteId, 'imageUrl', result.url);
                toast({ title: "Image Uploaded", description: "Header image has been updated." });
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
             if (event.target) {
                event.target.value = '';
            }
        }
    };

    const handleHeaderImageGenerate = async (noteId: number, hint: string) => {
        if (!hint) {
            toast({ title: "Hint required", description: "Please provide an AI hint to generate an image.", variant: 'destructive' });
            return;
        }

        const noteTitle = notes.find(n => n.id === noteId)?.title || 'Unknown';
        setGeneratingImages(prev => ({ ...prev, [noteId]: true }));
        toast({ title: "Generating Image...", description: "The AI is creating an image based on your hint. This may take a moment." });

        try {
            const imageUrl = await generateImage(hint);
            await handleNoteChange(noteId, 'imageUrl', imageUrl);
            toast({ title: "Image Generated!", description: "The new header image has been set." });
            logAction('File Upload', 'Success', `Generated image for note '${noteTitle}' with hint: "${hint}"`);
        } catch (error: any) {
            console.error("Image generation error:", error);
            toast({ title: "Generation Failed", description: "The AI could not generate an image. Please try a different hint.", variant: 'destructive' });
            logAction('File Upload', 'Failure', `Failed to generate image for note '${noteTitle}' with hint: "${hint}". Reason: ${error.message}`);
        } finally {
            setGeneratingImages(prev => ({ ...prev, [noteId]: false }));
        }
    };
    
    const handleResetReactions = (noteId: number) => {
        // This still uses localStorage as reactions are per-user, not global.
        try {
            const noteTitle = notes.find(n => n.id === noteId)?.title || 'Unknown Note';
            localStorage.removeItem(`spekulus-reactions-${noteId}`);
            toast({ title: "Reactions Reset", description: `Reactions for note "${noteTitle}" have been cleared from this browser.` });
            logAction('Reactions Reset', 'Success', `Reactions for note ID ${noteId} ("${noteTitle}") have been reset locally.`);
        } catch (error) {
            console.error("Failed to reset reactions", error);
            toast({ title: "Error", description: "Could not reset reactions.", variant: "destructive" });
        }
    };


    return (
        <Card className="opacity-0 animate-fade-in-up">
          <CardHeader>
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div>
                <CardTitle>Manage Developer Notes</CardTitle>
                <CardDescription>Add, edit, or delete notes. Changes are saved to Cloudinary.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleNoteAdd}><PlusCircle className="mr-2 h-4 w-4"/> Add Note</Button>
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
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    ))}
                </div>
            ) : (
                notes.map((note) => (
                  <div key={note.id} className="space-y-4 p-4 border rounded-md">
                    <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                        <div className="space-y-0.5">
                            <Label htmlFor={`visible-${note.id}`} className="text-base flex items-center gap-2">
                                {note.isVisible !== false ? <Eye className="w-5 h-5 text-primary" /> : <EyeOff className="w-5 h-5 text-muted-foreground" />}
                                Note Visibility
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                {note.isVisible !== false ? "This note is visible to the public." : "This note is hidden (draft mode)."}
                            </p>
                        </div>
                        <Switch
                            id={`visible-${note.id}`}
                            checked={note.isVisible !== false}
                            onCheckedChange={(checked) => handleNoteChange(note.id, 'isVisible', checked)}
                            aria-label="Toggle note visibility"
                        />
                    </div>

                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`title-${note.id}`}>Title</Label>
                            <Input id={`title-${note.id}`} value={note.title ?? ''} onChange={(e) => handleNoteChange(note.id, 'title', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`slug-${note.id}`}>Slug (URL)</Label>
                            <Input id={`slug-${note.id}`} value={note.slug ?? ''} onChange={(e) => handleNoteChange(note.id, 'slug', e.target.value)} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`date-${note.id}`}>Date</Label>
                            <Input id={`date-${note.id}`} type="date" value={note.date ?? ''} onChange={(e) => handleNoteChange(note.id, 'date', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`author-${note.id}`}>Author</Label>
                            <Input id={`author-${note.id}`} value={note.author ?? ''} onChange={(e) => handleNoteChange(note.id, 'author', e.target.value)} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`tags-${note.id}`}>Tags (comma-separated)</Label>
                            <Input id={`tags-${note.id}`} value={note.tags?.join(', ') ?? ''} onChange={(e) => handleArrayChange(note.id, 'tags', e.target.value)} placeholder="e.g., Update, API, Bug Fix" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor={`imageUrl-${note.id}`}>Header Image URL</Label>
                             <div className="flex gap-2">
                                <Input 
                                    id={`imageUrl-${note.id}`} 
                                    value={note.imageUrl ?? ''} 
                                    onChange={(e) => handleNoteChange(note.id, 'imageUrl', e.target.value)} 
                                    placeholder="/uploads/image.png or data:image/..."
                                />
                                <Button variant="outline" size="icon" onClick={() => fileInputRefs.current[note.id]?.click()} aria-label="Upload header image">
                                    <Upload className="h-4 w-4" />
                                </Button>
                                <input
                                    type="file"
                                    ref={(el) => (fileInputRefs.current[note.id] = el)}
                                    onChange={(e) => handleHeaderImageUpload(note.id, e)}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`imageHint-${note.id}`}>Header Image AI Hint</Label>
                            <div className="flex gap-2">
                                <Input id={`imageHint-${note.id}`} value={note.imageHint ?? ''} onChange={(e) => handleNoteChange(note.id, 'imageHint', e.target.value)} />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleHeaderImageGenerate(note.id, note.imageHint)}
                                    disabled={generatingImages[note.id]}
                                    aria-label="Generate header image with AI"
                                >
                                    {generatingImages[note.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`summary-${note.id}`}>Summary</Label>
                        <Textarea id={`summary-${note.id}`} value={note.summary ?? ''} onChange={(e) => handleNoteChange(note.id, 'summary', e.target.value)} rows={3} />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor={`content-${note.id}`}>Content</Label>
                        <MarkdownEditor
                            value={note.content ?? ''}
                            onChange={(value) => handleNoteChange(note.id, 'content', value)}
                            rows={12}
                            uploadSubdirectory={`spekulus/dev-notes/${note.slug}`}
                        />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <Button variant="outline" onClick={() => handleResetReactions(note.id)}>
                            <RotateCcw className="mr-2 h-4 w-4"/> Reset Local Reactions
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete the note "{note.title}" and all its assets from Cloudinary. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleNoteDelete(note)}>Delete</AlertDialogAction>
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
