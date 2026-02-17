'use client';

import { useState } from 'react';
import { HistoryItemType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

export interface HistoryFilters {
  type: HistoryItemType | 'all';
  dateRange?: DateRange;
  keyword: string;
  sortBy: 'date-desc' | 'date-asc' | 'type';
}

interface HistoryFiltersProps {
  filters: HistoryFilters;
  onFiltersChange: (filters: HistoryFilters) => void;
  onReset: () => void;
}

const typeOptions: Array<{ value: HistoryItemType | 'all'; label: string }> = [
  { value: 'all', label: 'All Types' },
  { value: 'xray', label: 'X-Ray Analysis' },
  { value: 'clinical', label: 'Clinical Assessment' },
  { value: 'voice', label: 'Voice Consultation' },
  { value: 'agentic', label: 'Agentic Workflow' },
  { value: 'symptom', label: 'Symptom Check' },
];

const sortOptions = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'type', label: 'By Type' },
];

export function HistoryFiltersComponent({
  filters,
  onFiltersChange,
  onReset,
}: HistoryFiltersProps) {
  const [keyword, setKeyword] = useState(filters.keyword);

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value as HistoryItemType | 'all',
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: range,
    });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as HistoryFilters['sortBy'],
    });
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    onFiltersChange({
      ...filters,
      keyword: value,
    });
  };

  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.dateRange?.from ||
    filters.keyword ||
    filters.sortBy !== 'date-desc';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8 px-2"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Keyword Search */}
        <div className="space-y-2">
          <Label htmlFor="keyword">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="keyword"
              placeholder="Search by keywords..."
              value={keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={filters.type} onValueChange={handleTypeChange}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, 'LLL dd, y')} -{' '}
                      {format(filters.dateRange.to, 'LLL dd, y')}
                    </>
                  ) : (
                    format(filters.dateRange.from, 'LLL dd, y')
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange?.from}
                selected={filters.dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <Label htmlFor="sort">Sort By</Label>
          <Select value={filters.sortBy} onValueChange={handleSortChange}>
            <SelectTrigger id="sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
