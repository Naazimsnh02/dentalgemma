'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/app-store';
import { AnalysisHistoryItem } from '@/types';
import { HistoryTimeline } from '@/components/history/history-timeline';
import {
  HistoryFiltersComponent,
  HistoryFilters,
} from '@/components/history/history-filters';
import { BulkOperations } from '@/components/history/bulk-operations';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { isWithinInterval } from 'date-fns';

const defaultFilters: HistoryFilters = {
  type: 'all',
  keyword: '',
  sortBy: 'date-desc',
};

export default function HistoryPage() {
  const { analysisHistory, clearHistory, removeFromHistory } = useAppStore();
  const [filters, setFilters] = useState<HistoryFilters>(defaultFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);

  // Filter and sort history
  const filteredHistory = useMemo(() => {
    let filtered = [...analysisHistory];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter((item) => item.type === filters.type);
    }

    // Filter by date range
    if (filters.dateRange?.from) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.timestamp);
        const dateFrom = filters.dateRange?.from;
        const dateTo = filters.dateRange?.to;
        
        if (dateFrom && dateTo) {
          return isWithinInterval(itemDate, {
            start: dateFrom,
            end: dateTo,
          });
        }
        if (dateFrom) {
          return itemDate >= dateFrom;
        }
        return true;
      });
    }

    // Filter by keyword
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.summary.toLowerCase().includes(keyword) ||
          item.type.toLowerCase().includes(keyword) ||
          item.urgency?.toLowerCase().includes(keyword)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'date-desc':
        filtered.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        break;
      case 'date-asc':
        filtered.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        break;
      case 'type':
        filtered.sort((a, b) => a.type.localeCompare(b.type));
        break;
    }

    return filtered;
  }, [analysisHistory, filters]);

  const selectedItems = useMemo(
    () => filteredHistory.filter((item) => selectedIds.includes(item.id)),
    [filteredHistory, selectedIds]
  );

  const handleItemClick = (item: AnalysisHistoryItem) => {
    setSelectedIds((prev) => {
      if (prev.includes(item.id)) {
        return prev.filter((id) => id !== item.id);
      }
      return [...prev, item.id];
    });
  };

  const handleBulkDelete = (ids: string[]) => {
    removeFromHistory(ids);
  };

  const handleClearAll = () => {
    clearHistory();
    setShowClearAllDialog(false);
    setSelectedIds([]);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analysis History</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your past analyses
          </p>
        </div>
        {analysisHistory.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowClearAllDialog(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <HistoryFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onReset={handleResetFilters}
          />
        </div>

        {/* History Timeline */}
        <div className="lg:col-span-3 space-y-4">
          <BulkOperations
            selectedItems={selectedItems}
            onDelete={handleBulkDelete}
            onClearSelection={() => setSelectedIds([])}
          />

          <HistoryTimeline
            items={filteredHistory}
            onItemClick={handleItemClick}
            selectedIds={selectedIds}
          />

          {filteredHistory.length === 0 && analysisHistory.length > 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No items match your filters. Try adjusting your search criteria.
            </div>
          )}
        </div>
      </div>

      {/* Clear All Confirmation Dialog */}
      <AlertDialog open={showClearAllDialog} onOpenChange={setShowClearAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All History?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all {analysisHistory.length} history
              items? This action cannot be undone and will permanently remove all
              your analysis records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
