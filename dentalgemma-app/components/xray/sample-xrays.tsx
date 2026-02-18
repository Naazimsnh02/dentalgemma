'use client';

import { useState } from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import type { AnalysisType } from '@/types';

interface SampleXRay {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  analysisType: AnalysisType;
  thumbnail: string;
}

interface SampleXRaysProps {
  onSelectSample: (imageUrl: string, analysisType: AnalysisType) => void;
  className?: string;
}

// Sample X-ray images for testing
// In production, these would be actual dental X-ray images
const SAMPLE_XRAYS: SampleXRay[] = [
  {
    id: 'sample-1',
    name: 'Cavity Detection Sample',
    description: 'Bitewing X-ray showing potential cavities',
    imageUrl: '/samples/cavity-sample.jpg',
    analysisType: 'cavity',
    thumbnail: '/samples/cavity-sample-thumb.jpg',
  },
  {
    id: 'sample-2',
    name: 'OPG Panoramic Sample',
    description: 'Full panoramic radiograph for pathology classification',
    imageUrl: '/samples/opg-sample.jpg',
    analysisType: 'opg',
    thumbnail: '/samples/opg-sample-thumb.jpg',
  },
  {
    id: 'sample-4',
    name: 'General Assessment Sample',
    description: 'Standard dental X-ray for comprehensive evaluation',
    imageUrl: '/samples/general-sample.jpg',
    analysisType: 'general',
    thumbnail: '/samples/general-sample-thumb.jpg',
  },
  {
    id: 'sample-5',
    name: 'Multiple Cavities',
    description: 'X-ray showing multiple cavity formations',
    imageUrl: '/samples/multiple-cavities.jpg',
    analysisType: 'cavity',
    thumbnail: '/samples/multiple-cavities-thumb.jpg',
  },
  {
    id: 'sample-6',
    name: 'Impacted Tooth',
    description: 'OPG showing impacted wisdom tooth',
    imageUrl: '/samples/impacted-tooth.jpg',
    analysisType: 'opg',
    thumbnail: '/samples/impacted-tooth-thumb.jpg',
  },
  {
    id: 'sample-7',
    name: 'Healthy Teeth',
    description: 'Normal dental X-ray with no pathology',
    imageUrl: '/samples/healthy-teeth.jpg',
    analysisType: 'general',
    thumbnail: '/samples/healthy-teeth-thumb.jpg',
  },
  {
    id: 'sample-8',
    name: 'Root Canal Case',
    description: 'X-ray showing root canal treatment indication',
    imageUrl: '/samples/root-canal.jpg',
    analysisType: 'general',
    thumbnail: '/samples/root-canal-thumb.jpg',
  },
];

const analysisTypeLabels: Record<AnalysisType, string> = {
  cavity: 'Cavity Detection',
  opg: 'OPG Classification',
  general: 'General Assessment',
};

const analysisTypeColors: Record<AnalysisType, string> = {
  cavity: 'bg-red-500 dark:bg-red-600 text-white border border-black',
  opg: 'bg-blue-500 dark:bg-blue-600 text-white border border-black',
  general: 'bg-purple-500 dark:bg-purple-600 text-white border border-black',
};

export function SampleXRays({ onSelectSample, className = '' }: SampleXRaysProps) {
  const [selectedFilter, setSelectedFilter] = useState<AnalysisType | 'all'>('all');

  const filteredSamples =
    selectedFilter === 'all'
      ? SAMPLE_XRAYS
      : SAMPLE_XRAYS.filter((sample) => sample.analysisType === selectedFilter);

  const handleSampleClick = (sample: SampleXRay) => {
    onSelectSample(sample.imageUrl, sample.analysisType);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-foreground">
            Sample X-Rays
          </h3>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {Object.entries(analysisTypeLabels).map(([type, label]) => (
            <button
              key={type}
              onClick={() => setSelectedFilter(type as AnalysisType)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Click on any sample X-ray below to analyze it with DentalGemma AI. These are demo images
        for testing purposes.
      </p>

      {/* Gallery grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredSamples.map((sample) => (
          <button
            key={sample.id}
            onClick={() => handleSampleClick(sample)}
            className="group relative bg-card text-card-foreground rounded-lg border-2 border-border hover:border-blue-500 dark:hover:border-blue-500 transition-all overflow-hidden text-left"
          >
            {/* Image placeholder */}
            <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
              <ImageIcon className="w-12 h-12 text-gray-400" />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center text-white">
                  <Sparkles className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">Click to Analyze</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="text-sm font-semibold text-card-foreground line-clamp-1">
                  {sample.name}
                </h4>
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2">
                {sample.description}
              </p>

              <div>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    analysisTypeColors[sample.analysisType]
                  }`}
                >
                  {analysisTypeLabels[sample.analysisType]}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filteredSamples.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            No samples found for this filter
          </p>
        </div>
      )}

      {/* Note */}
      <div className="mt-6 p-4 bg-blue-500 dark:bg-blue-600 border border-black rounded-lg">
        <p className="text-sm text-white">
          <strong>Note:</strong> These are placeholder sample images. In production, actual dental
          X-ray images would be provided here for demonstration purposes.
        </p>
      </div>
    </div>
  );
}
