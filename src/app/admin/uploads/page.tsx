
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { logAction } from '@/lib/logger';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { FolderKanban, Trash2, Folder, File, Upload, Search, PlusCircle, ExternalLink, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type CloudinaryResource = {
  asset_id: string;
  public_id: string;
  format: string;
  version: number;
  resource_type: 'image' | 'video' | 'raw' | 'folder';
  type: string;
  created_at: string;
  bytes: number;
  width?: number;
  height?: number;
  folder: string;
  url: string;
  secure_url: string;
  isDirectory: boolean;
  name: string;
  path: string;
};

const getFileIcon = (resource: CloudinaryResource) => {
    if (resource.isDirectory) return <Folder className="h-full w-full" />;
    if (resource.resource_type === 'image') return <ImageIcon className="h-full w-full" />;
    if (resource.resource_type === 'video') return <Video className="h-full w-full" />;
    return <FileText className="h-full w-full" />;
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function UploadsManagerPage() {
    const { toast } = useToast();
    const [files, setFiles] = useState<CloudinaryResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [path, setPath] = useState('spekulus');
    const [searchTerm, setSearchTerm] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchFiles = useCallback(async (currentPath: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/uploads-manager?path=${currentPath}`);
            const data = await response.json();
            if (data.success) {
                setFiles(data.files);
            } else {
                toast({ title: "Error", description: data.error, variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch files from the server.", variant: 'destructive' });
        }
        setIsLoading(false);
    }, [toast]);

    useEffect(() => {
        fetchFiles(path);
    }, [path, fetchFiles]);

    const handleDelete = async (resource: CloudinaryResource) => {
        try {
            const response = await fetch('/api/uploads-manager', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ public_id: resource.path, resource_type: resource.isDirectory ? 'folder' : resource.resource_type }),
            });
            const result = await response.json();
            if (result.success) {
                toast({ title: "Deleted", description: `Successfully deleted ${resource.name}.` });
                logAction('File Delete', 'Success', `Deleted ${resource.isDirectory ? 'folder' : 'file'}: ${resource.path}`);
                fetchFiles(path);
            } else {
                toast({ title: "Deletion Failed", description: result.error, variant: 'destructive' });
                logAction('File Delete', 'Failure', `Failed to delete: ${resource.path}. Reason: ${result.error}`);
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to connect to the server.", variant: 'destructive' });
        }
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName) return;
        try {
            const response = await fetch('/api/uploads-manager', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: path, folderName: newFolderName }),
            });
            const result = await response.json();
            if (result.success) {
                toast({ title: "Folder Created", description: `Folder '${newFolderName}' created successfully.` });
                logAction('Folder Create', 'Success', `Created folder: ${path}/${newFolderName}`);
                setNewFolderName('');
                fetchFiles(path);
            } else {
                toast({ title: "Creation Failed", description: result.error, variant: 'destructive' });
                 logAction('Folder Create', 'Failure', `Failed to create folder '${newFolderName}'. Reason: ${result.error}`);
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to connect to the server.", variant: 'destructive' });
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('subdirectory', path);
        
        toast({ title: "Uploading...", description: `Uploading ${file.name}.` });

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.success) {
                toast({ title: "Upload Complete", description: `${file.name} has been uploaded.` });
                logAction('File Upload', 'Success', `Uploaded file to ${path}: ${result.public_id}`);
                fetchFiles(path);
            } else {
                toast({ title: "Upload Failed", description: result.error, variant: 'destructive' });
                logAction('File Upload', 'Failure', `Failed to upload to ${path}. Reason: ${result.error}`);
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to connect to the server for upload.", variant: 'destructive' });
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const filteredFiles = files.filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const breadcrumbs = path.split('/').filter(Boolean);

    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FolderKanban />Uploads Manager</CardTitle>
                <CardDescription>Browse, upload, and delete files on the Cloudinary server.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 mb-4 p-4 border rounded-lg bg-muted/50 items-center">
                    <div className="relative flex-grow min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Search files in this folder..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <form onSubmit={handleCreateFolder} className="flex gap-2 flex-grow sm:flex-grow-0">
                        <Input placeholder="New folder name..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} />
                        <Button type="submit" variant="outline"><PlusCircle className="mr-2" />Create</Button>
                    </form>
                    <Button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto"><Upload className="mr-2"/>Upload File</Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                </div>

                <div className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
                    <button onClick={() => setPath('spekulus')} className="hover:text-primary">spekulus</button>
                    {breadcrumbs.slice(1).map((crumb, index) => (
                        <React.Fragment key={crumb}>
                            <span>/</span>
                            <button onClick={() => setPath(breadcrumbs.slice(0, index + 2).join('/'))} className="hover:text-primary">{crumb}</button>
                        </React.Fragment>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {isLoading ? [...Array(12)].map((_, i) => (
                        <div key={i} className="aspect-square"><Skeleton className="h-full w-full" /></div>
                    )) : filteredFiles.length > 0 ? filteredFiles.map(file => (
                        <div key={file.asset_id} className="group relative aspect-square border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-primary/20 transition-shadow">
                            {file.isDirectory ? (
                                <button onClick={() => setPath(file.path)} className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-muted-foreground hover:text-primary transition-colors">
                                    <Folder className="h-16 w-16" />
                                    <span className="font-semibold mt-2 truncate w-full">{file.name}</span>
                                </button>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <div className="relative w-full h-full flex-grow">
                                        {file.resource_type === 'image' ? (
                                            <Image src={file.secure_url} alt={file.name} layout="fill" objectFit="cover" className="bg-muted" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full w-full bg-muted p-4 text-muted-foreground">
                                                {getFileIcon(file)}
                                            </div>
                                        )}
                                    </div>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <p className="p-2 text-xs truncate w-full bg-card-foreground/5 text-center">{file.name}</p>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{file.name}</p>
                                                <p className="text-muted-foreground">{formatBytes(file.bytes)}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            )}

                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!file.isDirectory && (
                                     <Button asChild variant="secondary" size="icon" className="h-8 w-8">
                                        <a href={file.secure_url} target="_blank" rel="noopener noreferrer"><ExternalLink /></a>
                                    </Button>
                                )}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete the {file.isDirectory ? 'folder' : 'file'} "{file.name}" and all its contents. This action cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(file)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    )) : (
                        <p className="col-span-full text-center text-muted-foreground py-10">This folder is empty.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
