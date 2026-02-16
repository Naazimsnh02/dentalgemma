'use client';

/**
 * Clinical Assessment Report Component
 * 
 * Displays comprehensive assessment results with all 8 sections:
 * 1. Diagnosis (primary, ICD-10, confidence, differential)
 * 2. Etiology (root cause, contributing factors, risk factors)
 * 3. Urgency (emergency, urgent, routine, home-care)
 * 4. Management Plan (immediate, protocol, alternatives, outcomes, duration)
 * 5. Antibiotics (indication, drug, dosage, duration, alternatives, rationale)
 * 6. Follow-up (timing, monitoring, long-term, red flags)
 * 7. Patient Counseling (explanation, home care, dietary, pain management, emergency triggers)
 * 8. Clinical Guidelines (relevant, references, evidence level)
 * 
 * Features:
 * - Collapsible sections
 * - Color-coded urgency indicators
 * - Professional medical formatting
 * 
 * Requirements: 2.6-2.13
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, Clock, CheckCircle, Info } from 'lucide-react';
import type { CaseAssessment, UrgencyLevel } from '@/types';

interface AssessmentReportProps {
  assessment: CaseAssessment;
  onExport?: () => void;
}

export function AssessmentReport({ assessment, onExport }: AssessmentReportProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['diagnosis', 'urgency', 'management'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Urgency color mapping
  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'urgent':
        return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'routine':
        return 'bg-blue-100 border-blue-500 text-blue-900';
      case 'home-care':
        return 'bg-green-100 border-green-500 text-green-900';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  const getUrgencyIcon = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'emergency':
        return <AlertTriangle className="w-5 h-5" />;
      case 'urgent':
        return <Clock className="w-5 h-5" />;
      case 'routine':
        return <Info className="w-5 h-5" />;
      case 'home-care':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getUrgencyLabel = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'emergency':
        return 'EMERGENCY - Immediate Care Required';
      case 'urgent':
        return 'URGENT - See Dentist Within 24-48 Hours';
      case 'routine':
        return 'ROUTINE - Schedule Regular Appointment';
      case 'home-care':
        return 'HOME CARE - Self-Care with Monitoring';
      default:
        return String(urgency).toUpperCase();
    }
  };

  // Section component
  const Section = ({ 
    id, 
    title, 
    children, 
    defaultExpanded = false 
  }: { 
    id: string; 
    title: string; 
    children: React.ReactNode; 
    defaultExpanded?: boolean;
  }) => {
    const isExpanded = expandedSections.has(id);

    return (
      <div className="border rounded-lg overflow-hidden mb-4">
        <button
          onClick={() => toggleSection(id)}
          className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>
        {isExpanded && (
          <div className="px-6 py-4 bg-white">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-900">Clinical Assessment Report</h2>
          {onExport && (
            <button
              onClick={onExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Export PDF
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Processing Time: {assessment.processingTime.toFixed(2)}s
        </p>
      </div>

      {/* Urgency Banner */}
      <div className={`rounded-lg border-l-4 p-6 mb-6 ${getUrgencyColor(assessment.urgency)}`}>
        <div className="flex items-center gap-3">
          {getUrgencyIcon(assessment.urgency)}
          <div>
            <h3 className="text-xl font-bold">{getUrgencyLabel(assessment.urgency)}</h3>
            <p className="text-sm mt-1">
              {assessment.urgency === 'emergency' && 'Seek immediate medical attention at emergency room or urgent care.'}
              {assessment.urgency === 'urgent' && 'Contact your dentist as soon as possible for an appointment.'}
              {assessment.urgency === 'routine' && 'Schedule a regular dental appointment at your convenience.'}
              {assessment.urgency === 'home-care' && 'Follow home care instructions and monitor symptoms.'}
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Diagnosis */}
      <Section id="diagnosis" title="1. Diagnosis" defaultExpanded>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Primary Diagnosis</h4>
            <p className="text-lg font-medium text-gray-900">{assessment.diagnosis.primary}</p>
            <p className="text-sm text-gray-600 mt-1">ICD-10 Code: {assessment.diagnosis.icd10}</p>
            <div className="mt-2">
              <span className="text-sm text-gray-600">Confidence: </span>
              <span className="font-semibold">{(assessment.diagnosis.confidence * 100).toFixed(1)}%</span>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${assessment.diagnosis.confidence * 100}%` }}
                />
              </div>
            </div>
          </div>

          {assessment.diagnosis.differential.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Differential Diagnoses</h4>
              <ul className="list-disc list-inside space-y-1">
                {assessment.diagnosis.differential.map((diff, index) => (
                  <li key={index} className="text-gray-700">{diff}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {/* Section 2: Etiology */}
      <Section id="etiology" title="2. Etiology">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Root Cause</h4>
            <p className="text-gray-700">{assessment.etiology.rootCause}</p>
          </div>

          {assessment.etiology.contributingFactors.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Contributing Factors</h4>
              <ul className="list-disc list-inside space-y-1">
                {assessment.etiology.contributingFactors.map((factor, index) => (
                  <li key={index} className="text-gray-700">{factor}</li>
                ))}
              </ul>
            </div>
          )}

          {assessment.etiology.riskFactors.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Risk Factors</h4>
              <ul className="list-disc list-inside space-y-1">
                {assessment.etiology.riskFactors.map((risk, index) => (
                  <li key={index} className="text-gray-700">{risk}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {/* Section 3: Management Plan */}
      <Section id="management" title="3. Management Plan" defaultExpanded>
        <div className="space-y-4">
          {assessment.managementPlan.immediate.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Immediate Actions</h4>
              <ul className="list-decimal list-inside space-y-1">
                {assessment.managementPlan.immediate.map((action, index) => (
                  <li key={index} className="text-gray-700">{action}</li>
                ))}
              </ul>
            </div>
          )}

          {assessment.managementPlan.protocol.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Treatment Protocol</h4>
              <ol className="list-decimal list-inside space-y-1">
                {assessment.managementPlan.protocol.map((step, index) => (
                  <li key={index} className="text-gray-700">{step}</li>
                ))}
              </ol>
            </div>
          )}

          {assessment.managementPlan.alternatives.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Alternative Treatments</h4>
              <ul className="list-disc list-inside space-y-1">
                {assessment.managementPlan.alternatives.map((alt, index) => (
                  <li key={index} className="text-gray-700">{alt}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Expected Outcomes</h4>
              <p className="text-gray-700">{assessment.managementPlan.expectedOutcomes}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Duration</h4>
              <p className="text-gray-700">{assessment.managementPlan.duration}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Section 4: Antibiotics (if applicable) */}
      {assessment.antibiotics && (
        <Section id="antibiotics" title="4. Antibiotic Recommendations">
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="font-semibold text-gray-700 mb-2">Indication</h4>
              <p className="text-gray-700">{assessment.antibiotics.indication}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Drug</h4>
                <p className="text-gray-700">{assessment.antibiotics.drug}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Dosage</h4>
                <p className="text-gray-700">{assessment.antibiotics.dosage}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Duration</h4>
                <p className="text-gray-700">{assessment.antibiotics.duration}</p>
              </div>
            </div>

            {assessment.antibiotics.alternatives.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Alternative Antibiotics</h4>
                <ul className="list-disc list-inside space-y-1">
                  {assessment.antibiotics.alternatives.map((alt, index) => (
                    <li key={index} className="text-gray-700">{alt}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Rationale</h4>
              <p className="text-gray-700">{assessment.antibiotics.rationale}</p>
            </div>
          </div>
        </Section>
      )}

      {/* Section 5: Follow-up */}
      <Section id="followup" title="5. Follow-up Schedule">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Initial Follow-up</h4>
            <p className="text-gray-700">{assessment.followUp.initialTiming}</p>
          </div>

          {assessment.followUp.monitoring.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Monitoring Parameters</h4>
              <ul className="list-disc list-inside space-y-1">
                {assessment.followUp.monitoring.map((param, index) => (
                  <li key={index} className="text-gray-700">{param}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Long-term Care</h4>
            <p className="text-gray-700">{assessment.followUp.longTerm}</p>
          </div>

          {assessment.followUp.redFlags.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Red Flags - Seek Immediate Care If:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {assessment.followUp.redFlags.map((flag, index) => (
                  <li key={index} className="text-red-700">{flag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {/* Section 6: Patient Counseling */}
      <Section id="counseling" title="6. Patient Counseling">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Explanation for Patient</h4>
            <p className="text-gray-700">{assessment.patientCounseling.explanation}</p>
          </div>

          {assessment.patientCounseling.homeCare.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Home Care Instructions</h4>
              <ul className="list-disc list-inside space-y-1">
                {assessment.patientCounseling.homeCare.map((instruction, index) => (
                  <li key={index} className="text-gray-700">{instruction}</li>
                ))}
              </ul>
            </div>
          )}

          {assessment.patientCounseling.dietary.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Dietary Recommendations</h4>
              <ul className="list-disc list-inside space-y-1">
                {assessment.patientCounseling.dietary.map((diet, index) => (
                  <li key={index} className="text-gray-700">{diet}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Pain Management</h4>
            <p className="text-gray-700">{assessment.patientCounseling.painManagement}</p>
          </div>

          {assessment.patientCounseling.emergencyTriggers.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
              <h4 className="font-semibold text-orange-700 mb-2">Emergency Triggers</h4>
              <p className="text-sm text-orange-600 mb-2">Seek immediate care if you experience:</p>
              <ul className="list-disc list-inside space-y-1">
                {assessment.patientCounseling.emergencyTriggers.map((trigger, index) => (
                  <li key={index} className="text-orange-700">{trigger}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {/* Section 7: Clinical Guidelines */}
      <Section id="guidelines" title="7. Clinical Guidelines & Evidence">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-gray-700">Evidence Level:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              assessment.guidelines.evidenceLevel === 'A' ? 'bg-green-100 text-green-800' :
              assessment.guidelines.evidenceLevel === 'B' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              Level {assessment.guidelines.evidenceLevel}
            </span>
            <span className="text-xs text-gray-600">
              {assessment.guidelines.evidenceLevel === 'A' && '(High-quality evidence)'}
              {assessment.guidelines.evidenceLevel === 'B' && '(Moderate-quality evidence)'}
              {assessment.guidelines.evidenceLevel === 'C' && '(Low-quality evidence)'}
            </span>
          </div>

          {assessment.guidelines.relevant.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Relevant Guidelines</h4>
              <ul className="list-disc list-inside space-y-1">
                {assessment.guidelines.relevant.map((guideline, index) => (
                  <li key={index} className="text-gray-700">{guideline}</li>
                ))}
              </ul>
            </div>
          )}

          {assessment.guidelines.references.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">References</h4>
              <ol className="list-decimal list-inside space-y-1">
                {assessment.guidelines.references.map((ref, index) => (
                  <li key={index} className="text-sm text-gray-600">{ref}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </Section>

      {/* Medical Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
        <p className="text-xs text-gray-600">
          <strong>Medical Disclaimer:</strong> This assessment is generated by AI and is for educational purposes only. 
          It should not replace professional medical advice, diagnosis, or treatment. Always consult with a qualified 
          healthcare provider for medical decisions.
        </p>
      </div>
    </div>
  );
}
