'use client';

/**
 * Paper Card Component
 * 
 * Displays individual research paper information
 * Requirements: 7.4, 7.5, 7.6
 */

import { useState } from 'react';
import { ExternalLink, Bookmark, BookmarkCheck, FileText, Calendar, Users, Tag } from 'lucide-react';
import { ResearchPaper } from '@/types';

interface PaperCardProps {
  paper: ResearchPaper;
  onSave: (paper: ResearchPaper) => void;
  onUnsave: (pmid: string) => void;
  onExportCitation: (paper: ResearchPaper) => void;
  searchTerms?: string[];
  viewMode?: 'grid' | 'list';
}

export function PaperCard({
  paper,
  onSave,
  onUnsave,
  onExportCitation,
  searchTerms = [],
  viewMode = 'list'
}: PaperCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Highlight search terms in text
  const highlightText = (text: string): React.ReactNode => {
    if (searchTerms.length === 0) return text;

    let highlightedText: React.ReactNode = text;
    
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      const parts = String(highlightedText).split(regex);
      
      highlightedText = parts.map((part, index) => {
        if (part.toLowerCase() === term.toLowerCase()) {
          return (
            <mark key={index} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
              {part}
            </mark>
          );
        }
        return part;
      });
    });

    return highlightedText;
  };

  // Toggle save status
  const handleToggleSave = () => {
    if (paper.saved) {
      onUnsave(paper.pmid);
    } else {
      onSave(paper);
    }
  };

  // Format authors list
  const formatAuthors = (authors: string[]): string => {
    if (authors.length === 0) return 'Unknown authors';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
    return `${authors[0]} et al.`;
  };

  // Truncate abstract for grid view
  const truncateAbstract = (text: string, maxLength: number = 200): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (viewMode === 'grid') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1">
              {highlightText(paper.title)}
            </h3>
            <p className="text-sm text-gray-600">
              {formatAuthors(paper.authors)}
            </p>
          </div>
          <button
            onClick={handleToggleSave}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
              paper.saved
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
            aria-label={paper.saved ? 'Remove from reading list' : 'Save to reading list'}
          >
            {paper.saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
          {paper.journal && (
            <div className="flex items-center gap-1">
              <FileText size={12} />
              <span className="truncate">{paper.journal}</span>
            </div>
          )}
          {paper.date && (
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{paper.date}</span>
            </div>
          )}
        </div>

        {/* Abstract */}
        <p className="text-sm text-gray-700 mb-4 flex-1 line-clamp-4">
          {highlightText(truncateAbstract(paper.abstract))}
        </p>

        {/* Keywords */}
        {paper.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {paper.keywords.slice(0, 3).map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                <Tag size={10} />
                {keyword}
              </span>
            ))}
            {paper.keywords.length > 3 && (
              <span className="text-xs text-gray-500 px-2 py-0.5">
                +{paper.keywords.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t">
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ExternalLink size={14} />
            View on PubMed
          </a>
          <button
            onClick={() => onExportCitation(paper)}
            className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Export citation"
          >
            Cite
          </button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {highlightText(paper.title)}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
            <Users size={14} />
            <span>{formatAuthors(paper.authors)}</span>
          </div>
        </div>
        <button
          onClick={handleToggleSave}
          className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
            paper.saved
              ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
              : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
          }`}
          aria-label={paper.saved ? 'Remove from reading list' : 'Save to reading list'}
        >
          {paper.saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </button>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
        {paper.journal && (
          <div className="flex items-center gap-1">
            <FileText size={14} />
            <span>{paper.journal}</span>
          </div>
        )}
        {paper.date && (
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{paper.date}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="text-gray-400">PMID:</span>
          <span className="font-mono">{paper.pmid}</span>
        </div>
      </div>

      {/* Abstract */}
      <div className="mb-4">
        <p className={`text-sm text-gray-700 leading-relaxed ${!isExpanded && 'line-clamp-3'}`}>
          {highlightText(paper.abstract)}
        </p>
        {paper.abstract.length > 300 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 mt-2 font-medium"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Keywords */}
      {paper.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {paper.keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              <Tag size={12} />
              {keyword}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <a
          href={paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <ExternalLink size={16} />
          View on PubMed
        </a>
        <button
          onClick={() => onExportCitation(paper)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <FileText size={16} />
          Export Citation
        </button>
      </div>
    </div>
  );
}
