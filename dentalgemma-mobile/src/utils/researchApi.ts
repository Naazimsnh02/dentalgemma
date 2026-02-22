import AsyncStorage from '@react-native-async-storage/async-storage';
import type {ResearchPaper, SearchFilters} from '../types/research';

const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const SAVED_PAPERS_KEY = '@dentalgemma:saved_papers';
const RATE_LIMIT_DELAY = 334; // ~3 requests per second

let lastRequestTime = 0;

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
  if (!contentType || contentType === 'all') {
    return query;
  }

  const typeFilters: Record<string, string> = {
    research: 'research article[pt]',
    trial: 'clinical trial[pt]',
    review: 'systematic review[pt] OR review[pt]',
    'case-report': 'case reports[pt]',
    guideline: 'guideline[pt] OR practice guideline[pt]',
  };

  const filter = typeFilters[contentType];
  if (filter) {
    return `${query} AND ${filter}`;
  }

  return query;
}

/**
 * Search PubMed for articles
 */
async function searchPubMedIds(
  query: string,
  maxResults: number = 10,
): Promise<string[]> {
  await rateLimit();

  const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(
    query,
  )}&retmax=${maxResults}&retmode=json`;

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

  const fetchUrl = `${PUBMED_BASE_URL}/esummary.fcgi?db=pubmed&id=${pmids.join(
    ',',
  )}&retmode=json`;

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
 * Search PubMed with filters
 */
export async function searchPubMed(
  query: string,
  filters: SearchFilters,
): Promise<ResearchPaper[]> {
  try {
    // Build filtered query
    let filteredQuery = query;
    filteredQuery = applyDateRangeFilter(filteredQuery, filters.dateRange);
    filteredQuery = applyContentTypeFilter(filteredQuery, filters.contentType);

    // Search PubMed
    const pmids = await searchPubMedIds(filteredQuery, filters.maxResults);

    // Fetch article details
    const papers = await fetchArticleDetails(pmids);

    // Check which papers are saved
    const savedPapers = await getSavedPapers();
    const savedPmids = new Set(savedPapers.map(p => p.pmid));

    return papers.map(paper => ({
      ...paper,
      saved: savedPmids.has(paper.pmid),
    }));
  } catch (error) {
    console.error('PubMed search error:', error);
    throw error;
  }
}

/**
 * Save a paper to local storage
 */
export async function savePaper(paper: ResearchPaper): Promise<void> {
  try {
    const savedPapers = await getSavedPapers();
    const exists = savedPapers.some(p => p.pmid === paper.pmid);

    if (!exists) {
      const updated = [...savedPapers, {...paper, saved: true}];
      await AsyncStorage.setItem(SAVED_PAPERS_KEY, JSON.stringify(updated));
    }
  } catch (error) {
    console.error('Failed to save paper:', error);
    throw error;
  }
}

/**
 * Remove a paper from saved papers
 */
export async function unsavePaper(pmid: string): Promise<void> {
  try {
    const savedPapers = await getSavedPapers();
    const updated = savedPapers.filter(p => p.pmid !== pmid);
    await AsyncStorage.setItem(SAVED_PAPERS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to unsave paper:', error);
    throw error;
  }
}

/**
 * Get all saved papers
 */
export async function getSavedPapers(): Promise<ResearchPaper[]> {
  try {
    const saved = await AsyncStorage.getItem(SAVED_PAPERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to get saved papers:', error);
    return [];
  }
}

/**
 * Clear all saved papers
 */
export async function clearSavedPapers(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVED_PAPERS_KEY);
  } catch (error) {
    console.error('Failed to clear saved papers:', error);
    throw error;
  }
}
