
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function UploadsManagerPage() {
    const cloudinaryUrl = `https://cloudinary.com/console/c-ab7365c276f82c3c6d485d45012b18/media_library/search?q=`;

    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardHeader>
                <div className="flex flex-wrap gap-4 justify-between items-center">
                    <div>
                        <CardTitle>Cloudinary Media Library</CardTitle>
                        <CardDescription>File uploads are now managed by Cloudinary for better performance and scalability.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="text-center">
                <Cloud className="mx-auto h-24 w-24 text-primary/30 my-8" />
                <p className="mb-4 text-lg">Your media files are securely stored and optimized in the cloud.</p>
                <p className="text-muted-foreground mb-8">
                    To manage your uploaded assets, please use the powerful interface provided directly by Cloudinary.
                </p>
                <Button asChild size="lg">
                    <a href={cloudinaryUrl} target="_blank" rel="noopener noreferrer">
                        Open Cloudinary Console
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                </Button>
            </CardContent>
        </Card>
    );
}
