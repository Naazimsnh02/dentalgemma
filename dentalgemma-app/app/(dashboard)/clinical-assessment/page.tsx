'use client';

/**
 * Clinical Assessment Page
 * 
 * Main page for clinical case assessment feature:
 * - Multi-step form for data collection
 * - Auto-save functionality
 * - AI-powered assessment generation
 * - Comprehensive report display
 * - PDF export
 * - Save to history
 * 
 * Requirements: 2.1-2.15
 */

import { useState } from 'react';
import { CaseFormWithAutosave } from '@/components/case/case-form-with-autosave';
import { AssessmentReport } from '@/components/case/assessment-report';
import { generateAssessmentPDF } from '@/components/case/pdf-export';
import { useAppStore } from '@/store/app-store';
import type { ClinicalCase, CaseAssessment, AnalysisHistoryItem } from '@/types';
import { AlertCircle, Loader2, FileText } from 'lucide-react';

export default function ClinicalAssessmentPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessment, setAssessment] = useState<CaseAssessment | null>(null);
  const [caseData, setCaseData] = useState<ClinicalCase | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { setCurrentCaseAssessment, addToHistory } = useAppStore();

  // Handle form submission
  const handleSubmit = async (submittedCase: ClinicalCase) => {
    setIsSubmitting(true);
    setError(null);
    setCaseData(submittedCase);

    try {
      // Call API to assess case
      const response = await fetch('/api/assess-case', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseData: submittedCase,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assess case');
      }

      const result: CaseAssessment = await response.json();

      if (!result.success) {
        throw new Error('Assessment failed');
      }

      // Set assessment
      setAssessment(result);
      setCurrentCaseAssessment(result);

      // Add to history
      const historyItem: AnalysisHistoryItem = {
        id: crypto.randomUUID(),
        type: 'clinical',
        summary: `${result.diagnosis.primary} - ${result.urgency.toUpperCase()}`,
        urgency: result.urgency,
        data: {
          case: submittedCase,
          assessment: result,
        },
        timestamp: new Date(),
      };
      addToHistory(historyItem);

      // Clear auto-saved form data
      localStorage.removeItem('dentalgemma:form-autosave');
    } catch (err: any) {
      console.error('Assessment error:', err);
      setError(err.message || 'An unexpected error occurred during assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle PDF export
  const handleExport = () => {
    if (assessment && caseData) {
      generateAssessmentPDF({
        assessment,
        caseData,
        includePatientInfo: true,
      });
    }
  };

  // Handle new assessment
  const handleNewAssessment = () => {
    setAssessment(null);
    setCaseData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Clinical Case Assessment</h1>
          <p className="text-gray-600">
            Comprehensive AI-powered clinical assessment with evidence-based recommendations
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Assessment Error</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isSubmitting && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Analyzing Clinical Case...</h3>
                <p className="text-blue-700 text-sm">
                  DentalGemma is processing your case data and generating a comprehensive assessment.
                  This may take a few moments.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!assessment ? (
          // Show form if no assessment yet
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Before You Begin</h3>
                  <ul className="text-yellow-700 text-sm space-y-1 list-disc list-inside">
                    <li>This form auto-saves every 30 seconds to prevent data loss</li>
                    <li>All fields marked with * are required</li>
                    <li>You can navigate between steps using Previous/Next buttons</li>
                    <li>Review all information before submitting for assessment</li>
                  </ul>
                </div>
              </div>
            </div>

            <CaseFormWithAutosave
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        ) : (
          // Show assessment report
          <div>
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={handleNewAssessment}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                New Assessment
              </button>
            </div>

            <AssessmentReport
              assessment={assessment}
              onExport={handleExport}
            />
          </div>
        )}

        {/* Medical Disclaimer Footer */}
        <div className="mt-8 bg-gray-100 border border-gray-300 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">⚠️ Medical Disclaimer</h3>
          <p className="text-sm text-gray-700">
            This AI-powered assessment is for educational and informational purposes only. It does not constitute 
            medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers with 
            any questions regarding medical conditions. Never disregard professional medical advice or delay seeking 
            it because of information provided by this tool.
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Not HIPAA Compliant:</strong> Do not upload real patient data or personally identifiable 
            information. Use only de-identified or simulated case data for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
