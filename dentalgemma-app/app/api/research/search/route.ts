/**
 * Research Search API Route
 * 
 * Proxies PubMed E-Utils API with rate limiting
 * Requirements: 7.1, 17.4, 17.5
 */

import { NextRequest, NextResponse } from 'next/server';
import type { SearchOptions, ResearchPaper } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Rate limiting configuration
const RATE_LIMIT_DELAY = 334; // ~3 requests per second (1000ms / 3)
let lastRequestTime = 0;

// PubMed E-Utils API configuration
const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

interface SearchRequestBody {
  query: string;
  options?: SearchOptions;
}

/**
 * Rate limiter to respect PubMed's 3 req/s limit
 */
async function rateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  lastRequestTime = Date.now();
}

/**
 * Search PubMed for articles
 */
async function searchPubMed(query: string, maxResults: number = 10): Promise<string[]> {
  await rateLimit();

  const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json`;
  
  const response = await fetch(searchUrl);
  
  if (!response.ok) {
    throw new Error(`PubMed search failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  const idList = data.esearchresult?.idlist || [];
  
  return idList;
}

/**
 * Fetch article details from PubMed
 */
async function fetchArticleDetails(pmids: string[]): Promise<ResearchPaper[]> {
  if (pmids.length === 0) {
    return [];
  }

  await rateLimit();

  const fetchUrl = `${PUBMED_BASE_URL}/esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`;
  
  const response = await fetch(fetchUrl);
  
  if (!response.ok) {
    throw new Error(`PubMed fetch failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  const articles = data.result;
  
  const papers: ResearchPaper[] = [];
  
  for (const pmid of pmids) {
    const article = articles[pmid];
    
    if (!article || article.error) {
      continue;
    }
    
    papers.push({
      pmid,
      title: article.title || 'Untitled',
      authors: article.authors?.map((a: any) => a.name) || [],
      journal: article.fulljournalname || article.source || 'Unknown Journal',
      date: article.pubdate || 'Unknown Date',
      abstract: '', // Abstract requires separate API call
      url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      keywords: article.keywords || [],
      saved: false,
    });
  }
  
  return papers;
}

/**
 * Apply date range filter to query
 */
function applyDateRangeFilter(query: string, dateRange?: string): string {
  if (!dateRange || dateRange === 'all') {
    return query;
  }

  const now = new Date();
  let startDate: Date;

  switch (dateRange) {
    case 'last-6-months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      break;
    case '1-year':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    case '5-years':
      startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
      break;
    default:
      return query;
  }

  const startDateStr = startDate.toISOString().split('T')[0].replace(/-/g, '/');
  const endDateStr = now.toISOString().split('T')[0].replace(/-/g, '/');

  return `${query} AND ${startDateStr}:${endDateStr}[dp]`;
}

/**
 * Apply content type filter to query
 */
function applyContentTypeFilter(query: string, contentType?: string): string {
  if (!contentType) {
    return query;
  }

  const typeFilters: Record<string, string> = {
    'research': 'research article[pt]',
    'trial': 'clinical trial[pt]',
    'review': 'systematic review[pt] OR review[pt]',
    'case-report': 'case reports[pt]',
    'guideline': 'guideline[pt] OR practice guideline[pt]',
  };

  const filter = typeFilters[contentType];
  if (filter) {
    return `${query} AND ${filter}`;
  }

  return query;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SearchRequestBody = await request.json();

    // Validate required fields
    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validate query is not empty
    if (body.query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query cannot be empty',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Extract options
    const maxResults = body.options?.maxResults || 10;
    const dateRange = body.options?.dateRange;
    const contentType = body.options?.contentType;

    // Build filtered query
    let filteredQuery = body.query;
    filteredQuery = applyDateRangeFilter(filteredQuery, dateRange);
    filteredQuery = applyContentTypeFilter(filteredQuery, contentType);

    // Search PubMed
    const pmids = await searchPubMed(filteredQuery, maxResults);

    // Fetch article details
    const papers = await fetchArticleDetails(pmids);

    // Return results
    return NextResponse.json({
      success: true,
      papers,
      totalResults: pmids.length,
    });
  } catch (error: any) {
    console.error('Research search API error:', error);

    // Handle rate limiting
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please try again in a moment.',
          code: 'RATE_LIMIT_ERROR',
        },
        { status: 429 }
      );
    }

    // Handle network errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to PubMed. Please try again.',
          code: 'NETWORK_ERROR',
        },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during search',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
