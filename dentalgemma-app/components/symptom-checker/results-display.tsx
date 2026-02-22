'use client';

import { AlertTriangle, CheckCircle2, Clock, Home, Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { SimpleSymptomResult, UrgencyLevel } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ResultsDisplayProps {
  result: SimpleSymptomResult;
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
                Review the detailed clinical report below for guidance.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* AI Markdown Report */}
      <Card>
        <CardHeader>
          <CardTitle>Clinical Report</CardTitle>
          <CardDescription>
            Based on your reported symptoms (not a clinical examination). A professional dental examination is required for definitive diagnosis and treatment planning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result.markdownReport.replace(/\n/g, '  \n')}
            </ReactMarkdown>
          </div>
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
