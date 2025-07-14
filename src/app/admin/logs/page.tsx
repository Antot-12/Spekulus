
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Search, Calendar as CalendarIcon, Download, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ArrowUpDown, History, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued';
import { getAuditLogs } from '@/lib/db/actions';
import { useToast } from '@/hooks/use-toast';

const LOGS_PER_PAGE = 20;

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
};

const DiffViewer = ({ before, after }: { before: any, after: any }) => {
    if (!before && !after) return <span className="text-muted-foreground">No data changes recorded.</span>;

    const oldValue = JSON.stringify(before, null, 2) || "{}";
    const newValue = JSON.stringify(after, null, 2) || "{}";
    
    if (oldValue === newValue) {
        return <span className="text-muted-foreground">No changes detected in data.</span>
    }

    return (
        <ReactDiffViewer
            oldValue={oldValue}
            newValue={newValue}
            splitView={true}
            compareMethod={DiffMethod.WORDS}
            styles={{
                diffContainer: { fontSize: '0.8rem', backgroundColor: '#09090b' },
                variables: {
                    dark: {
                        color: '#fafafa',
                        background: '#09090b',
                        addedBackground: '#0d2816',
                        addedColor: '#6fcf97',
                        removedBackground: '#341919',
                        removedColor: '#eb5757',
                        wordAddedBackground: '#134022',
                        wordRemovedBackground: '#502020'
                    }
                }
            }}
            useDarkTheme={true}
        />
    )
}

const SortableHeader = ({ children, sortKey, sortConfig, onSort }: { children: React.ReactNode; sortKey: string; sortConfig: SortConfig; onSort: (key: string) => void; }) => (
    <TableHead className="cursor-pointer" onClick={() => onSort(sortKey)}>
        <div className="flex items-center gap-2">
            {children}
            {sortConfig.key === sortKey ? (
                <ArrowUpDown className="h-3 w-3" />
            ) : (
                <ArrowUpDown className="h-3 w-3 opacity-30" />
            )}
        </div>
    </TableHead>
);

export default function LogsAdminPage() {
    const { toast } = useToast();
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalLogs, setTotalLogs] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [changeTypeFilter, setChangeTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'timestamp', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(totalLogs / LOGS_PER_PAGE);
    
    const loadLogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const filters = {
                query: searchTerm,
                changeType: changeTypeFilter,
                status: statusFilter,
                dateRange
            };
            const sort = { by: sortConfig.key, direction: sortConfig.direction };
            const { logs: fetchedLogs, total } = await getAuditLogs({ page: currentPage, filters, sort, pageSize: LOGS_PER_PAGE });
            setLogs(fetchedLogs);
            setTotalLogs(total);
        } catch (error) {
            console.error("Failed to load audit logs:", error);
            toast({
                title: 'Error Loading Logs',
                description: 'Could not fetch logs from the database.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchTerm, changeTypeFilter, statusFilter, dateRange, sortConfig, toast]);
    
    useEffect(() => {
        loadLogs();
    }, [loadLogs]);
    
    const handleSort = (key: string) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
        setCurrentPage(1);
    };
    
    const exportToCSV = async () => {
        toast({ title: 'Exporting...', description: 'Your CSV download will begin shortly.' });
        window.location.href = '/api/logs/export';
    };
    
    const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'secondary' => {
        if (status === 'SUCCESS') return 'default';
        if (status === 'FAILURE') return 'destructive';
        return 'secondary';
    };
    
    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History />Action Logs</CardTitle>
                <CardDescription>A detailed audit trail of all actions performed in the admin panel.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 mb-4 p-4 border rounded-lg bg-muted/50">
                    <div className="relative flex-grow min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Search user or details..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="pl-10" />
                    </div>
                    <Select value={changeTypeFilter} onValueChange={(value) => {setChangeTypeFilter(value); setCurrentPage(1);}}>
                        <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Filter by type..."/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Change Types</SelectItem>
                            <SelectItem value="CONTENT">Content</SelectItem>
                            <SelectItem value="SETTINGS">Settings</SelectItem>
                            <SelectItem value="UI_VISIBILITY">UI Visibility</SelectItem>
                            <SelectItem value="SEO">SEO</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(value) => {setStatusFilter(value); setCurrentPage(1);}}>
                        <SelectTrigger className="w-full sm:w-[120px]"><SelectValue placeholder="Filter by status..."/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="SUCCESS">Success</SelectItem>
                            <SelectItem value="FAILURE">Failure</SelectItem>
                        </SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full sm:w-[240px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")) : <span>Pick a date range</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><Calendar initialFocus mode="range" selected={dateRange} onSelect={(range) => {setDateRange(range); setCurrentPage(1);}} numberOfMonths={2} /></PopoverContent>
                    </Popover>
                    <Button onClick={exportToCSV} variant="outline" className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableHeader sortKey="timestamp" sortConfig={sortConfig} onSort={handleSort}>Timestamp</SortableHeader>
                                <SortableHeader sortKey="actor" sortConfig={sortConfig} onSort={handleSort}>Actor</SortableHeader>
                                <SortableHeader sortKey="action" sortConfig={sortConfig} onSort={handleSort}>Action</SortableHeader>
                                <SortableHeader sortKey="status" sortConfig={sortConfig} onSort={handleSort}>Status</SortableHeader>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? [...Array(10)].map((_, i) => (
                                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                            )) : logs.length > 0 ? logs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-mono text-xs">{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                                    <TableCell>{log.actor}</TableCell>
                                    <TableCell>
                                      <div>{log.action}</div>
                                      <div className="text-xs text-muted-foreground">{log.target}</div>
                                    </TableCell>
                                    <TableCell><Badge variant={getStatusBadgeVariant(log.status)}>{log.status}</Badge></TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {log.error ? (
                                            <span className="text-destructive">{log.error}</span>
                                        ) : (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" disabled={!log.before && !log.after}><Eye className="mr-2 h-4 w-4"/> View Changes</Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                                                    <DialogHeader>
                                                        <DialogTitle>Log Details: #{log.id}</DialogTitle>
                                                        <DialogDescription>Showing changes for action: {log.action}</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="flex-grow overflow-y-auto bg-card rounded-md">
                                                        <DiffViewer before={log.before} after={log.after} />
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">No logs found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft /></Button>
                            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft /></Button>
                            <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight /></Button>
                            <Button variant="outline" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight /></Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
