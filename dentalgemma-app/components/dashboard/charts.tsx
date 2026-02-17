'use client';

/**
 * Progress Charts Component
 * 
 * Visualizations using Recharts:
 * - Progress over time line chart
 * - Cost tracking bar chart
 * - Milestone completion progress bars
 * 
 * Requirements: 6.3
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Treatment } from '@/types';

// ============================================================================
// Component Props
// ============================================================================

interface ProgressChartsProps {
  treatments: Treatment[];
}

// ============================================================================
// Helper Functions
// ============================================================================

function prepareProgressOverTimeData(treatments: Treatment[]) {
  // Group treatments by month and calculate average completion
  const monthlyData: Record<string, { total: number; count: number }> = {};

  treatments.forEach((treatment) => {
    const date = new Date(treatment.updatedAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { total: 0, count: 0 };
    }

    monthlyData[monthKey].total += treatment.completionPercentage;
    monthlyData[monthKey].count += 1;
  });

  // Convert to array and calculate averages
  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      avgCompletion: Math.round(data.total / data.count),
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6); // Last 6 months
}

function prepareCostTrackingData(treatments: Treatment[]) {
  return treatments
    .filter((t) => t.cost !== undefined)
    .map((treatment) => ({
      name: treatment.name.length > 20 ? treatment.name.substring(0, 20) + '...' : treatment.name,
      cost: treatment.cost || 0,
      status: treatment.status,
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10); // Top 10 by cost
}

function prepareMilestoneData(treatments: Treatment[]) {
  const statusCounts = {
    'not-started': 0,
    'in-progress': 0,
    completed: 0,
  };

  treatments.forEach((treatment) => {
    statusCounts[treatment.status]++;
  });

  const total = treatments.length;

  return [
    {
      label: 'Not Started',
      count: statusCounts['not-started'],
      percentage: total > 0 ? Math.round((statusCounts['not-started'] / total) * 100) : 0,
      color: 'bg-gray-400',
    },
    {
      label: 'In Progress',
      count: statusCounts['in-progress'],
      percentage: total > 0 ? Math.round((statusCounts['in-progress'] / total) * 100) : 0,
      color: 'bg-yellow-500',
    },
    {
      label: 'Completed',
      count: statusCounts.completed,
      percentage: total > 0 ? Math.round((statusCounts.completed / total) * 100) : 0,
      color: 'bg-green-500',
    },
  ];
}

// ============================================================================
// Main Component
// ============================================================================

export function ProgressCharts({ treatments }: ProgressChartsProps) {
  const progressData = useMemo(() => prepareProgressOverTimeData(treatments), [treatments]);
  const costData = useMemo(() => prepareCostTrackingData(treatments), [treatments]);
  const milestoneData = useMemo(() => prepareMilestoneData(treatments), [treatments]);

  if (treatments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No treatment data to display</p>
        <p className="text-sm mt-2">Add treatments to see progress charts</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress Over Time Line Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Progress Over Time</h3>
        {progressData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickFormatter={(value) => {
                  const [year, month] = value.split('-');
                  return `${month}/${year.slice(2)}`;
                }}
              />
              <YAxis domain={[0, 100]} label={{ value: 'Avg Completion %', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                formatter={(value: number | undefined) => [`${value ?? 0}%`, 'Avg Completion']}
                labelFormatter={(label) => {
                  const [year, month] = label.split('-');
                  const date = new Date(parseInt(year), parseInt(month) - 1);
                  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgCompletion"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Average Completion"
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-8">Not enough data to display progress over time</p>
        )}
      </div>

      {/* Cost Tracking Bar Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Cost Tracking</h3>
        {costData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, 'Cost']}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Legend />
              <Bar dataKey="cost" fill="#10b981" name="Treatment Cost" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-8">No cost data available</p>
        )}
        {costData.length > 0 && (
          <div className="mt-4 text-right">
            <p className="text-lg font-semibold">
              Total Cost: ${costData.reduce((sum, item) => sum + item.cost, 0).toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Milestone Completion Progress Bars */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Milestone Completion</h3>
        <div className="space-y-4">
          {milestoneData.map((milestone) => (
            <div key={milestone.label}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{milestone.label}</span>
                <span className="text-sm text-gray-600">
                  {milestone.count} ({milestone.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div
                  className={`h-full ${milestone.color} flex items-center justify-center text-white text-sm font-semibold transition-all duration-500`}
                  style={{ width: `${milestone.percentage}%` }}
                >
                  {milestone.percentage > 10 && `${milestone.percentage}%`}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-600">{milestoneData[0].count}</p>
              <p className="text-sm text-gray-500">Not Started</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{milestoneData[1].count}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{milestoneData[2].count}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
