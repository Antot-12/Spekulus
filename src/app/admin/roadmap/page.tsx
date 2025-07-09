
"use client";

import { useState, useEffect } from 'react';
import { roadmapEvents, type RoadmapEvent, type Language } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logAction } from '@/lib/logger';

const LOCAL_STORAGE_KEY_PREFIX = 'spekulus-roadmap-events-';

const LanguageFlag = ({ lang }: { lang: Language }) => {
    const flags: Record<string, string> = {
      en: '🇬🇧',
      uk: '🇺🇦',
      sk: '🇸🇰',
    };
    return <span className="mr-2 text-base" role="img" aria-label={`${lang} flag`}>{flags[lang]}</span>;
};

const languageNames: Record<Language, string> = {
    en: 'English',
    uk: 'Ukrainian',
    sk: 'Slovak'
};

export default function RoadmapAdminPage() {
    const { toast } = useToast();
    const [roadmap, setRoadmap] = useState<RoadmapEvent[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedLang, setSelectedLang] = useState<Language>('en');

    useEffect(() => {
        setIsLoaded(false);
        const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${selectedLang}`;
        try {
            const storedRoadmap = localStorage.getItem(localStorageKey);
            if (storedRoadmap) {
                setRoadmap(JSON.parse(storedRoadmap));
            } else {
                setRoadmap(roadmapEvents[selectedLang]);
            }
        } catch (error) {
            console.error("Failed to load roadmap from localStorage", error);
            setRoadmap(roadmapEvents[selectedLang]);
        }
        setIsLoaded(true);
    }, [selectedLang]);

    const persistChanges = (newRoadmap: RoadmapEvent[]) => {
        const localStorageKey = `${LOCAL_STORAGE_KEY_PREFIX}${selectedLang}`;
        try {
            localStorage.setItem(localStorageKey, JSON.stringify(newRoadmap));
            setRoadmap(newRoadmap);
        } catch (error) {
            console.error("Failed to save roadmap to localStorage", error);
            toast({ title: "Save Failed", description: "Could not save changes.", variant: 'destructive' });
        }
    };

    const handleSave = () => {
        persistChanges(roadmap);
        toast({ title: "Saved!", description: `All roadmap changes for ${languageNames[selectedLang]} have been saved.`});
        logAction('Roadmap Update', 'Success', `Saved all changes for ${languageNames[selectedLang]} roadmap.`);
    };

    const handleRoadmapChange = (index: number, field: keyof RoadmapEvent, value: string) => {
        const updatedRoadmap = roadmap.map((event, i) =>
            i === index ? { ...event, [field]: value } : event
        );
        setRoadmap(updatedRoadmap);
    };

    const handleRoadmapAdd = () => {
        const newEvent: RoadmapEvent = { date: new Date().toISOString().split('T')[0], title: 'New Event', description: 'Description...' };
        const newRoadmap = [...roadmap, newEvent];
        persistChanges(newRoadmap);
        toast({ title: "Roadmap Event Added", description: "A new event has been added and saved." });
        logAction('Roadmap Update', 'Success', `Added new roadmap event for ${languageNames[selectedLang]}.`);
    };
    
    const handleRoadmapDelete = (indexToDelete: number) => {
        const eventToDelete = roadmap[indexToDelete];
        const newRoadmap = roadmap.filter((_, index) => index !== indexToDelete);
        persistChanges(newRoadmap);
        toast({ title: "Roadmap Event Deleted", variant: 'destructive'});
        logAction('Roadmap Update', 'Success', `Deleted roadmap event "${eventToDelete?.title}" for ${languageNames[selectedLang]}.`);
    };

    return (
        <Card className="opacity-0 animate-fade-in-up">
          <CardHeader>
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <CardTitle>Manage Roadmap</CardTitle>
                    <CardDescription>Update project milestones. Changes are saved to your browser.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Select value={selectedLang} onValueChange={(value) => setSelectedLang(value as Language)}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue>
                                <div className="flex items-center">
                                    <LanguageFlag lang={selectedLang} />
                                    {languageNames[selectedLang]}
                                </div>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="en"><LanguageFlag lang="en" /> {languageNames['en']}</SelectItem>
                           <SelectItem value="uk"><LanguageFlag lang="uk" /> {languageNames['uk']}</SelectItem>
                           <SelectItem value="sk"><LanguageFlag lang="sk" /> {languageNames['sk']}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleRoadmapAdd}><PlusCircle className="mr-2 h-4 w-4"/> Add Event</Button>
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Save Changes</Button>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isLoaded ? (
                <div className="space-y-6">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="space-y-2 p-4 border rounded-md">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-48" />
                                <Skeleton className="h-10 flex-grow" />
                                <Skeleton className="h-10 w-10" />
                            </div>
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ))}
                </div>
            ) : (
                roadmap.map((event, index) => (
                  <div key={index} className="space-y-2 p-4 border rounded-md">
                    <div className="flex items-center gap-4">
                      <Input 
                        type="text" 
                        value={event.date}
                        onChange={(e) => handleRoadmapChange(index, 'date', e.target.value)}
                        placeholder="YYYY-MM-DD or Q4 2025"
                        className="w-48 transition-colors focus:border-primary" />
                      <Input 
                        value={event.title}
                        onChange={(e) => handleRoadmapChange(index, 'title', e.target.value)}
                        className="flex-grow transition-colors focus:border-primary" />
                      <Button variant="destructive" size="icon" onClick={() => handleRoadmapDelete(index)}>
                        <Trash2 className="h-4 w-4"/>
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                    <Textarea 
                        value={event.description}
                        onChange={(e) => handleRoadmapChange(index, 'description', e.target.value)}
                        className="transition-colors focus:border-primary"
                     />
                  </div>
                ))
            )}
          </CardContent>
        </Card>
    );
}
