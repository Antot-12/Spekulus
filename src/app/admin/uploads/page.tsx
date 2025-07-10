
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { logAction } from '@/lib/logger';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { FolderKanban, Trash2, Folder, File, Upload, FolderUp, Search, PlusCircle, ExternalLink, Image as ImageIcon, Video, FileText } from 'lucide-react';
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
                body: JSON.stringify({ public_id: resource.path, resource_type: resource.resource_type === 'folder' ? 'folder' : resource.resource_type }),
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
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <CardHeader>
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2"><FolderKanban /> Uploads Manager</CardTitle>
                        <CardDescription>Browse, upload, and manage your Cloudinary assets.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row gap-2 mb-4 p-2 border rounded-lg bg-muted/50">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Search in current folder..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <form onSubmit={handleCreateFolder} className="flex gap-2">
                        <Input placeholder="New folder name..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} />
                        <Button type="submit" disabled={!newFolderName}><PlusCircle className="mr-2 h-4 w-4" />Create</Button>
                    </form>
                    <Button onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Upload File</Button>
                </div>

                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 mb-4 text-sm">
                    <Button variant="link" className="p-0 h-auto" onClick={() => setPath('spekulus')}>spekulus</Button>
                    {breadcrumbs.slice(1).map((crumb, index) => {
                        const currentPath = breadcrumbs.slice(0, index + 2).join('/');
                        return (
                            <React.Fragment key={index}>
                                <span className="text-muted-foreground">/</span>
                                <Button variant="link" className="p-0 h-auto" onClick={() => setPath(currentPath)}>{crumb}</Button>
                            </React.Fragment>
                        );
                    })}
                </div>
                
                {/* Files Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {isLoading ? [...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)
                    : filteredFiles.length > 0 ? filteredFiles.map(file => (
                        <Card key={file.asset_id || file.path} className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                            <div
                                className="aspect-square w-full bg-muted flex items-center justify-center cursor-pointer"
                                onClick={() => file.isDirectory && setPath(file.path)}
                            >
                                {file.resource_type === 'image' || file.resource_type === 'video' ? (
                                    <Image src={file.secure_url} alt={file.name} layout="fill" objectFit="cover" />
                                ) : (
                                    <div className="p-4 text-primary">{getFileIcon(file)}</div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-2 flex flex-col justify-end">
                                <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatBytes(file.bytes || 0)}</p>
                                        <p className="text-xs text-muted-foreground">{format(new Date(file.created_at), 'MMM dd, yyyy')}</p>
                                    </TooltipContent>
                                </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon" className="h-7 w-7"><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will permanently delete `{file.name}`. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(file)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                {file.secure_url && (
                                   <Button asChild variant="secondary" size="icon" className="h-7 w-7">
                                       <a href={file.secure_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                                   </Button>
                                )}
                            </div>
                        </Card>
                    )) : (
                         <div className="col-span-full text-center py-16 text-muted-foreground">
                            <p className="text-lg">This folder is empty.</p>
                            <p>Upload a file or create a new folder to get started.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
