'use client';

/**
 * Patient Education Portal Page
 * 
 * Browse and learn about 98 dental conditions
 * Requirements: 8.1-8.10
 */

import { useState } from 'react';
import { DentalCondition } from '@/types';
import { ConditionBrowser } from '@/components/education/condition-browser';
import { ConditionPage } from '@/components/education/condition-page';
import { AnatomyExplorer } from '@/components/education/anatomy-explorer';
import { dentalConditions, getConditionById } from '@/lib/data/dental-conditions';
import { BookOpen, Microscope } from 'lucide-react';

export default function EducationPage() {
  const [selectedCondition, setSelectedCondition] = useState<DentalCondition | null>(null);
  const [showAnatomy, setShowAnatomy] = useState(false);

  // Get related conditions
  const getRelatedConditions = (condition: DentalCondition): DentalCondition[] => {
    return condition.relatedConditions
      .map(id => getConditionById(id))
      .filter((c): c is DentalCondition => c !== undefined)
      .slice(0, 5); // Limit to 5 related conditions
  };

  const handleSelectCondition = (condition: DentalCondition) => {
    setSelectedCondition(condition);
    setShowAnatomy(false);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedCondition(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <BookOpen size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Patient Education Portal
              </h1>
              <p className="text-gray-600 mt-1">
                Learn about dental conditions, treatments, and oral health
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {dentalConditions.length}
              </div>
              <div className="text-sm text-gray-600">Dental Conditions</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">8</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">32</div>
              <div className="text-sm text-gray-600">Adult Teeth</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        {!selectedCondition && (
          <div className="bg-white rounded-lg border border-gray-200 p-2 mb-6 flex gap-2">
            <button
              onClick={() => setShowAnatomy(false)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                !showAnatomy
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BookOpen size={20} />
              Browse Conditions
            </button>
            <button
              onClick={() => setShowAnatomy(true)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                showAnatomy
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Microscope size={20} />
              Dental Anatomy
            </button>
          </div>
        )}

        {/* Main Content */}
        {selectedCondition ? (
          <ConditionPage
            condition={selectedCondition}
            onBack={handleBack}
            relatedConditions={getRelatedConditions(selectedCondition)}
            onSelectRelated={handleSelectCondition}
          />
        ) : showAnatomy ? (
          <AnatomyExplorer />
        ) : (
          <ConditionBrowser onSelectCondition={handleSelectCondition} />
        )}

        {/* Medical Disclaimer Footer */}
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-amber-900 mb-3">
            ⚠️ Important Medical Disclaimer
          </h3>
          <div className="text-sm text-amber-950 space-y-2">
            <p>
              <strong>Educational Purpose Only:</strong> The information provided in this portal is for 
              educational purposes only and should not be used as a substitute for professional medical advice, 
              diagnosis, or treatment.
            </p>
            <p>
              <strong>Consult a Professional:</strong> Always seek the advice of your dentist or other qualified 
              healthcare provider with any questions you may have regarding a dental condition or treatment.
            </p>
            <p>
              <strong>Emergency Situations:</strong> If you are experiencing a dental emergency, contact your 
              dentist immediately or visit the nearest emergency room.
            </p>

          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/symptom-checker"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all group text-center"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              Symptom Checker
            </h3>
            <p className="text-sm text-gray-600">
              Check your symptoms and get urgency assessment
            </p>
          </a>
          <a
            href="/dentist-finder"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all group text-center"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              Find a Dentist
            </h3>
            <p className="text-sm text-gray-600">
              Locate qualified dental professionals near you
            </p>
          </a>
          <a
            href="/research"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all group text-center"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              Research Dashboard
            </h3>
            <p className="text-sm text-gray-600">
              Access evidence-based dental research from PubMed
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
