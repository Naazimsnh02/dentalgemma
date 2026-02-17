'use client';

import { Activity, FileText, BookOpen, MapPin, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  totalAnalyses: number;
  casesAssessed: number;
  papersFound: number;
  dentistsLocated: number;
}

interface StatCardData {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCards({
  totalAnalyses,
  casesAssessed,
  papersFound,
  dentistsLocated,
}: StatsCardsProps) {
  const stats: StatCardData[] = [
    {
      title: 'Total Analyses',
      value: totalAnalyses,
      icon: Activity,
      trend: totalAnalyses > 0 ? { value: 12, isPositive: true } : undefined,
    },
    {
      title: 'Cases Assessed',
      value: casesAssessed,
      icon: FileText,
      trend: casesAssessed > 0 ? { value: 8, isPositive: true } : undefined,
    },
    {
      title: 'Research Papers',
      value: papersFound,
      icon: BookOpen,
      trend: papersFound > 0 ? { value: 5, isPositive: true } : undefined,
    },
    {
      title: 'Dentists Found',
      value: dentistsLocated,
      icon: MapPin,
      trend: dentistsLocated > 0 ? { value: 3, isPositive: true } : undefined,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.trend && (
                      <div
                        className={cn(
                          'flex items-center text-xs font-medium',
                          stat.trend.isPositive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {stat.trend.isPositive ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {stat.trend.value}%
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
