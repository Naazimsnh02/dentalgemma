'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Wifi, WifiOff, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  'xray-analysis': 'X-Ray Analysis',
  'clinical-assessment': 'Clinical Assessment',
  'voice-consultation': 'Voice Consultation',
  'agentic-workflow': 'Agentic Workflow',
  'dentist-finder': 'Dentist Finder',
  'progress-tracker': 'Progress Tracker',
  research: 'Research Dashboard',
  education: 'Patient Education',
  'symptom-checker': 'Symptom Checker',
  'model-info': 'Model Information',
  history: 'History',
  settings: 'Settings',
};

export function Navbar() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (!pathname) return [];

    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      const label = routeLabels[segment] || segment;
      breadcrumbs.push({
        label,
        href: currentPath,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement global search functionality
    console.log('Search query:', searchQuery);
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2">
          {breadcrumbs.length > 0 ? (
            <ol className="flex items-center space-x-2">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <li key={crumb.href} className="flex items-center">
                    {index > 0 && (
                      <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
                    )}
                    {isLast ? (
                      <span className="text-sm font-medium text-foreground">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <span className="text-sm font-medium">DentalGemma</span>
          )}
        </nav>

        {/* Right side: Search and Connection Status */}
        <div className="flex items-center gap-4">
          {/* Global Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'h-9 w-64 rounded-md border border-input bg-background pl-9 pr-3 text-sm',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'transition-colors'
              )}
              aria-label="Global search"
            />
          </form>

          {/* Connection Status Indicator */}
          <div
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm',
              isOnline
                ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
            )}
            role="status"
            aria-live="polite"
          >
            {isOnline ? (
              <>
                <Wifi className="h-4 w-4" />
                <span className="font-medium">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span className="font-medium">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
