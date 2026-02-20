'use client';

import { AlertTriangle, CheckCircle2, Clock, Home, Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { SymptomResult, UrgencyLevel } from '@/types';

interface ResultsDisplayProps {
  result: SymptomResult;
  onSave?: () => void;
  onExport?: () => void;
  onStartOver?: () => void;
}

const URGENCY_CONFIG: Record<
  UrgencyLevel,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
  }
> = {
  emergency: {
    label: 'Emergency',
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'text-red-700 dark:text-red-400',
  },
  urgent: {
    label: 'Urgent',
    icon: <Clock className="h-5 w-5" />,
    color: 'text-orange-700 dark:text-orange-400',
  },
  routine: {
    label: 'Routine',
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: 'text-blue-700 dark:text-blue-400',
  },
  'home-care': {
    label: 'Home Care',
    icon: <Home className="h-5 w-5" />,
    color: 'text-green-700 dark:text-green-400',
  },
};

export function ResultsDisplay({ result, onSave, onExport, onStartOver }: ResultsDisplayProps) {
  const urgencyConfig = URGENCY_CONFIG[result.urgency];

  return (
    <div className="space-y-6">
      {/* Urgency Banner */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={urgencyConfig.color}>{urgencyConfig.icon}</div>
            <div className="flex-1">
              <CardTitle className={urgencyConfig.color}>
                {urgencyConfig.label} Assessment
              </CardTitle>
              <CardDescription className="mt-1">
                {result.actionGuidance}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Possible Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Possible Conditions</CardTitle>
          <CardDescription>
            Ranked by likelihood based on your symptoms
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.possibleConditions.map((condition, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                    index === 0
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{condition.condition}</p>
                  <p className="text-sm text-muted-foreground">
                    Likelihood: {Math.round(condition.likelihood * 100)}%
                  </p>
                </div>
              </div>
              <div className="w-24">
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${condition.likelihood * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Home Care Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Home Care Recommendations</CardTitle>
          <CardDescription>
            Steps you can take to manage your symptoms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {result.homeCareRecommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Red Flags */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle>Warning Signs to Watch For</CardTitle>
          </div>
          <CardDescription>
            Seek immediate medical attention if you experience any of these
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {result.redFlags.map((flag, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm">{flag}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>



      <Separator />

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {onSave && (
          <Button onClick={onSave} variant="outline" className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save to History
          </Button>
        )}
        {onExport && (
          <Button onClick={onExport} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        )}
        {onStartOver && (
          <Button onClick={onStartOver} className="flex-1">
            Start New Assessment
          </Button>
        )}
      </div>
    </div>
  );
}
