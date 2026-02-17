'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/app-store';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';
import { QuickActionCards } from '@/components/dashboard/quick-action-cards';
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  const router = useRouter();
  const {
    dashboardStats,
    analysisHistory,
    updateDashboardStats,
    savedPapers,
    favoriteDentists,
  } = useAppStore();

  // Calculate stats from actual data
  useEffect(() => {
    const xrayCount = analysisHistory.filter((item) => item.type === 'xray').length;
    const clinicalCount = analysisHistory.filter((item) => item.type === 'clinical').length;
    const totalAnalyses = xrayCount + clinicalCount;

    updateDashboardStats({
      totalAnalyses,
      casesAssessed: clinicalCount,
      papersFound: savedPapers.length,
      dentistsLocated: favoriteDentists.length,
    });
  }, [analysisHistory, savedPapers, favoriteDentists, updateDashboardStats]);

  // Get personalized greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Handle activity click
  const handleActivityClick = (activity: any) => {
    // Navigate to appropriate page based on activity type
    switch (activity.type) {
      case 'xray':
        router.push('/xray-analysis');
        break;
      case 'clinical':
        router.push('/clinical-assessment');
        break;
      case 'voice':
        router.push('/voice-consultation');
        break;
      case 'agentic':
        router.push('/agentic-workflow');
        break;
      case 'symptom':
        router.push('/symptom-checker');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with personalized greeting */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}! Welcome to DentalGemma
        </h1>
        <p className="text-muted-foreground mt-2">
          AI-powered dental diagnostics platform - Your comprehensive dental health companion
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalAnalyses={dashboardStats.totalAnalyses}
        casesAssessed={dashboardStats.casesAssessed}
        papersFound={dashboardStats.papersFound}
        dentistsLocated={dashboardStats.dentistsLocated}
      />

      <Separator />

      {/* Quick Action Cards */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Quick Actions</h2>
        <QuickActionCards />
      </div>

      <Separator />

      {/* Analytics Charts */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Analytics</h2>
        <AnalyticsCharts history={analysisHistory} />
      </div>

      <Separator />

      {/* Activity Timeline */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Recent Activity</h2>
        <ActivityTimeline
          activities={analysisHistory}
          onActivityClick={handleActivityClick}
        />
      </div>
    </div>
  );
}
