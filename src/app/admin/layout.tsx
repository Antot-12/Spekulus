
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarInset, SidebarTrigger, SidebarFooter } from '@/components/ui/sidebar';
import Link from 'next/link';
import { LayoutDashboard, FileText, Calendar, HelpCircle, LogOut, Loader2, Users, LayoutGrid, Sparkles, Camera, Home, Cpu, Bot, FolderKanban, History } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { logAction } from '@/lib/logger';

const pageTitles: { [key: string]: string } = {
    '/admin': 'Dashboard',
    '/admin/pages': 'Pages Overview',
    '/admin/hero': 'Hero Section Management',
    '/admin/advantages': 'Advantages Management',
    '/admin/product': 'Product Section Management',
    '/admin/action-section': 'In Action Section',
    '/admin/notes': 'Developer Notes',
    '/admin/creators': 'Creators Management',
    '/admin/roadmap': 'Roadmap',
    '/admin/faq': 'FAQ Management',
    '/admin/uploads': 'Uploads Manager',
    '/admin/logs': 'Action Logs',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  useEffect(() => {
    setIsClient(true);
    try {
      if (localStorage.getItem('admin_token') === 'true') {
        setIsAuthenticated(true);
      } else {
        router.replace('/login');
      }
    } catch (e) {
      router.replace('/login');
    }
  }, [router]);
  
  useEffect(() => {
    setPageTitle(pageTitles[pathname] || 'Admin');
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
            <Link href="/admin" className="flex items-center gap-2 group">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary group-hover:rotate-90 transition-transform duration-300"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m19 12-2 0"/><path d="m7 12-2 0"/><path d="m16.9 16.9-.7-.7"/><path d="m7.8 7.8-.7-.7"/><path d="m16.9 7.1-.7.7"/><path d="m7.8 16.2-.7.7"/></svg>
                <span className="font-bold font-headline text-lg">Admin Panel</span>
            </Link>
        </SidebarHeader>
        <SidebarContent className='p-2'>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                    <Link href="/admin"><LayoutDashboard />Dashboard</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/hero'}>
                    <Link href="/admin/hero"><Home />Hero Section</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/product'}>
                    <Link href="/admin/product"><Cpu />Product Section</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/advantages'}>
                    <Link href="/admin/advantages"><Sparkles />Advantages</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/action-section'}>
                    <Link href="/admin/action-section"><Camera />In Action Section</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/notes'}>
                    <Link href="/admin/notes"><FileText />Dev Notes</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/creators'}>
                    <Link href="/admin/creators"><Users />Creators</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/roadmap'}>
                    <Link href="/admin/roadmap"><Calendar />Roadmap</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/faq'}>
                    <Link href="/admin/faq"><HelpCircle />FAQ</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/pages'}>
                    <Link href="/admin/pages"><LayoutGrid />Pages</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/admin/logs'}>
                    <Link href="/admin/logs"><History />Logs</Link>
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
