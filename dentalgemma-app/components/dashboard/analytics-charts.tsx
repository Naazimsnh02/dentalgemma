'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { AnalysisHistoryItem, UrgencyLevel } from '@/types';

interface AnalyticsChartsProps {
  history: AnalysisHistoryItem[];
}

// Color palette for charts
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  emergency: '#ef4444',
  urgent: '#f97316',
  routine: '#3b82f6',
  'home-care': '#10b981',
};

// ============================================================================
// Helper Functions
// ============================================================================

function prepareConditionDistribution(history: AnalysisHistoryItem[]) {
  const conditionCounts: Record<string, number> = {};

  history.forEach((item) => {
    // Extract condition from summary or data
    let condition = 'Unknown';
    
    if (item.type === 'clinical' && item.data?.diagnosis?.primary) {
      condition = item.data.diagnosis.primary;
    } else if (item.type === 'xray' && item.data?.findings?.[0]) {
      condition = item.data.findings[0];
    } else if (item.type === 'symptom' && item.data?.possibleConditions?.[0]?.condition) {
      condition = item.data.possibleConditions[0].condition;
    } else if (item.summary) {
      // Extract from summary
      condition = item.summary.split(':')[0] || 'General';
    }

    conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
  });

  // Get top 5 conditions
  return Object.entries(conditionCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function prepareUrgencyBreakdown(history: AnalysisHistoryItem[]) {
  const urgencyCounts: Record<string, number> = {
    Emergency: 0,
    Urgent: 0,
    Routine: 0,
    'Home Care': 0,
  };

  history.forEach((item) => {
    if (item.urgency) {
      const label = item.urgency === 'home-care' ? 'Home Care' : 
                    item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1);
      urgencyCounts[label]++;
    }
  });

  return Object.entries(urgencyCounts)
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.value > 0);
}

function prepareUsageOverTime(history: AnalysisHistoryItem[]) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Initialize data for last 30 days
  const dailyData: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const dateKey = date.toISOString().split('T')[0];
    dailyData[dateKey] = 0;
  }

  // Count activities per day
  history.forEach((item) => {
    const date = new Date(item.timestamp);
    if (date >= thirtyDaysAgo) {
      const dateKey = date.toISOString().split('T')[0];
      if (dailyData[dateKey] !== undefined) {
        dailyData[dateKey]++;
      }
    }
  });

  // Convert to array and format
  return Object.entries(dailyData)
    .map(([date, count]) => ({
      date,
      count,
      displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================================================
// Main Component
// ============================================================================

export function AnalyticsCharts({ history }: AnalyticsChartsProps) {
  const conditionData = useMemo(() => prepareConditionDistribution(history), [history]);
  const urgencyData = useMemo(() => prepareUrgencyBreakdown(history), [history]);
  const usageData = useMemo(() => prepareUsageOverTime(history), [history]);

  if (history.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Condition Distribution</CardTitle>
            <CardDescription>Top 5 conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
              No data available
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Urgency Breakdown</CardTitle>
            <CardDescription>Cases by urgency level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
              No data available
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Usage Over Time</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
              No data available
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Condition Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Condition Distribution</CardTitle>
          <CardDescription>Top 5 conditions analyzed</CardDescription>
        </CardHeader>
        <CardContent>
          {conditionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={conditionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {conditionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
              No condition data
            </div>
          )}
        </CardContent>
      </Card>

      {/* Urgency Breakdown Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Urgency Breakdown</CardTitle>
          <CardDescription>Cases by urgency level</CardDescription>
        </CardHeader>
        <CardContent>
          {urgencyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={urgencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Count">
                  {urgencyData.map((entry, index) => {
                    const urgencyKey = entry.name.toLowerCase().replace(' ', '-') as UrgencyLevel;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={URGENCY_COLORS[urgencyKey] || COLORS[index % COLORS.length]}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
              No urgency data
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Over Time Line Chart */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Usage Over Time</CardTitle>
          <CardDescription>Activity in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                labelFormatter={(label) => {
                  const item = usageData.find((d) => d.displayDate === label);
                  return item ? new Date(item.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  }) : label;
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Activities"
                dot={{ fill: '#3b82f6', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
