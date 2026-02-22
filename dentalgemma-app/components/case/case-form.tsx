'use client';

/**
 * Simplified Clinical Case Form Component (Training-Aligned)
 * 
 * 5-step form matching exact training data format:
 * Step 1: Patient Information (Age, Gender, Occupation)
 * Step 2: Chief Complaint & History
 * Step 3: Clinical Findings (single field)
 * Step 4: Radiographic Findings (single field, optional X-ray upload)
 * Step 5: Medical History (Systemic Conditions, Medications, Habits)
 * 
 * Aligned with: Wildstashdental 2.5k-instruct training data
 */

import { useState, useEffect } from 'react';
import { z } from 'zod';
import type { ClinicalCase, PatientInfo, ChiefComplaint, ClinicalFindings, RadiographicFindings, MedicalHistory } from '@/types';

// ============================================================================
// Validation Schemas (Training-Aligned)
// ============================================================================

// Step 1: Patient Information Schema
export const patientInfoSchema = z.object({
  age: z.number().min(0).max(150, 'Age must be between 0 and 150'),
  gender: z.enum(['male', 'female', 'other']),
  occupation: z.string().optional(),
});

// Step 2: Chief Complaint Schema
export const chiefComplaintSchema = z.object({
  description: z.string().min(1, 'Please describe the chief complaint'),
});

// History Schema (separate field)
export const historySchema = z.object({
  history: z.string().min(1, 'Please provide patient history'),
});

// Step 3: Clinical Findings Schema
export const clinicalFindingsSchema = z.object({
  description: z.string().min(1, 'Please describe clinical findings'),
});

// Step 4: Radiographic Findings Schema
export const radiographicFindingsSchema = z.object({
  description: z.string().min(1, 'Please describe radiographic findings'),
  xrayImage: z.string().optional(),
});

// Step 5: Medical History Schema
export const medicalHistorySchema = z.object({
  systemicConditions: z.string().optional(),
  medications: z.string().optional(),
  habits: z.string().optional(),
});

// Complete Case Schema
export const clinicalCaseSchema = z.object({
  patient: patientInfoSchema,
  chiefComplaint: chiefComplaintSchema,
  history: z.string().min(1),
  clinicalFindings: clinicalFindingsSchema,
  radiographicFindings: radiographicFindingsSchema,
  medicalHistory: medicalHistorySchema,
});

export type ClinicalCaseFormData = z.infer<typeof clinicalCaseSchema>;

// ============================================================================
// Component Props
// ============================================================================

interface CaseFormProps {
  onSubmit: (caseData: ClinicalCase) => void;
  onSave?: (caseData: Partial<ClinicalCase>) => void;
  initialData?: Partial<ClinicalCase>;
  isSubmitting?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export function CaseForm({ onSubmit, onSave, initialData, isSubmitting = false }: CaseFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state for each step
  const [patientInfo, setPatientInfo] = useState<Partial<PatientInfo>>({
    age: initialData?.patient?.age,
    gender: initialData?.patient?.gender,
    occupation: initialData?.patient?.occupation || '',
  });

  const [chiefComplaint, setChiefComplaint] = useState<Partial<ChiefComplaint>>({
    description: initialData?.chiefComplaint?.description || '',
  });

  const [history, setHistory] = useState<string>(initialData?.history || '');

  const [clinicalFindings, setClinicalFindings] = useState<Partial<ClinicalFindings>>({
    description: initialData?.clinicalFindings?.description || '',
  });

  const [radiographicFindings, setRadiographicFindings] = useState<Partial<RadiographicFindings>>({
    description: initialData?.radiographicFindings?.description || '',
    xrayImage: initialData?.radiographicFindings?.xrayImage || '',
  });

  const [medicalHistory, setMedicalHistory] = useState<Partial<MedicalHistory>>({
    systemicConditions: initialData?.medicalHistory?.systemicConditions || '',
    medications: initialData?.medicalHistory?.medications || '',
    habits: initialData?.medicalHistory?.habits || '',
    history: initialData?.medicalHistory?.history || '',
  });

  // Trigger save callback when form data changes
  useEffect(() => {
    if (onSave) {
      const partialCase: Partial<ClinicalCase> = {
        patient: patientInfo as PatientInfo,
        chiefComplaint: chiefComplaint as ChiefComplaint,
        history,
        clinicalFindings: clinicalFindings as ClinicalFindings,
        radiographicFindings: radiographicFindings as RadiographicFindings,
        medicalHistory: medicalHistory as MedicalHistory,
      };
      onSave(partialCase);
    }
  }, [patientInfo, chiefComplaint, history, clinicalFindings, radiographicFindings, medicalHistory, onSave]);

  // Validate current step
  const validateStep = (step: number): boolean => {
    setErrors({});
    
    try {
      switch (step) {
        case 1:
          patientInfoSchema.parse(patientInfo);
          break;
        case 2:
          chiefComplaintSchema.parse(chiefComplaint);
          historySchema.parse({ history });
          break;
        case 3:
          clinicalFindingsSchema.parse(clinicalFindings);
          break;
        case 4:
          radiographicFindingsSchema.parse(radiographicFindings);
          break;
        case 5:
          medicalHistorySchema.parse(medicalHistory);
          break;
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    // Validate all steps
    const allValid = [1, 2, 3, 4, 5].every((step) => validateStep(step));
    
    if (allValid) {
      const completeCase: ClinicalCase = {
        id: initialData?.id || crypto.randomUUID(),
        patient: patientInfo as PatientInfo,
        chiefComplaint: chiefComplaint as ChiefComplaint,
        history,
        clinicalFindings: clinicalFindings as ClinicalFindings,
        radiographicFindings: radiographicFindings as RadiographicFindings,
        medicalHistory: medicalHistory as MedicalHistory,
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      onSubmit(completeCase);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < 5 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === currentStep
                    ? 'bg-blue-600 text-white'
                    : step < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step}
              </div>
              {step < 5 && (
                <div
                  className={`h-1 flex-1 mx-2 ${
                    step < currentStep ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-600 mt-2">
          Step {currentStep} of 5
        </div>
      </div>

      {/* Form Steps */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Step 1: Patient Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Patient Information</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={patientInfo.age || ''}
                onChange={(e) => setPatientInfo({ ...patientInfo, age: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-md"
                min="0"
                max="150"
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={patientInfo.gender || ''}
                onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Occupation
              </label>
              <input
                type="text"
                value={patientInfo.occupation || ''}
                onChange={(e) => setPatientInfo({ ...patientInfo, occupation: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., Teacher, Engineer, Retired"
              />
              <p className="text-sm text-gray-500 mt-1">Optional but helps provide context</p>
            </div>
          </div>
        )}

        {/* Step 2: Chief Complaint & History */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Chief Complaint & History</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Chief Complaint <span className="text-red-500">*</span>
              </label>
              <textarea
                value={chiefComplaint.description || ''}
                onChange={(e) => setChiefComplaint({ ...chiefComplaint, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="e.g., Patient presenting with severe tooth pain"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              <p className="text-sm text-gray-500 mt-1">Brief description of the main complaint</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                History <span className="text-red-500">*</span>
              </label>
              <textarea
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
                placeholder="e.g., Patient reports pain for 3 days, worsening with cold drinks, occasional sensitivity to hot/cold"
              />
              {errors.history && <p className="text-red-500 text-sm mt-1">{errors.history}</p>}
              <p className="text-sm text-gray-500 mt-1">Include duration, progression, triggers, and relevant background</p>
            </div>
          </div>
        )}

        {/* Step 3: Clinical Findings */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Clinical Findings</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Clinical Examination Findings <span className="text-red-500">*</span>
              </label>
              <textarea
                value={clinicalFindings.description || ''}
                onChange={(e) => setClinicalFindings({ ...clinicalFindings, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={6}
                placeholder="e.g., Tooth #16 has a defective amalgam restoration with visible decay. Positive percussion test. No mobility. Gingiva appears normal with no swelling."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              <p className="text-sm text-gray-500 mt-1">
                Include intraoral, extraoral, soft tissue, and periodontal findings
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Radiographic Findings */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Radiographic Findings</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Radiographic Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={radiographicFindings.description || ''}
                onChange={(e) => setRadiographicFindings({ ...radiographicFindings, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={5}
                placeholder="e.g., Periapical radiograph shows periapical radiolucency around tooth #16. Bone loss visible. Widened PDL space noted."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              <p className="text-sm text-gray-500 mt-1">
                Include bone loss, periapical status, and any other radiographic observations
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Medical History */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Medical History</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Medical History / Systemic Conditions
              </label>
              <textarea
                value={medicalHistory.systemicConditions || ''}
                onChange={(e) => setMedicalHistory({ ...medicalHistory, systemicConditions: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder='e.g., Diabetes mellitus type 2, Hypertension, or "None significant"'
              />
              {errors.systemicConditions && <p className="text-red-500 text-sm mt-1">{errors.systemicConditions}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Current Medications
              </label>
              <textarea
                value={medicalHistory.medications || ''}
                onChange={(e) => setMedicalHistory({ ...medicalHistory, medications: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder='e.g., Metformin 500mg, Lisinopril 10mg, or "None"'
              />
              {errors.medications && <p className="text-red-500 text-sm mt-1">{errors.medications}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Habits
              </label>
              <textarea
                value={medicalHistory.habits || ''}
                onChange={(e) => setMedicalHistory({ ...medicalHistory, habits: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
                placeholder='e.g., Smoking 10 cigarettes/day, or "None reported"'
              />
              {errors.habits && <p className="text-red-500 text-sm mt-1">{errors.habits}</p>}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
