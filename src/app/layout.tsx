
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppWrapper from '@/components/AppWrapper';
import { getMaintenanceSettings } from '@/lib/db/actions';
import MaintenancePage from './maintenance/page';
import type { MaintenanceSettings } from '@/lib/db/actions';

export const metadata: Metadata = {
  title: 'Spekulus',
  description: 'Reflect smarter, live better.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let maintenanceSettings: MaintenanceSettings = { isActive: false, message: '', endsAt: null };

  try {
    maintenanceSettings = await getMaintenanceSettings();
  } catch (error) {
    console.warn('Could not fetch maintenance settings. Assuming live mode.', error);
    maintenanceSettings = { isActive: false, message: 'Maintenance mode check failed.', endsAt: null };
  }
  
  // This check MUST be here to handle the automatic deactivation after a timer.
  const isMaintenanceActive = maintenanceSettings.isActive && (!maintenanceSettings.endsAt || new Date() < new Date(maintenanceSettings.endsAt));
  
  if (isMaintenanceActive) {
    return (
        <html lang="en" className="dark">
          <body>
            <MaintenancePage message={maintenanceSettings.message} endsAt={maintenanceSettings.endsAt ? new Date(maintenanceSettings.endsAt) : null} />
          </body>
        </html>
    )
  }

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <AppWrapper>
          {children}
        </AppWrapper>
        <Toaster />
      </body>
    </html>
  );
}
