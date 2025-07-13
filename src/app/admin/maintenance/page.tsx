
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { logAction } from '@/lib/logger';
import { getMaintenanceSettings, updateMaintenanceSettings, type MaintenanceSettings } from '@/lib/db/actions';
import { Wrench, Power, PowerOff, Loader2 } from 'lucide-react';
import { formatDistanceToNow, add } from 'date-fns';

type CooldownOption = 'none' | '15m' | '1h' | '4h' | '24h';

export default function MaintenanceAdminPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<MaintenanceSettings | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [cooldown, setCooldown] = useState<CooldownOption>('none');
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            const data = await getMaintenanceSettings();
            setSettings(data);
        };
        fetchSettings();
    }, []);

    useEffect(() => {
        if (settings?.isActive && settings?.endsAt) {
            const timer = setInterval(() => {
                const endsAtDate = new Date(settings.endsAt!);
                if (endsAtDate > new Date()) {
                    setTimeLeft(formatDistanceToNow(endsAtDate, { addSuffix: true }));
                } else {
                    setTimeLeft('Expired');
                    setSettings(s => s ? { ...s, isActive: false, endsAt: null } : null);
                    clearInterval(timer);
                }
            }, 1000);
            return () => clearInterval(timer);
        } else {
            setTimeLeft('');
        }
    }, [settings]);

    const handleToggle = async () => {
        if (!settings) return;
        
        setIsSaving(true);
        const newStatus = !settings.isActive;
        let endsAt: Date | null = null;
        
        if (newStatus && cooldown !== 'none') {
            const durationMap = { '15m': { minutes: 15 }, '1h': { hours: 1 }, '4h': { hours: 4 }, '24h': { hours: 24 } };
            endsAt = add(new Date(), durationMap[cooldown as Exclude<CooldownOption, 'none'>]);
        }
        
        try {
            await updateMaintenanceSettings({ isActive: newStatus, endsAt });
            const updatedSettings = await getMaintenanceSettings();
            setSettings(updatedSettings);
            
            toast({
                title: `Maintenance Mode ${newStatus ? 'Activated' : 'Deactivated'}`,
                description: `The site is now ${newStatus ? 'under maintenance' : 'live'}.`,
            });
            logAction('Maintenance Mode', 'Success', `Toggled maintenance mode to ${newStatus ? 'ON' : 'OFF'}`);

        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update maintenance status.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSaveMessage = async () => {
        if (!settings) return;
        setIsSaving(true);
         try {
            await updateMaintenanceSettings({ message: settings.message });
            toast({ title: 'Message Saved', description: 'The maintenance message has been updated.' });
             logAction('Maintenance Mode', 'Success', `Updated maintenance message.`);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save message.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    if (!settings) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Wrench /> Maintenance Mode Control</CardTitle>
                        <CardDescription>Activate or deactivate site-wide maintenance mode. Customize the message shown to users.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-lg font-semibold">Maintenance Message</Label>
                            <Textarea
                                id="message"
                                value={settings.message}
                                onChange={(e) => setSettings({ ...settings, message: e.target.value })}
                                rows={4}
                                placeholder="e.g., We'll be back online shortly. Thanks for your patience."
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button onClick={handleSaveMessage} disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                            Save Message
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            
            <div className="space-y-6">
                <Card className={settings.isActive ? 'border-destructive bg-destructive/10' : 'border-primary/80 bg-primary/10'}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {settings.isActive ? <PowerOff /> : <Power />}
                            Live Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${settings.isActive ? 'text-destructive' : 'text-primary'}`}>
                            {settings.isActive ? 'MAINTENANCE ACTIVE' : 'SITE IS LIVE'}
                        </div>
                        {timeLeft && <p className="text-sm mt-2 text-muted-foreground">Deactivates {timeLeft}</p>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Activation Settings</CardTitle>
                         <CardDescription>Set a duration for the maintenance window before activating.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <RadioGroup value={cooldown} onValueChange={(val: CooldownOption) => setCooldown(val)} disabled={settings.isActive}>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="none" id="none" /><Label htmlFor="none">Activate Indefinitely</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="15m" id="15m" /><Label htmlFor="15m">For 15 minutes</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="1h" id="1h" /><Label htmlFor="1h">For 1 hour</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="4h" id="4h" /><Label htmlFor="4h">For 4 hours</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="24h" id="24h" /><Label htmlFor="24h">For 24 hours</Label></div>
                        </RadioGroup>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="w-full" variant={settings.isActive ? 'default' : 'destructive'} disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : (settings.isActive ? <PowerOff className="mr-2 h-4 w-4"/> : <Power className="mr-2 h-4 w-4"/>)}
                                    {settings.isActive ? 'Deactivate Now' : 'Activate Maintenance Mode'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will make your entire public-facing website {settings.isActive ? 'LIVE' : 'UNAVAILABLE'}.
                                        {cooldown !== 'none' && !settings.isActive && ` It will automatically become live again after the selected duration.`}
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleToggle} className={settings.isActive ? '' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}>
                                        {settings.isActive ? 'Go Live' : 'Activate'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
