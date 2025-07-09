
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
import { getLogs, type LogEntry, type LogActionType } from '@/lib/logger';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Search, Calendar as CalendarIcon, Download, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ArrowUpDown, History } from 'lucide-react';

const LOGS_PER_PAGE = 20;

type SortConfig = {
    key: keyof LogEntry | 'timestamp';
    direction: 'asc' | 'desc';
};

export default function LogsAdminPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Filtering and Sorting State
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'timestamp', direction: 'desc' });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    
    const loadLogs = useCallback(() => {
        const allLogs = getLogs();
        setLogs(allLogs);
        setIsLoaded(true);
    }, []);
    
    useEffect(() => {
        loadLogs();
        window.addEventListener('storage', loadLogs);
        return () => {
            window.removeEventListener('storage', loadLogs);
        };
    }, [loadLogs]);
    
    const filteredAndSortedLogs = useMemo(() => {
        let filtered = logs
            .filter(log => {
                const searchMatch = searchTerm.length === 0 ||
                    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (log.path && log.path.toLowerCase().includes(searchTerm.toLowerCase()));
                
                const actionMatch = actionFilter === 'all' || log.action === actionFilter;
                const statusMatch = statusFilter === 'all' || log.status.toLowerCase() === statusFilter;
                
                const dateMatch = !dateRange?.from || (
                    log.timestamp >= dateRange.from.getTime() &&
                    log.timestamp <= (dateRange.to ? new Date(dateRange.to).setHours(23, 59, 59, 999) : new Date(dateRange.from).setHours(23, 59, 59, 999))
                );

                return searchMatch && actionMatch && statusMatch && dateMatch;
            });
            
        return [...filtered].sort((a, b) => {
            const valA = a[sortConfig.key];
            const valB = b[sortConfig.key];
            let comparison = 0;
            if (typeof valA === 'string' && typeof valB === 'string') {
                comparison = valA.localeCompare(valB);
            } else if (typeof valA === 'number' && typeof valB === 'number') {
                comparison = valA - valB;
            }
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [logs, searchTerm, actionFilter, statusFilter, dateRange, sortConfig]);

    const totalPages = Math.ceil(filteredAndSortedLogs.length / LOGS_PER_PAGE);
    const paginatedLogs = filteredAndSortedLogs.slice((currentPage - 1) * LOGS_PER_PAGE, currentPage * LOGS_PER_PAGE);
    const allActionTypes = useMemo(() => [...new Set(logs.map(log => log.action))], [logs]);
    
    const handleSort = (key: SortConfig['key']) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const exportToCSV = () => {
        const headers = ['Timestamp', 'User', 'Action', 'Status', 'Details', 'Path'];
        const rows = filteredAndSortedLogs.map(log => [
            `"${format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}"`,
            `"${log.user}"`,
            `"${log.action}"`,
            `"${log.status}"`,
            `"${log.details.replace(/"/g, '""')}"`,
            `"${log.path || ''}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
            
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csvContent));
        link.setAttribute('download', `spekulus_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusBadgeVariant = (status: string): 'default' | 'destructive' | 'secondary' => {
        if (status === 'Success') return 'default';
        if (status === 'Failure') return 'destructive';
        return 'secondary';
    };
    
    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><History />Action Logs</CardTitle>
                <CardDescription>A detailed audit trail of all actions performed in the admin panel.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-4 p-4 border rounded-lg bg-muted/50">
                    <div className="relative flex-grow min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Search user or details..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                        <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Filter by action..."/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            {allActionTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[120px]"><SelectValue placeholder="Filter by status..."/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="failure">Failure</SelectItem>
                        </SelectContent>
                    </Select>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full sm:w-[240px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")) : <span>Pick a date range</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start"><Calendar initialFocus mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} /></PopoverContent>
                    </Popover>
                    <Button onClick={exportToCSV} variant="outline" className="w-full sm:w-auto"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
                </div>

                {/* Table */}
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="cursor-pointer" onClick={() => handleSort('timestamp')}>
                                    <div className="flex items-center gap-2">Timestamp <ArrowUpDown className="h-3 w-3" /></div>
                                </TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!isLoaded ? [...Array(10)].map((_, i) => (
                                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                            )) : paginatedLogs.length > 0 ? paginatedLogs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-mono text-xs">{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                                    <TableCell>{log.user}</TableCell>
                                    <TableCell><Badge variant="secondary">{log.action}</Badge></TableCell>
                                    <TableCell><Badge variant={getStatusBadgeVariant(log.status)}>{log.status}</Badge></TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        <p>{log.details}</p>
                                        {log.path && <p className="text-xs font-mono mt-1">Path: {log.path}</p>}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">No logs found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                {/* Pagination */}
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
