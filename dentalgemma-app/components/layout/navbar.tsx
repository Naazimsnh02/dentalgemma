'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  'xray-analysis': 'Image Analysis',
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
  /* Removed online status logic */
  const [searchQuery, setSearchQuery] = useState('');

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
      <div className="relative flex h-16 items-center px-6">
        {/* Breadcrumbs (Centered) */}
        <nav aria-label="Breadcrumb" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center space-x-2">
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

        {/* Right side: Search */}
        <div className="ml-auto flex items-center gap-4">
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
        </div>
      </div>
    </header>
  );
}
