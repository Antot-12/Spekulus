
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Folder, FileText, Trash2, Loader2, RefreshCw, AlertTriangle, Search, Calendar as CalendarIcon, FileImage, FileVideo, FileArchive, X, FolderPlus, Upload, Home, ChevronRight, ArrowUpDown, LayoutGrid, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Label } from '@/components/ui/label';
import { logAction } from '@/lib/logger';

type FileInfo = {
  name: string;
  path: string;
  size: number;
  mtime: number;
  isDirectory: boolean;
  children?: FileInfo[];
};

type SortConfig = {
    key: keyof FileInfo | 'type';
    direction: 'asc' | 'desc';
};

// Helper Functions
const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return '';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) return 'image';
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension)) return 'document';
    if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) return 'video';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return 'archive';
    return 'other';
};

const FileTypeIcon = ({ file, className = "w-5 h-5 text-muted-foreground" }: { file: FileInfo, className?: string }) => {
    if (file.isDirectory) return <Folder className={cn(className, "text-primary")} />;
    const type = getFileType(file.name);
    switch(type) {
        case 'image': return <FileImage className={className} />;
        case 'document': return <FileText className={className} />;
        case 'video': return <FileVideo className={className} />;
        case 'archive': return <FileArchive className={className} />;
        default: return <FileText className={className} />;
    }
};

const getFilesForPath = (files: FileInfo[], path: string[]): FileInfo[] => {
    if (path.length === 0) return files;
    let currentLevel = files;
    for (const segment of path) {
        const folder = currentLevel.find(f => f.isDirectory && f.name === segment);
        if (folder && folder.children) {
            currentLevel = folder.children;
        } else {
            return [];
        }
    }
    return currentLevel;
};


export default function UploadsManagerPage() {
    const { toast } = useToast();
    const [allFiles, setAllFiles] = useState<FileInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Navigation and Filtering State
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    // Display State
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
    
    // Dialog/Action State
    const [itemToDelete, setItemToDelete] = useState<FileInfo | null>(null);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFiles = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/uploads-manager');
            const data = await response.json();
            if (data.success) {
                setAllFiles(data.files);
            } else {
                throw new Error(data.error || 'Failed to fetch files.');
            }
        } catch (e: any) {
            setError(e.message);
            toast({ title: "Error", description: e.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);
    
    // --- API Handlers ---
    const handleDelete = async () => {
        if (!itemToDelete) return;
        try {
            const response = await fetch('/api/uploads-manager', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: itemToDelete.path, isDirectory: itemToDelete.isDirectory }),
            });
            const result = await response.json();
            if (result.success) {
                toast({ title: "Item Deleted", description: `Successfully deleted ${itemToDelete.name}.` });
                logAction(itemToDelete.isDirectory ? 'Folder Delete' : 'File Delete', 'Success', `Deleted: ${itemToDelete.path}`);
                fetchFiles();
            } else {
                throw new Error(result.error || 'Failed to delete item.');
            }
        } catch (e: any) {
            toast({ title: "Deletion Failed", description: e.message, variant: 'destructive' });
            logAction(itemToDelete.isDirectory ? 'Folder Delete' : 'File Delete', 'Failure', `Failed to delete: ${itemToDelete.path}. Reason: ${e.message}`);
        } finally {
            setItemToDelete(null);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            toast({ title: "Invalid Name", description: "Folder name cannot be empty.", variant: "destructive" });
            return;
        }
        const newPath = currentPath.join('/');
        try {
            const response = await fetch('/api/uploads-manager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: newPath, folderName: newFolderName }),
            });
            const result = await response.json();
            if (result.success) {
                toast({ title: "Folder Created", description: `Successfully created folder '${newFolderName}'.` });
                logAction('Folder Create', 'Success', `Created folder '${newFolderName}' in /uploads/${newPath}`);
                setNewFolderName("");
                setIsCreateFolderOpen(false);
                fetchFiles();
            } else {
                throw new Error(result.error || 'Failed to create folder.');
            }
        } catch (e: any) {
            toast({ title: "Creation Failed", description: e.message, variant: 'destructive' });
            logAction('Folder Create', 'Failure', `Failed to create folder '${newFolderName}' in /uploads/${newPath}. Reason: ${e.message}`);
        }
    };
    
    const handleUpload = async (files: FileList) => {
        if (!files.length) return;
        setIsUploading(true);
        
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subdirectory', currentPath.join('/'));

        try {
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const result = await response.json();

            if (result.success) {
                toast({ title: "Upload Successful", description: `${file.name} has been uploaded.` });
                logAction('File Upload', 'Success', `Uploaded file '${file.name}' to ${result.url}`);
                fetchFiles();
            } else {
                throw new Error(result.error || "Could not upload file.");
            }
        } catch (error: any) {
            toast({ title: "Upload Failed", description: error.message, variant: 'destructive' });
            logAction('File Upload', 'Failure', `Failed to upload file '${file.name}'. Reason: ${error.message}`);
        } finally {
            setIsUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // --- Derived State & Memoized Logic ---
    const displayedFiles = useMemo(() => {
        let items = getFilesForPath(allFiles, currentPath);

        // Filtering
        if (searchTerm) {
            items = items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (dateRange?.from) {
            items = items.filter(item => {
                const toDate = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
                toDate.setHours(23, 59, 59, 999);
                return item.mtime >= dateRange.from!.getTime() && item.mtime <= toDate.getTime();
            });
        }

        // Sorting
        return [...items].sort((a, b) => {
            // Always show folders first
            if (a.isDirectory !== b.isDirectory) {
                return a.isDirectory ? -1 : 1;
            }
            
            const valA = sortConfig.key === 'type' ? (a.isDirectory ? 'folder' : getFileType(a.name)) : a[sortConfig.key];
            const valB = sortConfig.key === 'type' ? (b.isDirectory ? 'folder' : getFileType(b.name)) : b[sortConfig.key];
            
            if (valA === undefined || valB === undefined) return 0;

            let comparison = 0;
            if (typeof valA === 'string' && typeof valB === 'string') {
                comparison = valA.localeCompare(valB);
            } else if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            }

            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [allFiles, currentPath, searchTerm, dateRange, sortConfig]);

    const handleSort = (key: SortConfig['key']) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };
    
    const breadcrumbs = useMemo(() => {
        const parts = [{ name: 'Uploads', path: [] as string[] }];
        let cumulativePath: string[] = [];
        for (const segment of currentPath) {
            cumulativePath.push(segment);
            parts.push({ name: segment, path: [...cumulativePath] });
        }
        return parts;
    }, [currentPath]);

    // --- Render ---
    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardHeader>
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div>
                        <CardTitle>Uploads Manager</CardTitle>
                        <CardDescription>View, search, and manage uploaded files on the server.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Toolbar */}
                <div className="flex flex-wrap gap-2 mb-4 border-b pb-4">
                    <div className="flex flex-wrap gap-2 flex-grow">
                        <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline"><FolderPlus className="mr-2"/> New Folder</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Create New Folder</DialogTitle><DialogDescription>Enter a name for the new folder in <code className="bg-muted px-1 rounded">/uploads/{currentPath.join('/')}</code></DialogDescription></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="folderName" className="text-right">Name</Label>
                                        <Input id="folderName" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="col-span-3" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                                    <Button onClick={handleCreateFolder}>Create</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                            {isUploading ? <Loader2 className="mr-2 animate-spin" /> : <Upload className="mr-2"/>}
                            {isUploading ? "Uploading..." : "Upload File"}
                        </Button>
                        <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleUpload(e.target.files)} className="hidden"/>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('list')}><List/></Button>
                        <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}><LayoutGrid/></Button>
                    </div>
                </div>

                {/* Breadcrumbs & Search */}
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                    <div className="flex items-center gap-1 text-sm bg-muted p-2 rounded-md flex-grow overflow-x-auto">
                        <button onClick={() => setCurrentPath([])} className="p-1 rounded-md hover:bg-background"><Home className="w-4 h-4 text-primary"/></button>
                        {breadcrumbs.slice(1).map((crumb, index) => (
                           <React.Fragment key={index}>
                                <ChevronRight className="w-4 h-4 text-muted-foreground"/>
                                <button onClick={() => setCurrentPath(crumb.path)} className="px-2 py-1 rounded-md hover:bg-background whitespace-nowrap">{crumb.name}</button>
                           </React.Fragment>
                        ))}
                    </div>
                    <div className="relative flex-shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Search current folder..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full md:w-64" />
                    </div>
                </div>

                {isLoading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                : error ? <div className="flex flex-col items-center justify-center text-center text-destructive p-8 bg-destructive/10 rounded-md"><AlertTriangle className="h-12 w-12 mb-4"/><p className="font-bold text-lg">An Error Occurred</p><p>{error}</p></div>
                : (
                    <>
                        {/* Table View */}
                        {viewMode === 'list' && (
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="cursor-pointer hover:bg-muted" onClick={() => handleSort('name')}><div className="flex items-center gap-2">Name <ArrowUpDown className="w-3 h-3"/></div></TableHead>
                                            <TableHead className="cursor-pointer hover:bg-muted w-[120px] text-right" onClick={() => handleSort('size')}><div className="flex items-center justify-end gap-2">Size <ArrowUpDown className="w-3 h-3"/></div></TableHead>
                                            <TableHead className="cursor-pointer hover:bg-muted w-[180px] text-right" onClick={() => handleSort('mtime')}><div className="flex items-center justify-end gap-2">Last Modified <ArrowUpDown className="w-3 h-3"/></div></TableHead>
                                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {displayedFiles.length > 0 ? displayedFiles.map(file => (
                                            <TableRow key={file.path} className="group hover:bg-muted/50">
                                                <TableCell>
                                                    <button onClick={() => file.isDirectory && setCurrentPath(prev => [...prev, file.name])} disabled={!file.isDirectory} className="flex items-center gap-2 w-full text-left disabled:cursor-default">
                                                        <FileTypeIcon file={file} /> {file.name}
                                                    </button>
                                                </TableCell>
                                                <TableCell className="text-right font-mono text-sm">{formatBytes(file.size)}</TableCell>
                                                <TableCell className="text-right font-mono text-sm">{format(new Date(file.mtime), "yyyy-MM-dd HH:mm")}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="destructive" size="icon" onClick={() => setItemToDelete(file)}>
                                                        <Trash2 className="h-4 w-4"/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : <TableRow><TableCell colSpan={4} className="h-24 text-center">This folder is empty.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        {/* Grid View */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {displayedFiles.length > 0 ? displayedFiles.map(file => (
                                    <div key={file.path} className="relative group aspect-square flex flex-col items-center justify-center text-center bg-muted rounded-md p-2 border hover:border-primary/50"
                                        onDoubleClick={() => file.isDirectory && setCurrentPath(prev => [...prev, file.name])}
                                    >
                                        {getFileType(file.name) === 'image' ? (
                                             <Image src={`/uploads/${file.path}`} alt={file.name} layout="fill" objectFit="cover" className="rounded-md"/>
                                        ) : (
                                            <FileTypeIcon file={file} className="w-16 h-16"/>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-2 rounded-b-md">
                                            <p className="text-white text-xs truncate">{file.name}</p>
                                        </div>
                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setItemToDelete(file)}><Trash2 className="h-4 w-4"/></Button>
                                        </div>
                                    </div>
                                )) : <div className="col-span-full h-24 text-center flex items-center justify-center text-muted-foreground">This folder is empty.</div>}
                            </div>
                        )}
                    </>
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the {itemToDelete?.isDirectory ? 'folder' : 'file'} <code className="bg-muted px-1 py-0.5 rounded">{itemToDelete?.name}</code> and all its contents from the server.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            </CardContent>
        </Card>
    );
}
