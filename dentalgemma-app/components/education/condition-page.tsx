'use client';

/**
 * Condition Page Component
 * 
 * Displays detailed patient-friendly information about a dental condition
 * Requirements: 8.3, 8.9
 */

import { DentalCondition } from '@/types';
import { 
  ArrowLeft, 
  AlertCircle, 
  Stethoscope, 
  Pill, 
  Shield, 
  Link as LinkIcon,
  Share2,
  Printer
} from 'lucide-react';

interface ConditionPageProps {
  condition: DentalCondition;
  onBack: () => void;
  relatedConditions: DentalCondition[];
  onSelectRelated: (condition: DentalCondition) => void;
}

export function ConditionPage({
  condition,
  onBack,
  relatedConditions,
  onSelectRelated
}: ConditionPageProps) {
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: condition.name,
          text: condition.description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to conditions</span>
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className="text-5xl" role="img" aria-label={condition.name}>
              {condition.icon || '🦷'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {condition.name}
              </h1>
              <p className="text-lg text-gray-600 mb-3">
                {condition.description}
              </p>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                {condition.category}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleShare}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="Share"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors print:hidden"
              aria-label="Print"
            >
              <Printer size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Symptoms */}
          {condition.symptoms.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle size={24} className="text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Symptoms</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Common signs and symptoms you may experience:
              </p>
              <ul className="space-y-2">
                {condition.symptoms.map((symptom, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">•</span>
                    <span className="text-gray-700">{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Causes */}
          {condition.causes.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Stethoscope size={24} className="text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Causes</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                What typically causes this condition:
              </p>
              <ul className="space-y-2">
                {condition.causes.map((cause, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-orange-500 mt-1">•</span>
                    <span className="text-gray-700">{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Treatments */}
          {condition.treatments.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Pill size={24} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Treatments</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Available treatment options your dentist may recommend:
              </p>
              <ul className="space-y-2">
                {condition.treatments.map((treatment, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-gray-700">{treatment}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prevention */}
          {condition.prevention.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield size={24} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Prevention</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Steps you can take to prevent or reduce risk:
              </p>
              <ul className="space-y-2">
                {condition.prevention.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">•</span>
                    <span className="text-gray-700">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column - Related Conditions */}
        <div className="space-y-6">

          {/* Related Conditions */}
          {relatedConditions.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <LinkIcon size={20} className="text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Related Conditions</h2>
              </div>
              <div className="space-y-3">
                {relatedConditions.map((related) => (
                  <button
                    key={related.id}
                    onClick={() => onSelectRelated(related)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" role="img" aria-label={related.name}>
                        {related.icon || '🦷'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {related.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {related.category}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h2>
            <div className="space-y-3">
              <a
                href="/dentist-finder"
                className="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Find a Dentist
              </a>
              <a
                href="/symptom-checker"
                className="block w-full px-4 py-3 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Check Your Symptoms
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
