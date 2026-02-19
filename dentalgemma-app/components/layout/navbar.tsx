'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { ChevronRight } from 'lucide-react';
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



  return (
    <header className="sticky top-0 z-30 border-b bg-background">
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
                      <span className="text-xl font-semibold text-foreground">
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <span className="text-xl font-bold">DentalGemma</span>
          )}
        </nav>


      </div>
    </header>
  );
}
