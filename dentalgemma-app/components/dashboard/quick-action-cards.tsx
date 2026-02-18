'use client';

import Link from 'next/link';
import {
  Activity,
  FileText,
  Mic,
  GitBranch,
  MapPin,
  TrendingUp,
  BookOpen,
  GraduationCap,
  Stethoscope,
  Info,
  LayoutDashboard,
  Settings,
} from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    title: 'Image Analysis',
    description: 'Analyze dental images with AI',
    href: '/xray-analysis',
    icon: Activity,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Clinical Assessment',
    description: 'Comprehensive case evaluation',
    href: '/clinical-assessment',
    icon: FileText,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Voice Consultation',
    description: 'Hands-free AI consultation',
    href: '/voice-consultation',
    icon: Mic,
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    title: 'Agentic Workflow',
    description: 'Multi-agent diagnostic system',
    href: '/agentic-workflow',
    icon: GitBranch,
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  {
    title: 'Dentist Finder',
    description: 'Find nearby dental specialists',
    href: '/dentist-finder',
    icon: MapPin,
    color: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
  {
    title: 'Progress Tracker',
    description: 'Track treatment progress',
    href: '/progress-tracker',
    icon: TrendingUp,
    color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  },
  {
    title: 'Research Dashboard',
    description: 'Search dental research papers',
    href: '/research',
    icon: BookOpen,
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  },
  {
    title: 'Patient Education',
    description: 'Learn about dental conditions',
    href: '/education',
    icon: GraduationCap,
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },
  {
    title: 'Symptom Checker',
    description: 'Check dental symptoms',
    href: '/symptom-checker',
    icon: Stethoscope,
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  },
  {
    title: 'Model Information',
    description: 'Learn about DentalGemma AI',
    href: '/model-info',
    icon: Info,
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  },
  {
    title: 'Dashboard',
    description: 'View your activity overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  },
  {
    title: 'Settings',
    description: 'Manage app preferences',
    href: '/settings',
    icon: Settings,
    color: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
  },
];

export function QuickActionCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {quickActions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href}>
            <Card className="h-full transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer">
              <CardHeader className="pb-3">
                <div className={cn('rounded-lg p-2 w-fit mb-2', action.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{action.title}</CardTitle>
                <CardDescription className="text-xs">{action.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
