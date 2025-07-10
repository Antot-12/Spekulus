
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
        <div className="text-center p-8 text-muted-foreground">
            <h2 className="text-xl font-semibold">Uploads Manager Disabled</h2>
            <p className="mt-2">This feature has been temporarily removed.</p>
        </div>
    );
}
