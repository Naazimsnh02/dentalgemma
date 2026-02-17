'use client';

import { Activity, FileText, Mic, GitBranch, Stethoscope, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AnalysisHistoryItem, HistoryItemType, UrgencyLevel } from '@/types';

interface ActivityTimelineProps {
  activities: AnalysisHistoryItem[];
  onActivityClick?: (activity: AnalysisHistoryItem) => void;
}

const getActivityIcon = (type: HistoryItemType) => {
  switch (type) {
    case 'xray':
      return Activity;
    case 'clinical':
      return FileText;
    case 'voice':
      return Mic;
    case 'agentic':
      return GitBranch;
    case 'symptom':
      return Stethoscope;
    default:
      return Activity;
  }
};

const getActivityColor = (type: HistoryItemType) => {
  switch (type) {
    case 'xray':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'clinical':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    case 'voice':
      return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'agentic':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
    case 'symptom':
      return 'bg-pink-500/10 text-pink-600 dark:text-pink-400';
    default:
      return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
};

const getUrgencyBadge = (urgency?: UrgencyLevel) => {
  if (!urgency) return null;

  const variants: Record<UrgencyLevel, { label: string; className: string }> = {
    emergency: {
      label: 'Emergency',
      className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    },
    urgent: {
      label: 'Urgent',
      className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    },
    routine: {
      label: 'Routine',
      className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
    'home-care': {
      label: 'Home Care',
      className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    },
  };

  const variant = variants[urgency];
  return (
    <Badge variant="outline" className={cn('text-xs', variant.className)}>
      {variant.label}
    </Badge>
  );
};

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
};

export function ActivityTimeline({ activities, onActivityClick }: ActivityTimelineProps) {
  const recentActivities = activities.slice(0, 10);

  if (recentActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your last 10 activities will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">No activity yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start using DentalGemma to see your activity here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your last {recentActivities.length} activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);

            return (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start gap-4 pb-4',
                  index !== recentActivities.length - 1 && 'border-b',
                  onActivityClick && 'cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-2 rounded-md transition-colors'
                )}
                onClick={() => onActivityClick?.(activity)}
              >
                <div className={cn('rounded-full p-2 mt-1', colorClass)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-none">{activity.summary}</p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {activity.type.replace('-', ' ')}
                    </Badge>
                    {getUrgencyBadge(activity.urgency)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
