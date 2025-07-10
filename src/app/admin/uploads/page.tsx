
"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { FolderKanban, ExternalLink } from 'lucide-react';

// Since Cloudinary provides a powerful media library, we link to it instead of rebuilding it.
export default function UploadsManagerPage() {
    const cloudinaryConsoleUrl = `https://cloudinary.com/console/c-6a7593c6628a556f2122849e798f51/media_library/search?q=`;

    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardHeader>
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                           <FolderKanban /> Uploads Manager
                        </CardTitle>
                        <CardDescription>
                            Your files are now managed by Cloudinary.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="text-center py-12">
                <div className="max-w-md mx-auto">
                    <div className="bg-primary/10 p-4 rounded-full inline-block mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>
                    </div>
                    <h3 className="text-2xl font-bold font-headline mb-2">
                        All Assets Hosted on Cloudinary
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        For a powerful and full-featured experience, please use the Cloudinary Media Library to manage your uploaded assets. You can organize, optimize, and transform your media directly from their console.
                    </p>
                    <Button asChild size="lg">
                        <a href={cloudinaryConsoleUrl} target="_blank" rel="noopener noreferrer">
                            Open Cloudinary Console <ExternalLink className="ml-2 h-4 w-4"/>
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
