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

const SAMPLE_XRAYS: SampleXRay[] = [
  {
    id: 'cavity-1',
    name: 'Cavity Detection - Clinical Photo',
    description: 'Clinical photograph for cavity and normal region detection',
    imageUrl: '/samples/cavity-sample.jpg',
    analysisType: 'cavity',
    thumbnail: '/samples/cavity-sample.jpg',
  },
  {
    id: 'cavity-2',
    name: 'Cavity Detection - Intraoral Photo',
    description: 'Intraoral photograph for cavity assessment',
    imageUrl: '/samples/cavity-sample-2.jpg',
    analysisType: 'cavity',
    thumbnail: '/samples/cavity-sample-2.jpg',
  },
  {
    id: 'cavity-3',
    name: 'Cavity Detection - Dental Photo',
    description: 'Clinical dental photograph showing tooth decay patterns',
    imageUrl: '/samples/cavity-sample-3.jpg',
    analysisType: 'cavity',
    thumbnail: '/samples/cavity-sample-3.jpg',
  },
  {
    id: 'opg-caries',
    name: 'OPG - Caries',
    description: 'Panoramic X-ray revealing dental caries (tooth decay)',
    imageUrl: '/samples/opg-caries.jpg',
    analysisType: 'opg',
    thumbnail: '/samples/opg-caries.jpg',
  },
  {
    id: 'opg-impacted',
    name: 'OPG - Impacted Teeth',
    description: 'Panoramic X-ray showing impacted wisdom teeth',
    imageUrl: '/samples/opg-impacted.jpg',
    analysisType: 'opg',
    thumbnail: '/samples/opg-impacted.jpg',
  },
  {
    id: 'opg-infection',
    name: 'OPG - Infection',
    description: 'Panoramic X-ray showing signs of dental infection',
    imageUrl: '/samples/opg-infection.jpg',
    analysisType: 'opg',
    thumbnail: '/samples/opg-infection.jpg',
  },
  {
    id: 'general-1',
    name: 'General Assessment - Intraoral',
    description: 'Intraoral radiograph for systematic dental assessment',
    imageUrl: '/samples/general-sample.jpg',
    analysisType: 'general',
    thumbnail: '/samples/general-sample.jpg',
  },
  {
    id: 'general-2',
    name: 'General Assessment - Bitewing',
    description: 'Intraoral bitewing radiograph for clinical evaluation',
    imageUrl: '/samples/general-sample-2.jpg',
    analysisType: 'general',
    thumbnail: '/samples/general-sample-2.jpg',
  },
];

const analysisTypeLabels: Record<AnalysisType, string> = {
  cavity: 'Cavity Detection',
  opg: 'OPG Classification',
  'tooth-id': 'Tooth Identification',
  general: 'General Assessment',
};

const analysisTypeColors: Record<AnalysisType, string> = {
  cavity: 'bg-red-500 dark:bg-red-600 text-white border border-black',
  opg: 'bg-blue-500 dark:bg-blue-600 text-white border border-black',
  'tooth-id': 'bg-green-500 dark:bg-green-600 text-white border border-black',
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
            Sample Images
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
        Click on any sample image below to analyze it with DentalGemma AI.
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
              <img 
                src={sample.imageUrl} 
                alt={sample.name} 
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
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


    </div>
  );
}
