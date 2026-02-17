'use client';

/**
 * Citation Export Component
 * 
 * Generates citations in BibTeX, APA, and MLA formats
 * Requirements: 7.7
 */

import { useState } from 'react';
import { Copy, Check, Download, X } from 'lucide-react';
import { ResearchPaper, CitationFormat } from '@/types';

interface CitationExportProps {
  paper: ResearchPaper;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Generate BibTeX citation
 */
function generateBibTeX(paper: ResearchPaper): string {
  const year = paper.date.split('-')[0] || 'n.d.';
  const authors = paper.authors.map(author => {
    const parts = author.split(' ');
    if (parts.length >= 2) {
      const lastName = parts[parts.length - 1];
      const firstNames = parts.slice(0, -1).join(' ');
      return `${lastName}, ${firstNames}`;
    }
    return author;
  }).join(' and ');
  
  // Create a citation key from first author's last name and year
  const firstAuthorLastName = paper.authors[0]?.split(' ').pop()?.toLowerCase() || 'unknown';
  const key = `${firstAuthorLastName}${year}`;
  
  return `@article{${key},
  author = {${authors}},
  title = {${paper.title}},
  journal = {${paper.journal}},
  year = {${year}},
  pmid = {${paper.pmid}},
  url = {${paper.url}}
}`;
}

/**
 * Generate APA citation
 */
function generateAPA(paper: ResearchPaper): string {
  const year = paper.date.split('-')[0] || 'n.d.';
  
  // Format authors (Last, F. M.)
  const formattedAuthors = paper.authors.map((author) => {
    const parts = author.split(' ');
    if (parts.length >= 2) {
      const lastName = parts[parts.length - 1];
      const initials = parts.slice(0, -1).map(name => name[0] + '.').join(' ');
      return `${lastName}, ${initials}`;
    }
    return author;
  });
  
  let authorString = '';
  if (formattedAuthors.length === 1) {
    authorString = formattedAuthors[0];
  } else if (formattedAuthors.length === 2) {
    authorString = `${formattedAuthors[0]}, & ${formattedAuthors[1]}`;
  } else if (formattedAuthors.length > 2) {
    authorString = formattedAuthors.slice(0, -1).join(', ') + ', & ' + formattedAuthors[formattedAuthors.length - 1];
  }
  
  return `${authorString} (${year}). ${paper.title}. ${paper.journal}. ${paper.url}`;
}

/**
 * Generate MLA citation
 */
function generateMLA(paper: ResearchPaper): string {
  const year = paper.date.split('-')[0] || 'n.d.';
  
  // Format authors (Last, First M.)
  const formattedAuthors = paper.authors.map((author, index) => {
    const parts = author.split(' ');
    if (parts.length >= 2) {
      const lastName = parts[parts.length - 1];
      const firstNames = parts.slice(0, -1).join(' ');
      if (index === 0) {
        return `${lastName}, ${firstNames}`;
      }
      return `${firstNames} ${lastName}`;
    }
    return author;
  });
  
  let authorString = '';
  if (formattedAuthors.length === 1) {
    authorString = formattedAuthors[0];
  } else if (formattedAuthors.length === 2) {
    authorString = `${formattedAuthors[0]}, and ${formattedAuthors[1]}`;
  } else if (formattedAuthors.length > 2) {
    authorString = `${formattedAuthors[0]}, et al`;
  }
  
  return `${authorString}. "${paper.title}." ${paper.journal}, ${year}. PubMed, ${paper.url}.`;
}

/**
 * Generate citation based on format
 */
function generateCitation(paper: ResearchPaper, format: CitationFormat): string {
  switch (format) {
    case 'bibtex':
      return generateBibTeX(paper);
    case 'apa':
      return generateAPA(paper);
    case 'mla':
      return generateMLA(paper);
    default:
      return '';
  }
}

export function CitationExport({ paper, isOpen, onClose }: CitationExportProps) {
  const [selectedFormat, setSelectedFormat] = useState<CitationFormat>('apa');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const citation = generateCitation(paper, selectedFormat);

  // Copy citation to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy citation:', error);
      alert('Failed to copy citation to clipboard');
    }
  };

  // Download citation as text file
  const handleDownload = () => {
    const blob = new Blob([citation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citation-${paper.pmid}-${selectedFormat}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Export Citation</h2>
              <p className="text-sm text-gray-600 mt-1">PMID: {paper.pmid}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Paper Title */}
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-2">{paper.title}</h3>
              <p className="text-sm text-gray-600">
                {paper.authors.join(', ')} ({paper.date.split('-')[0] || 'n.d.'})
              </p>
            </div>

            {/* Format Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Citation Format
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setSelectedFormat('apa')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedFormat === 'apa'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-semibold">APA</div>
                  <div className="text-xs mt-1 opacity-75">7th Edition</div>
                </button>
                <button
                  onClick={() => setSelectedFormat('mla')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedFormat === 'mla'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-semibold">MLA</div>
                  <div className="text-xs mt-1 opacity-75">9th Edition</div>
                </button>
                <button
                  onClick={() => setSelectedFormat('bibtex')}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedFormat === 'bibtex'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-semibold">BibTeX</div>
                  <div className="text-xs mt-1 opacity-75">LaTeX</div>
                </button>
              </div>
            </div>

            {/* Citation Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Citation Preview
              </label>
              <div className="relative">
                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap font-mono">
                  {citation}
                </pre>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy to Clipboard
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
