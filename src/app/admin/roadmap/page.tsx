
"use client";

import { useState, useEffect, useCallback } from 'react';
import { type RoadmapEvent, type Language } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, PlusCircle, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRoadmapEvents, updateRoadmapEvents, createRoadmapEvent } from '@/lib/db/actions';
import { initialData } from '@/lib/data';


type AllRoadmapData = Record<Language, RoadmapEvent[]>;

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
    const [allData, setAllData] = useState<AllRoadmapData | null>(null);
    const [roadmap, setRoadmap] = useState<RoadmapEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedLang, setSelectedLang] = useState<Language>('en');
    const [actor, setActor] = useState('admin');

    useEffect(() => {
        const adminUser = localStorage.getItem('admin_user') || 'admin';
        setActor(adminUser);
    }, []);

    const fetchData = useCallback(async (lang: Language): Promise<RoadmapEvent[]> => {
        try {
            const data = await getRoadmapEvents(lang);
            if (data && data.length > 0) {
                return data;
            }
            console.warn(`No content found for ${lang}/roadmap, using default data.`);
            return initialData.roadmapEvents[lang].map((item, index) => ({...item, id: index}));
        } catch (error) {
            console.error(`Failed to fetch roadmap data for ${lang}, falling back to default.`, error);
            toast({ title: "Fetch Error", description: `Could not load roadmap data for ${languageNames[lang]}.`, variant: "destructive" });
            return initialData.roadmapEvents[lang].map((item, index) => ({...item, id: index}));
        }
    }, [toast]);

    useEffect(() => {
        const loadAllData = async () => {
            setIsLoading(true);
            const enData = await fetchData('en');
            const ukData = await fetchData('uk');
            const skData = await fetchData('sk');
            const newAllData = { en: enData, uk: ukData, sk: skData };
            setAllData(newAllData);
            setRoadmap(newAllData[selectedLang] || []);
            setIsLoading(false);
        };
        loadAllData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (allData) {
            setRoadmap(allData[selectedLang] || []);
        }
    }, [selectedLang, allData]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const eventsToSave = roadmap.map(({ id, ...rest }) => rest);
            await updateRoadmapEvents(selectedLang, eventsToSave, actor);
            toast({ title: "Saved!", description: `All roadmap changes for ${languageNames[selectedLang]} have been saved.`});
            const updatedData = await fetchData(selectedLang);
            const updatedAllData = { ...allData, [selectedLang]: updatedData };
            setAllData(updatedAllData as AllRoadmapData);
            setRoadmap(updatedData);
        } catch (error) {
            toast({ title: "Save Failed", description: "An error occurred during save.", variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const updateState = (newRoadmap: RoadmapEvent[]) => {
        setRoadmap(newRoadmap);
    };

    const handleRoadmapChange = (id: number, field: keyof Omit<RoadmapEvent, 'id'>, value: string) => {
        const updatedRoadmap = roadmap.map((event) =>
            event.id === id ? { ...event, [field]: value } : event
        );
        updateState(updatedRoadmap);
    };

    const handleRoadmapAdd = async () => {
        const newEventData = { date: new Date().toISOString().split('T')[0], title: 'New Event', description: 'Description...' };
        try {
            const newEvent = await createRoadmapEvent(selectedLang, newEventData, actor);
            if (newEvent) {
                updateState([...roadmap, newEvent]);
                toast({ title: "Roadmap Event Added", description: "A new event has been added. Remember to save." });
            } else {
                 toast({ title: "Add Failed", description: "Could not add event.", variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: "Add Failed", description: "Could not add event.", variant: 'destructive' });
        }
    };
    
    const handleRoadmapDelete = (idToDelete: number) => {
        updateState(roadmap.filter((event) => event.id !== idToDelete));
        toast({ title: "Roadmap Event Deleted", variant: 'destructive', description: "Remember to save changes."});
    };

    return (
        <Card className="opacity-0 animate-fade-in-up">
          <CardHeader>
            <div className="flex flex-wrap gap-4 justify-between items-center">
                <div>
                    <CardTitle>Manage Roadmap</CardTitle>
                    <CardDescription>Update project milestones. Press Save to persist changes.</CardDescription>
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
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                        Save Changes
                    </Button>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading || !roadmap ? (
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
                roadmap.map((event) => (
                  <div key={event.id} className="space-y-2 p-4 border rounded-md">
                    <div className="flex items-center gap-4">
                      <Input 
                        type="text" 
                        value={event.date}
                        onChange={(e) => handleRoadmapChange(event.id, 'date', e.target.value)}
                        placeholder="YYYY-MM-DD or Q4 2025"
                        className="w-48 transition-colors focus:border-primary" />
                      <Input 
                        value={event.title}
                        onChange={(e) => handleRoadmapChange(event.id, 'title', e.target.value)}
                        className="flex-grow transition-colors focus:border-primary" />
                      <Button variant="destructive" size="icon" onClick={() => handleRoadmapDelete(event.id)}>
                        <Trash2 className="h-4 w-4"/>
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                    <Textarea 
                        value={event.description}
                        onChange={(e) => handleRoadmapChange(event.id, 'description', e.target.value)}
                        className="transition-colors focus:border-primary"
                     />
                  </div>
                ))
            )}
          </CardContent>
        </Card>
    );
}
