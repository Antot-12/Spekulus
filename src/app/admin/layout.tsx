
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarInset, SidebarTrigger, SidebarFooter } from '@/components/ui/sidebar';
import Link from 'next/link';
import { LayoutDashboard, FileText, Calendar, HelpCircle, LogOut, Loader2, Users, Sparkles, Camera, Home, Cpu, History, UploadCloud, Swords, Handshake, MessageSquareQuote, Wrench, Files, Mail, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { logAction } from '@/lib/logger';

const getPageTitle = (pathname: string): string => {
    if (pathname === '/admin') return 'Dashboard';
    
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    if (!lastSegment) return 'Admin';

    // For dynamic routes like /admin/creators/[slug], show a generic title
    if (lastSegment.startsWith('[') && lastSegment.endsWith(']')) {
        const parentSegment = segments[segments.length - 2];
        if (parentSegment) {
            return parentSegment.charAt(0).toUpperCase() + parentSegment.slice(1);
        }
    }
    
    // For other routes, capitalize the last segment
    return lastSegment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient) {
        try {
          if (localStorage.getItem('admin_token') === 'true') {
            setIsAuthenticated(true);
          } else {
            router.replace('/login');
          }
        } catch (e) {
          router.replace('/login');
        }
    }
  }, [router, isClient]);
  
  useEffect(() => {
    setPageTitle(getPageTitle(pathname));
  }, [pathname]);

  const handleLogout = () => {
    try {
      const user = localStorage.getItem('admin_user') || 'unknown';
      logAction('Logout', 'Success', `User '${user}' logged out.`);
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
    } finally {
      router.push('/login');
    }
  }

  if (!isClient || !isAuthenticated) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className='text-foreground mt-4 text-lg'>Loading & Verifying Access...</p>
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className='flex items-center justify-between p-2'>
            <div className="flex items-center gap-2">
              <Link href="/" aria-label="Go to public homepage" className="group">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary group-hover:rotate-90 transition-transform duration-300"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m19 12-2 0"/><path d="m7 12-2 0"/><path d="m16.9 16.9-.7-.7"/><path d="m7.8 7.8-.7-.7"/><path d="m16.9 7.1-.7.7"/><path d="m7.8 16.2-.7.7"/></svg>
              </Link>
              <Link href="/admin">
                <span className="font-bold font-headline text-lg hover:text-primary transition-colors">Admin Panel</span>
              </Link>
            </div>
        </SidebarHeader>
        <SidebarContent className='p-2'>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin' || pathname === '/admin/dashboard'}>
                    <Link href="/admin"><LayoutDashboard />Dashboard</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/hero')}>
                    <Link href="/admin/hero"><Home />Hero Section</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/product')}>
                    <Link href="/admin/product"><Cpu />Product Section</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/advantages')}>
                    <Link href="/admin/advantages"><Sparkles />Advantages</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/action-section')}>
                    <Link href="/admin/action-section"><Camera />In Action Section</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/scenarios')}>
                    <Link href="/admin/scenarios"><MessageSquareQuote />Scenarios</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/comparison')}>
                    <Link href="/admin/comparison"><Swords />Comparison</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/cooperation-section')}>
                    <Link href="/admin/cooperation-section"><Handshake />Cooperation Section</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/cooperation')}>
                    <Link href="/admin/cooperation"><Handshake />Cooperation Requests</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/newsletter')}>
                    <Link href="/admin/newsletter"><Mail />Newsletter</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/notes')}>
                    <Link href="/admin/notes"><FileText />Dev Notes</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/creators')}>
                    <Link href="/admin/creators"><Users />Creators</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/roadmap')}>
                    <Link href="/admin/roadmap"><Calendar />Roadmap</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/faq')}>
                    <Link href="/admin/faq"><HelpCircle />FAQ</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/uploads')}>
                    <Link href="/admin/uploads"><UploadCloud />Uploads</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/logs')}>
                    <Link href="/admin/logs"><History />Logs</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/maintenance')}>
                    <Link href="/admin/maintenance"><Wrench />Maintenance</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/pages')}>
                    <Link href="/admin/pages"><Files />Pages Overview</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className='p-2'>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} variant="outline">
                        <LogOut />Logout
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="p-4 md:p-6 lg:p-8">
            <div className='flex items-center gap-4 mb-6'>
                <SidebarTrigger className='md:hidden'/>
                <h1 className="text-2xl font-bold font-headline">{pageTitle}</h1>
            </div>
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
