
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Files } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { logAction } from '@/lib/logger';

type PageStatus = 'Active' | 'Hidden' | 'Maintenance';

type PageInfo = {
  id: string;
  title: string;
  url: string;
  status: PageStatus;
};

const initialPages: PageInfo[] = [
  { id: 'home', title: 'Home (Landing Page)', url: '/', status: 'Active' },
  { id: 'dev-notes-list', title: 'Dev Notes (List)', url: '/dev-notes', status: 'Active' },
  { id: 'dev-notes-detail', title: 'Dev Notes (Detail)', url: '/dev-notes/[slug]', status: 'Active' },
  { id: 'team-list', title: 'Our Team (List)', url: '/creators', status: 'Active' },
  { id: 'team-detail', title: 'Our Team (Detail)', url: '/creators/[slug]', status: 'Active' },
  { id: 'coming-soon', title: 'Coming Soon', url: '/coming-soon', status: 'Active' },
  { id: 'maintenance', title: 'Maintenance', url: '/maintenance', status: 'Active' },
  { id: 'login', title: 'Admin Login', url: '/login', status: 'Hidden' },
  { id: 'admin-dashboard', title: 'Admin Dashboard', url: '/admin', status: 'Hidden' },
  { id: '404', title: '404 Not Found', url: '/404', status: 'Active' },
];

const LOCAL_STORAGE_KEY = 'spekulus-pages-status';

export default function PagesAdminPage() {
    const { toast } = useToast();
    const [pages, setPages] = useState<PageInfo[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const storedPages = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedPages) {
                // Basic validation and merging with initialPages to handle new pages
                const parsedPages: PageInfo[] = JSON.parse(storedPages);
                const pageMap = new Map(parsedPages.map(p => [p.id, p]));
                const mergedPages = initialPages.map(p => pageMap.has(p.id) ? { ...p, status: pageMap.get(p.id)!.status } : p);
                setPages(mergedPages);
            } else {
                setPages(initialPages);
            }
        } catch (error) {
            console.error("Failed to load pages from localStorage", error);
            setPages(initialPages);
        }
        setIsLoaded(true);
    }, []);
    
    const handleStatusChange = (id: string, newStatus: PageStatus) => {
        const pageToUpdate = pages.find(page => page.id === id);
        if (!pageToUpdate) return;
        
        const updatedPages = pages.map(page =>
            page.id === id ? { ...page, status: newStatus } : page
        );
        
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPages));
            setPages(updatedPages);
            toast({ title: "Page Status Updated", description: `Status for ${pageToUpdate.title} changed to ${newStatus}.` });
            logAction('Pages Update', 'Success', `Status for page '${pageToUpdate.title}' changed to ${newStatus}.`);
        } catch (error) {
            console.error("Failed to save pages to localStorage", error);
            toast({ title: "Save Failed", description: "Could not save changes.", variant: 'destructive' });
        }
    };

    const getBadgeVariant = (status: PageStatus): 'default' | 'secondary' | 'destructive' => {
        switch (status) {
            case 'Active': return 'default';
            case 'Hidden': return 'secondary';
            case 'Maintenance': return 'destructive';
            default: return 'secondary';
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
                                <TableHead>URL</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!isLoaded ? (
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
                                    <TableRow key={page.id}>
                                        <TableCell className="font-medium">{page.title}</TableCell>
                                        <TableCell><code className="text-muted-foreground">{page.url}</code></TableCell>
                                        <TableCell>
                                            <Select
                                                value={page.status}
                                                onValueChange={(value: PageStatus) => handleStatusChange(page.id, value)}
                                            >
                                                <SelectTrigger className="w-[140px]">
                                                    <SelectValue>
                                                        <Badge variant={getBadgeVariant(page.status)}>{page.status}</Badge>
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Active">Active</SelectItem>
                                                    <SelectItem value="Hidden">Hidden</SelectItem>
                                                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {page.url.includes('[slug]') || page.id === '404' ? (
                                                <Button variant="outline" size="sm" disabled>
                                                    Go to Page <ExternalLink className="ml-2 h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={page.url} target="_blank" rel="noopener noreferrer">
                                                        Go to Page <ExternalLink className="ml-2 h-4 w-4" />
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
