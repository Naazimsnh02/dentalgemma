'use client';

/**
 * Multi-Step Clinical Case Form Component
 * 
 * 5-step form for collecting comprehensive patient information:
 * Step 1: Patient Information
 * Step 2: Chief Complaint
 * Step 3: Clinical Findings
 * Step 4: Radiographic Findings (with optional X-ray upload)
 * Step 5: Medical History
 * 
 * Requirements: 2.1-2.5
 */

import { useState, useEffect } from 'react';
import { z } from 'zod';
import type { ClinicalCase, PatientInfo, ChiefComplaint, ClinicalFindings, RadiographicFindings, MedicalHistory } from '@/types';

// ============================================================================
// Validation Schemas (Requirements 2.1-2.5)
// ============================================================================

// Step 1: Patient Information Schema
export const patientInfoSchema = z.object({
  age: z.number().min(0).max(150, 'Age must be between 0 and 150'),
  gender: z.enum(['male', 'female', 'other']),
  patientId: z.string().optional(),
});

// Step 2: Chief Complaint Schema
export const chiefComplaintSchema = z.object({
  description: z.string().min(1, 'Please describe the chief complaint'),
  duration: z.string().min(1, 'Please specify the duration'),
  painLevel: z.number().min(1).max(10, 'Pain level must be between 1 and 10'),
  triggers: z.array(z.string()).default([]),
});

// Step 3: Clinical Findings Schema
export const clinicalFindingsSchema = z.object({
  intraoral: z.string().min(1, 'Please describe intraoral findings'),
  extraoral: z.string().min(1, 'Please describe extraoral findings'),
  softTissue: z.string().min(1, 'Please describe soft tissue status'),
  periodontal: z.string().min(1, 'Please describe periodontal status'),
});

// Step 4: Radiographic Findings Schema
export const radiographicFindingsSchema = z.object({
  description: z.string().min(1, 'Please describe radiographic findings'),
  xrayImage: z.string().optional(),
  boneLoss: z.string().min(1, 'Please describe bone loss status'),
  periapicalStatus: z.string().min(1, 'Please describe periapical status'),
});

// Step 5: Medical History Schema
export const medicalHistorySchema = z.object({
  medications: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  systemicConditions: z.array(z.string()).default([]),
  previousTreatments: z.array(z.string()).default([]),
});

// Complete Case Schema
export const clinicalCaseSchema = z.object({
  patient: patientInfoSchema,
  chiefComplaint: chiefComplaintSchema,
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
    patientId: initialData?.patient?.patientId || '',
  });

  const [chiefComplaint, setChiefComplaint] = useState<Partial<ChiefComplaint>>({
    description: initialData?.chiefComplaint?.description || '',
    duration: initialData?.chiefComplaint?.duration || '',
    painLevel: initialData?.chiefComplaint?.painLevel || 5,
    triggers: initialData?.chiefComplaint?.triggers || [],
  });

  const [clinicalFindings, setClinicalFindings] = useState<Partial<ClinicalFindings>>({
    intraoral: initialData?.clinicalFindings?.intraoral || '',
    extraoral: initialData?.clinicalFindings?.extraoral || '',
    softTissue: initialData?.clinicalFindings?.softTissue || '',
    periodontal: initialData?.clinicalFindings?.periodontal || '',
  });

  const [radiographicFindings, setRadiographicFindings] = useState<Partial<RadiographicFindings>>({
    description: initialData?.radiographicFindings?.description || '',
    xrayImage: initialData?.radiographicFindings?.xrayImage || '',
    boneLoss: initialData?.radiographicFindings?.boneLoss || '',
    periapicalStatus: initialData?.radiographicFindings?.periapicalStatus || '',
  });

  const [medicalHistory, setMedicalHistory] = useState<Partial<MedicalHistory>>({
    medications: initialData?.medicalHistory?.medications || [],
    allergies: initialData?.medicalHistory?.allergies || [],
    systemicConditions: initialData?.medicalHistory?.systemicConditions || [],
    previousTreatments: initialData?.medicalHistory?.previousTreatments || [],
  });

  // Trigger save callback when form data changes
  useEffect(() => {
    if (onSave) {
      const partialCase: Partial<ClinicalCase> = {
        patient: patientInfo as PatientInfo,
        chiefComplaint: chiefComplaint as ChiefComplaint,
        clinicalFindings: clinicalFindings as ClinicalFindings,
        radiographicFindings: radiographicFindings as RadiographicFindings,
        medicalHistory: medicalHistory as MedicalHistory,
      };
      onSave(partialCase);
    }
  }, [patientInfo, chiefComplaint, clinicalFindings, radiographicFindings, medicalHistory, onSave]);

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
        clinicalFindings: clinicalFindings as ClinicalFindings,
        radiographicFindings: radiographicFindings as RadiographicFindings,
        medicalHistory: medicalHistory as MedicalHistory,
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      onSubmit(completeCase);
    }
  };

  // Helper to add/remove items from arrays
  const addArrayItem = (setter: Function, currentArray: string[]) => {
    const input = prompt('Enter item:');
    if (input && input.trim()) {
      setter([...currentArray, input.trim()]);
    }
  };

  const removeArrayItem = (setter: Function, currentArray: string[], index: number) => {
    setter(currentArray.filter((_, i) => i !== index));
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
                Patient ID (Optional)
              </label>
              <input
                type="text"
                value={patientInfo.patientId || ''}
                onChange={(e) => setPatientInfo({ ...patientInfo, patientId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., P12345"
              />
            </div>
          </div>
        )}

        {/* Step 2: Chief Complaint */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Chief Complaint</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={chiefComplaint.description || ''}
                onChange={(e) => setChiefComplaint({ ...chiefComplaint, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
                placeholder="Describe the patient's main complaint..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Duration <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={chiefComplaint.duration || ''}
                onChange={(e) => setChiefComplaint({ ...chiefComplaint, duration: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., 3 days, 2 weeks"
              />
              {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Pain Level (1-10) <span className="text-red-500">*</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={chiefComplaint.painLevel || 5}
                onChange={(e) => setChiefComplaint({ ...chiefComplaint, painLevel: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="text-center text-lg font-semibold">{chiefComplaint.painLevel || 5}</div>
              {errors.painLevel && <p className="text-red-500 text-sm mt-1">{errors.painLevel}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Triggers
              </label>
              <div className="space-y-2">
                {chiefComplaint.triggers?.map((trigger, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-gray-100 rounded-md">{trigger}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newTriggers = chiefComplaint.triggers?.filter((_, i) => i !== index) || [];
                        setChiefComplaint({ ...chiefComplaint, triggers: newTriggers });
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(
                    (newTriggers: string[]) => setChiefComplaint({ ...chiefComplaint, triggers: newTriggers }),
                    chiefComplaint.triggers || []
                  )}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Trigger
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Clinical Findings */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Clinical Findings</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Intraoral Findings <span className="text-red-500">*</span>
              </label>
              <textarea
                value={clinicalFindings.intraoral || ''}
                onChange={(e) => setClinicalFindings({ ...clinicalFindings, intraoral: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Describe intraoral examination findings..."
              />
              {errors.intraoral && <p className="text-red-500 text-sm mt-1">{errors.intraoral}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Extraoral Findings <span className="text-red-500">*</span>
              </label>
              <textarea
                value={clinicalFindings.extraoral || ''}
                onChange={(e) => setClinicalFindings({ ...clinicalFindings, extraoral: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Describe extraoral examination findings..."
              />
              {errors.extraoral && <p className="text-red-500 text-sm mt-1">{errors.extraoral}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Soft Tissue Status <span className="text-red-500">*</span>
              </label>
              <textarea
                value={clinicalFindings.softTissue || ''}
                onChange={(e) => setClinicalFindings({ ...clinicalFindings, softTissue: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Describe soft tissue status..."
              />
              {errors.softTissue && <p className="text-red-500 text-sm mt-1">{errors.softTissue}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Periodontal Status <span className="text-red-500">*</span>
              </label>
              <textarea
                value={clinicalFindings.periodontal || ''}
                onChange={(e) => setClinicalFindings({ ...clinicalFindings, periodontal: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Describe periodontal status..."
              />
              {errors.periodontal && <p className="text-red-500 text-sm mt-1">{errors.periodontal}</p>}
            </div>
          </div>
        )}

        {/* Step 4: Radiographic Findings */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Radiographic Findings</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={radiographicFindings.description || ''}
                onChange={(e) => setRadiographicFindings({ ...radiographicFindings, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
                placeholder="Describe radiographic findings..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                X-Ray Image (Optional)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,.dcm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setRadiographicFindings({ ...radiographicFindings, xrayImage: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
              {radiographicFindings.xrayImage && (
                <div className="mt-2">
                  <img
                    src={radiographicFindings.xrayImage}
                    alt="X-ray preview"
                    className="max-w-xs rounded-md border"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Bone Loss <span className="text-red-500">*</span>
              </label>
              <textarea
                value={radiographicFindings.boneLoss || ''}
                onChange={(e) => setRadiographicFindings({ ...radiographicFindings, boneLoss: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
                placeholder="Describe bone loss status..."
              />
              {errors.boneLoss && <p className="text-red-500 text-sm mt-1">{errors.boneLoss}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Periapical Status <span className="text-red-500">*</span>
              </label>
              <textarea
                value={radiographicFindings.periapicalStatus || ''}
                onChange={(e) => setRadiographicFindings({ ...radiographicFindings, periapicalStatus: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={2}
                placeholder="Describe periapical status..."
              />
              {errors.periapicalStatus && <p className="text-red-500 text-sm mt-1">{errors.periapicalStatus}</p>}
            </div>
          </div>
        )}

        {/* Step 5: Medical History */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Medical History</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Medications
              </label>
              <div className="space-y-2">
                {medicalHistory.medications?.map((med, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-gray-100 rounded-md">{med}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem(
                        (newMeds: string[]) => setMedicalHistory({ ...medicalHistory, medications: newMeds }),
                        medicalHistory.medications || [],
                        index
                      )}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(
                    (newMeds: string[]) => setMedicalHistory({ ...medicalHistory, medications: newMeds }),
                    medicalHistory.medications || []
                  )}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Medication
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Allergies
              </label>
              <div className="space-y-2">
                {medicalHistory.allergies?.map((allergy, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-gray-100 rounded-md">{allergy}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem(
                        (newAllergies: string[]) => setMedicalHistory({ ...medicalHistory, allergies: newAllergies }),
                        medicalHistory.allergies || [],
                        index
                      )}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(
                    (newAllergies: string[]) => setMedicalHistory({ ...medicalHistory, allergies: newAllergies }),
                    medicalHistory.allergies || []
                  )}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Allergy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Systemic Conditions
              </label>
              <div className="space-y-2">
                {medicalHistory.systemicConditions?.map((condition, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-gray-100 rounded-md">{condition}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem(
                        (newConditions: string[]) => setMedicalHistory({ ...medicalHistory, systemicConditions: newConditions }),
                        medicalHistory.systemicConditions || [],
                        index
                      )}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(
                    (newConditions: string[]) => setMedicalHistory({ ...medicalHistory, systemicConditions: newConditions }),
                    medicalHistory.systemicConditions || []
                  )}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Condition
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Previous Treatments
              </label>
              <div className="space-y-2">
                {medicalHistory.previousTreatments?.map((treatment, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-gray-100 rounded-md">{treatment}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem(
                        (newTreatments: string[]) => setMedicalHistory({ ...medicalHistory, previousTreatments: newTreatments }),
                        medicalHistory.previousTreatments || [],
                        index
                      )}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(
                    (newTreatments: string[]) => setMedicalHistory({ ...medicalHistory, previousTreatments: newTreatments }),
                    medicalHistory.previousTreatments || []
                  )}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Treatment
                </button>
              </div>
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
