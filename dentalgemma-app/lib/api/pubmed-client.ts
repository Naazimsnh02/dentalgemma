// ============================================================================
// PubMed E-Utils API Client
// ============================================================================

import { ResearchPaper, SearchOptions, DateRange, ContentType } from '@/types';

// PubMed E-Utils API base URL
const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

// Rate limiting: 3 requests per second
const RATE_LIMIT_MS = 334; // ~3 req/s
let lastRequestTime = 0;

/**
 * Rate limiter to ensure we don't exceed 3 requests/second
 */
async function rateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
}

/**
 * Convert date range to PubMed date filter
 */
function getDateFilter(dateRange?: DateRange): string {
  if (!dateRange || dateRange === 'all') return '';
  
  const now = new Date();
  const filters: Record<DateRange, string> = {
    'last-6-months': `${now.getFullYear() - 1}/${String(now.getMonth() + 7).padStart(2, '0')}[PDAT]`,
    '1-year': `${now.getFullYear() - 1}[PDAT]`,
    '5-years': `${now.getFullYear() - 5}[PDAT]`,
    'all': ''
  };
  
  return filters[dateRange] || '';
}

/**
 * Convert content type to PubMed publication type filter
 */
function getContentTypeFilter(contentType?: ContentType): string {
  if (!contentType) return '';
  
  const filters: Record<ContentType, string> = {
    'research': 'Journal Article[PT]',
    'trial': 'Clinical Trial[PT]',
    'review': 'Systematic Review[PT] OR Review[PT]',
    'case-report': 'Case Reports[PT]',
    'guideline': 'Guideline[PT] OR Practice Guideline[PT]'
  };
  
  return filters[contentType] || '';
}

/**
 * Parse PubMed XML response to extract article details
 */
function parseArticleXML(articleXML: string): Partial<ResearchPaper> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(articleXML, 'text/xml');
  
  // Extract PMID
  const pmidElement = doc.querySelector('PMID');
  const pmid = pmidElement?.textContent || '';
  
  // Extract title
  const titleElement = doc.querySelector('ArticleTitle');
  const title = titleElement?.textContent || 'No title available';
  
  // Extract authors
  const authorElements = doc.querySelectorAll('Author');
  const authors: string[] = [];
  authorElements.forEach(author => {
    const lastName = author.querySelector('LastName')?.textContent || '';
    const foreName = author.querySelector('ForeName')?.textContent || '';
    if (lastName) {
      authors.push(foreName ? `${lastName} ${foreName}` : lastName);
    }
  });
  
  // Extract journal
  const journalElement = doc.querySelector('Journal Title');
  const journal = journalElement?.textContent || doc.querySelector('ISOAbbreviation')?.textContent || 'Unknown Journal';
  
  // Extract publication date
  const pubDateElement = doc.querySelector('PubDate');
  let date = '';
  if (pubDateElement) {
    const year = pubDateElement.querySelector('Year')?.textContent || '';
    const month = pubDateElement.querySelector('Month')?.textContent || '';
    const day = pubDateElement.querySelector('Day')?.textContent || '';
    date = [year, month, day].filter(Boolean).join('-');
  }
  
  // Extract abstract
  const abstractElements = doc.querySelectorAll('AbstractText');
  let abstract = '';
  abstractElements.forEach(elem => {
    abstract += (elem.textContent || '') + ' ';
  });
  abstract = abstract.trim() || 'No abstract available';
  
  // Extract keywords
  const keywordElements = doc.querySelectorAll('Keyword');
  const keywords: string[] = [];
  keywordElements.forEach(kw => {
    const text = kw.textContent;
    if (text) keywords.push(text);
  });
  
  return {
    pmid,
    title,
    authors,
    journal,
    date,
    abstract,
    keywords,
    url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
  };
}

/**
 * PubMed API Client
 */
export class PubMedClient {
  /**
   * Search PubMed for articles matching the query
   */
  async search(query: string, options: SearchOptions = {}): Promise<ResearchPaper[]> {
    try {
      await rateLimit();
      
      const { maxResults = 20, dateRange, contentType } = options;
      
      // Build search query with filters
      let searchQuery = query;
      
      const dateFilter = getDateFilter(dateRange);
      if (dateFilter) {
        searchQuery += ` AND ${dateFilter}`;
      }
      
      const typeFilter = getContentTypeFilter(contentType);
      if (typeFilter) {
        searchQuery += ` AND (${typeFilter})`;
      }
      
      // Step 1: Search for PMIDs using esearch
      const searchUrl = new URL(`${PUBMED_BASE_URL}/esearch.fcgi`);
      searchUrl.searchParams.set('db', 'pubmed');
      searchUrl.searchParams.set('term', searchQuery);
      searchUrl.searchParams.set('retmax', maxResults.toString());
      searchUrl.searchParams.set('retmode', 'json');
      searchUrl.searchParams.set('sort', 'relevance');
      
      const searchResponse = await fetch(searchUrl.toString());
      if (!searchResponse.ok) {
        throw new Error(`PubMed search failed: ${searchResponse.statusText}`);
      }
      
      const searchData = await searchResponse.json();
      const pmids = searchData.esearchresult?.idlist || [];
      
      if (pmids.length === 0) {
        return [];
      }
      
      // Step 2: Fetch article details using efetch
      await rateLimit();
      
      const fetchUrl = new URL(`${PUBMED_BASE_URL}/efetch.fcgi`);
      fetchUrl.searchParams.set('db', 'pubmed');
      fetchUrl.searchParams.set('id', pmids.join(','));
      fetchUrl.searchParams.set('retmode', 'xml');
      
      const fetchResponse = await fetch(fetchUrl.toString());
      if (!fetchResponse.ok) {
        throw new Error(`PubMed fetch failed: ${fetchResponse.statusText}`);
      }
      
      const xmlText = await fetchResponse.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      
      // Parse each article
      const articles = doc.querySelectorAll('PubmedArticle');
      const papers: ResearchPaper[] = [];
      
      articles.forEach(article => {
        const articleXML = new XMLSerializer().serializeToString(article);
        const parsed = parseArticleXML(articleXML);
        
        if (parsed.pmid) {
          papers.push({
            pmid: parsed.pmid,
            title: parsed.title || 'No title',
            authors: parsed.authors || [],
            journal: parsed.journal || 'Unknown',
            date: parsed.date || '',
            abstract: parsed.abstract || 'No abstract',
            url: parsed.url || `https://pubmed.ncbi.nlm.nih.gov/${parsed.pmid}/`,
            keywords: parsed.keywords || [],
            saved: false
          });
        }
      });
      
      return papers;
    } catch (error) {
      console.error('PubMed search error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to search PubMed: ${error.message}` 
          : 'Failed to search PubMed'
      );
    }
  }
  
  /**
   * Find similar articles using PubMed eLink API
   */
  async findSimilar(pmid: string): Promise<ResearchPaper[]> {
    try {
      await rateLimit();
      
      // Step 1: Get related PMIDs using elink
      const linkUrl = new URL(`${PUBMED_BASE_URL}/elink.fcgi`);
      linkUrl.searchParams.set('dbfrom', 'pubmed');
      linkUrl.searchParams.set('db', 'pubmed');
      linkUrl.searchParams.set('id', pmid);
      linkUrl.searchParams.set('retmode', 'json');
      linkUrl.searchParams.set('cmd', 'neighbor_score');
      
      const linkResponse = await fetch(linkUrl.toString());
      if (!linkResponse.ok) {
        throw new Error(`PubMed eLink failed: ${linkResponse.statusText}`);
      }
      
      const linkData = await linkResponse.json();
      const linksets = linkData.linksets?.[0]?.linksetdbs || [];
      
      // Find the "pubmed_pubmed" linkset (related articles)
      const relatedLinkset = linksets.find((ls: any) => ls.linkname === 'pubmed_pubmed');
      const relatedPmids = relatedLinkset?.links?.slice(0, 10) || [];
      
      if (relatedPmids.length === 0) {
        return [];
      }
      
      // Step 2: Fetch details for related articles
      await rateLimit();
      
      const fetchUrl = new URL(`${PUBMED_BASE_URL}/efetch.fcgi`);
      fetchUrl.searchParams.set('db', 'pubmed');
      fetchUrl.searchParams.set('id', relatedPmids.join(','));
      fetchUrl.searchParams.set('retmode', 'xml');
      
      const fetchResponse = await fetch(fetchUrl.toString());
      if (!fetchResponse.ok) {
        throw new Error(`PubMed fetch failed: ${fetchResponse.statusText}`);
      }
      
      const xmlText = await fetchResponse.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      
      // Parse each article
      const articles = doc.querySelectorAll('PubmedArticle');
      const papers: ResearchPaper[] = [];
      
      articles.forEach(article => {
        const articleXML = new XMLSerializer().serializeToString(article);
        const parsed = parseArticleXML(articleXML);
        
        if (parsed.pmid) {
          papers.push({
            pmid: parsed.pmid,
            title: parsed.title || 'No title',
            authors: parsed.authors || [],
            journal: parsed.journal || 'Unknown',
            date: parsed.date || '',
            abstract: parsed.abstract || 'No abstract',
            url: parsed.url || `https://pubmed.ncbi.nlm.nih.gov/${parsed.pmid}/`,
            keywords: parsed.keywords || [],
            saved: false
          });
        }
      });
      
      return papers;
    } catch (error) {
      console.error('PubMed findSimilar error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to find similar articles: ${error.message}` 
          : 'Failed to find similar articles'
      );
    }
  }
}

// Export singleton instance
export const pubmedClient = new PubMedClient();
