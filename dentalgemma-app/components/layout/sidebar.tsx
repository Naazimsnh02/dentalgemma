'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Microscope,
  FileText,
  Mic,
  GitBranch,
  MapPin,
  TrendingUp,
  BookOpen,
  Search,
  Stethoscope,
  Info,
  LayoutDashboard,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'X-Ray Analysis',
    href: '/dashboard/xray-analysis',
    icon: Microscope,
  },
  {
    title: 'Clinical Assessment',
    href: '/dashboard/clinical-assessment',
    icon: FileText,
  },
  {
    title: 'Voice Consultation',
    href: '/dashboard/voice-consultation',
    icon: Mic,
  },
  {
    title: 'Agentic Workflow',
    href: '/dashboard/agentic-workflow',
    icon: GitBranch,
  },
  {
    title: 'Dentist Finder',
    href: '/dashboard/dentist-finder',
    icon: MapPin,
  },
  {
    title: 'Progress Tracker',
    href: '/dashboard/progress-tracker',
    icon: TrendingUp,
  },
  {
    title: 'Research Dashboard',
    href: '/dashboard/research',
    icon: BookOpen,
  },
  {
    title: 'Patient Education',
    href: '/dashboard/education',
    icon: Search,
  },
  {
    title: 'Symptom Checker',
    href: '/dashboard/symptom-checker',
    icon: Stethoscope,
  },
  {
    title: 'Model Information',
    href: '/dashboard/model-info',
    icon: Info,
  },
];

const bottomNavItems: NavItem[] = [
  {
    title: 'History',
    href: '/dashboard/history',
    icon: History,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">DentalGemma</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-2 hover:bg-accent"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      active && 'bg-accent text-accent-foreground font-medium',
                      collapsed && 'justify-center'
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t p-4">
          <ul className="space-y-1">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      active && 'bg-accent text-accent-foreground font-medium',
                      collapsed && 'justify-center'
                    )}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
