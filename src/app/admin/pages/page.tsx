
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Files, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { logAction } from '@/lib/logger';
import { getPages, updatePageStatus, type PageStatus, type PageInfo } from '@/lib/db/actions';

const getBadgeVariant = (status: PageStatus): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
        case 'active': return 'default';
        case 'hidden': return 'secondary';
        case 'maintenance': return 'destructive';
        default: return 'secondary';
    }
};

export default function PagesAdminPage() {
    const { toast } = useToast();
    const [pages, setPages] = useState<PageInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPages = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getPages();
            setPages(data);
        } catch (error) {
            console.error("Failed to load pages from database", error);
            toast({ title: "Fetch Error", description: "Could not load page statuses.", variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);
    
    const handleStatusChange = async (path: string, newStatus: PageStatus) => {
        const originalPages = [...pages];
        const pageToUpdate = pages.find(page => page.path === path);
        if (!pageToUpdate) return;
        
        // Optimistically update UI
        setPages(pages.map(p => p.path === path ? { ...p, status: newStatus } : p));

        try {
            await updatePageStatus(path, newStatus);
            toast({ title: "Page Status Updated", description: `Status for ${pageToUpdate.title} changed to ${newStatus}.` });
            logAction('Pages Update', 'Success', `Status for page '${pageToUpdate.title}' changed to ${newStatus}.`);
        } catch (error) {
            console.error("Failed to update page status", error);
            // Revert UI on failure
            setPages(originalPages);
            toast({ title: "Update Failed", description: "Could not save changes to the database.", variant: 'destructive' });
        }
    };

    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardHeader>
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Files /> Pages Overview</CardTitle>
                        <CardDescription>Manage the status and visibility of your site's pages. Changes are saved automatically.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Page Title</TableHead>
                                <TableHead>URL Path</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-10 w-24 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                pages.map((page) => (
                                    <TableRow key={page.path}>
                                        <TableCell className="font-medium">{page.title}</TableCell>
                                        <TableCell><code className="text-muted-foreground">{page.path}</code></TableCell>
                                        <TableCell>
                                            <Select
                                                value={page.status}
                                                onValueChange={(value: PageStatus) => handleStatusChange(page.path, value)}
                                            >
                                                <SelectTrigger className="w-[140px]">
                                                    <SelectValue>
                                                        <Badge variant={getBadgeVariant(page.status)}>{page.status}</Badge>
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="hidden">Hidden</SelectItem>
                                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {page.path.includes('[slug]') || page.path === '/404' ? (
                                                <Button variant="outline" size="sm" disabled>
                                                    View Page <ExternalLink className="ml-2 h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={page.path} target="_blank" rel="noopener noreferrer">
                                                        View Page <ExternalLink className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
