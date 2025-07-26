
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Handshake, Trash2, Mail, Phone, CheckCircle, Clock, Send } from 'lucide-react';
import { getCooperationRequests, updateCooperationRequestStatus, deleteCooperationRequest, CooperationRequest, RequestStatus, resendCooperationRequestEmail } from '@/lib/db/actions';

const getStatusBadgeVariant = (status: RequestStatus): 'default' | 'secondary' | 'outline' => {
  switch (status) {
    case 'replied': return 'default';
    case 'pending': return 'secondary';
    case 'archived': return 'outline';
    default: return 'secondary';
  }
};

export default function CooperationAdminPage() {
    const { toast } = useToast();
    const [requests, setRequests] = useState<CooperationRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actor, setActor] = useState('admin');

    useEffect(() => {
        const adminUser = localStorage.getItem('admin_user') || 'admin';
        setActor(adminUser);
    }, []);

    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getCooperationRequests();
            setRequests(data);
        } catch (error) {
            toast({ title: "Fetch Error", description: "Could not load cooperation requests.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleStatusChange = async (id: number, status: RequestStatus) => {
        const originalRequests = [...requests];
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));

        try {
            await updateCooperationRequestStatus(id, status, actor);
            toast({ title: "Status Updated", description: `Request status changed to ${status}.` });
        } catch (error) {
            setRequests(originalRequests);
            toast({ title: "Update Failed", description: "Could not update status.", variant: "destructive" });
        }
    };

    const handleDelete = async (id: number) => {
        const originalRequests = [...requests];
        setRequests(prev => prev.filter(r => r.id !== id));
        
        try {
            await deleteCooperationRequest(id, actor);
            toast({ title: "Request Deleted", variant: "destructive" });
        } catch (error) {
            setRequests(originalRequests);
            toast({ title: "Delete Failed", description: "Could not delete request.", variant: "destructive" });
        }
    };
    
    const handleResend = async (request: CooperationRequest) => {
        toast({ title: "Resending email..."});
        try {
            await resendCooperationRequestEmail(request.id, actor);
            toast({ title: "Email Resent", description: `An email for ${request.name}'s request has been resent.`});
        } catch (error) {
            toast({ title: "Resend Failed", description: "Could not resend email. Please check server logs.", variant: "destructive" });
        }
    }

    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Handshake /> Cooperation Requests</CardTitle>
                <CardDescription>View and manage partnership and cooperation inquiries submitted through the website.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Contact</TableHead>
                                <TableHead className="hidden md:table-cell">Submitted</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : requests.length > 0 ? (
                                requests.map((req) => (
                                    <TableRow key={req.id}>
                                        <TableCell>
                                            <div className="font-medium">{req.name}</div>
                                            <div className="text-sm text-muted-foreground">{req.email}</div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {format(new Date(req.submittedAt), 'MMM d, yyyy HH:mm')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(req.status)} className="capitalize">
                                                {req.status === 'pending' && <Clock className="mr-1.5 h-3.5 w-3.5"/>}
                                                {req.status === 'replied' && <CheckCircle className="mr-1.5 h-3.5 w-3.5"/>}
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm">View Details</Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Request from {req.name}</DialogTitle>
                                                        <DialogDescription>
                                                            Submitted on {format(new Date(req.submittedAt), 'MMMM d, yyyy \'at\' HH:mm')}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4 text-muted-foreground"/> 
                                                            <a href={`mailto:${req.email}`} className="text-primary hover:underline">{req.email}</a>
                                                        </div>
                                                        {req.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground"/> {req.phone}</div>}
                                                        <div className="p-4 bg-muted rounded-md max-h-64 overflow-y-auto">
                                                            <p className="whitespace-pre-wrap">{req.message}</p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <p className="font-semibold">Status:</p>
                                                            <Button size="sm" variant={req.status === 'pending' ? 'secondary' : 'ghost'} onClick={() => handleStatusChange(req.id, 'pending')}>Pending</Button>
                                                            <Button size="sm" variant={req.status === 'replied' ? 'default' : 'ghost'} onClick={() => handleStatusChange(req.id, 'replied')}>Replied</Button>
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            
                                            <Button variant="ghost" size="sm" onClick={() => handleResend(req)}><Send className="w-4 h-4 mr-2"/> Resend</Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4"/></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
                                                    <AlertDialogDescription>This will permanently delete the request from {req.name}.</AlertDialogDescription>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(req.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center">No cooperation requests yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
