/**
 * Research Dashboard Types
 */

export interface ResearchPaper {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  date: string;
  abstract: string;
  url: string;
  keywords: string[];
  saved: boolean;
}

export type DateRange = 'last-6-months' | '1-year' | '5-years' | 'all';
export type ContentType =
  | 'research'
  | 'trial'
  | 'review'
  | 'case-report'
  | 'guideline'
  | 'all';

export interface SearchFilters {
  dateRange: DateRange;
  contentType: ContentType;
  maxResults: number;
}

export interface SearchOptions {
  maxResults?: number;
  dateRange?: DateRange;
  contentType?: ContentType;
}
