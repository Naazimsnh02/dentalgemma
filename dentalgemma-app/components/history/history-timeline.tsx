'use client';

import { AnalysisHistoryItem, UrgencyLevel } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileImage, 
  FileText, 
  Mic, 
  Network, 
  Stethoscope,
  Clock,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Home
} from 'lucide-react';
import { format } from 'date-fns';

interface HistoryTimelineProps {
  items: AnalysisHistoryItem[];
  onItemClick?: (item: AnalysisHistoryItem) => void;
  selectedIds?: string[];
}

const typeIcons = {
  xray: FileImage,
  clinical: FileText,
  voice: Mic,
  agentic: Network,
  symptom: Stethoscope,
};

const urgencyConfig = {
  emergency: {
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Emergency',
  },
  urgent: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Urgent',
  },
  routine: {
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Routine',
  },
  'home-care': {
    icon: Home,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Home Care',
  },
};

const typeLabels = {
  xray: 'X-Ray Analysis',
  clinical: 'Clinical Assessment',
  voice: 'Voice Consultation',
  agentic: 'Agentic Workflow',
  symptom: 'Symptom Check',
};

export function HistoryTimeline({ items, onItemClick, selectedIds = [] }: HistoryTimelineProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No analysis history yet. Start by analyzing an X-ray or assessing a clinical case.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const TypeIcon = typeIcons[item.type];
        const urgencyInfo = item.urgency ? urgencyConfig[item.urgency] : null;
        const UrgencyIcon = urgencyInfo?.icon;
        const isSelected = selectedIds.includes(item.id);

        return (
          <Card
            key={item.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onItemClick?.(item)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TypeIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {typeLabels[item.type]}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(item.timestamp), 'PPp')}
                    </p>
                  </div>
                </div>
                {urgencyInfo && UrgencyIcon && (
                  <Badge
                    variant="outline"
                    className={`${urgencyInfo.bgColor} ${urgencyInfo.borderColor} ${urgencyInfo.color}`}
                  >
                    <UrgencyIcon className="h-3 w-3 mr-1" />
                    {urgencyInfo.label}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.summary}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
