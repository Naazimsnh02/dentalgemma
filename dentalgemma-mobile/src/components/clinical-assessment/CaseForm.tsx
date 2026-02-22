/**
 * Clinical Case Form Component
 * 
 * 5-step form matching web implementation:
 * Step 1: Patient Information (Age, Gender, Occupation)
 * Step 2: Chief Complaint & History
 * Step 3: Clinical Findings
 * Step 4: Radiographic Findings
 * Step 5: Medical History
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ClinicalCase,
  PatientInfo,
  ChiefComplaint,
  ClinicalFindings,
  RadiographicFindings,
  MedicalHistory,
} from '../../types';

interface CaseFormProps {
  onSubmit: (caseData: ClinicalCase) => void;
  isSubmitting?: boolean;
}

export const CaseForm: React.FC<CaseFormProps> = ({
  onSubmit,
  isSubmitting = false,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Form state for each step
  const [patientInfo, setPatientInfo] = useState<Partial<PatientInfo>>({
    age: undefined,
    gender: undefined,
    occupation: '',
  });

  const [chiefComplaint, setChiefComplaint] = useState<
    Partial<ChiefComplaint>
  >({
    description: '',
  });

  const [history, setHistory] = useState<string>('');

  const [clinicalFindings, setClinicalFindings] = useState<
    Partial<ClinicalFindings>
  >({
    description: '',
  });

  const [radiographicFindings, setRadiographicFindings] = useState<
    Partial<RadiographicFindings>
  >({
    description: '',
  });

  const [medicalHistory, setMedicalHistory] = useState<
    Partial<MedicalHistory>
  >({
    systemicConditions: '',
    medications: '',
    habits: '',
  });

  // Keyboard listeners
  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!patientInfo.age || patientInfo.age < 0 || patientInfo.age > 150) {
          newErrors.age = 'Age must be between 0 and 150';
        }
        if (!patientInfo.gender) {
          newErrors.gender = 'Gender is required';
        }
        break;
      case 2:
        if (!chiefComplaint.description?.trim()) {
          newErrors.chiefComplaint = 'Chief complaint is required';
        }
        if (!history.trim()) {
          newErrors.history = 'Patient history is required';
        }
        break;
      case 3:
        if (!clinicalFindings.description?.trim()) {
          newErrors.clinicalFindings = 'Clinical findings are required';
        }
        break;
      case 4:
        if (!radiographicFindings.description?.trim()) {
          newErrors.radiographicFindings =
            'Radiographic findings are required';
        }
        break;
      case 5:
        // Medical history fields are optional
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    // Validate all steps
    const allValid = [1, 2, 3, 4, 5].every(step => validateStep(step));

    if (allValid) {
      const completeCase: ClinicalCase = {
        id: Date.now().toString(),
        patient: patientInfo as PatientInfo,
        chiefComplaint: chiefComplaint as ChiefComplaint,
        history,
        clinicalFindings: clinicalFindings as ClinicalFindings,
        radiographicFindings: radiographicFindings as RadiographicFindings,
        medicalHistory: medicalHistory as MedicalHistory,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      onSubmit(completeCase);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Progress Bar - Hidden when keyboard is visible */}
          {!isKeyboardVisible && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                {[1, 2, 3, 4, 5].map(step => (
                  <React.Fragment key={step}>
                    <View
                      style={[
                        styles.progressDot,
                        step === currentStep && styles.progressDotActive,
                        step < currentStep && styles.progressDotComplete,
                      ]}>
                      <Text
                        style={[
                          styles.progressDotText,
                          (step === currentStep || step < currentStep) &&
                            styles.progressDotTextActive,
                        ]}>
                        {step}
                      </Text>
                    </View>
                    {step < 5 && (
                      <View
                        style={[
                          styles.progressLine,
                          step < currentStep && styles.progressLineComplete,
                        ]}
                      />
                    )}
                  </React.Fragment>
                ))}
              </View>
              <Text style={styles.progressText}>Step {currentStep} of 5</Text>
            </View>
          )}

          <ScrollView style={styles.formContainer}>
        {/* Step 1: Patient Information */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Patient Information</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Age <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={patientInfo.age?.toString() || ''}
                onChangeText={text =>
                  setPatientInfo({...patientInfo, age: parseInt(text) || 0})
                }
                keyboardType="numeric"
                placeholder="Enter age"
              />
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Gender <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.genderContainer}>
                {['male', 'female', 'other'].map(gender => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderButton,
                      patientInfo.gender === gender &&
                        styles.genderButtonActive,
                    ]}
                    onPress={() =>
                      setPatientInfo({...patientInfo, gender: gender as any})
                    }>
                    <Text
                      style={[
                        styles.genderButtonText,
                        patientInfo.gender === gender &&
                          styles.genderButtonTextActive,
                      ]}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender && (
                <Text style={styles.errorText}>{errors.gender}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Occupation</Text>
              <TextInput
                style={styles.input}
                value={patientInfo.occupation || ''}
                onChangeText={text =>
                  setPatientInfo({...patientInfo, occupation: text})
                }
                placeholder="e.g., Teacher, Engineer, Retired"
              />
              <Text style={styles.helperText}>
                Optional but helps provide context
              </Text>
            </View>
          </View>
        )}

        {/* Step 2: Chief Complaint & History */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Chief Complaint & History</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Chief Complaint <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={chiefComplaint.description || ''}
                onChangeText={text =>
                  setChiefComplaint({...chiefComplaint, description: text})
                }
                multiline
                numberOfLines={3}
                placeholder="e.g., Patient presenting with severe tooth pain"
              />
              {errors.chiefComplaint && (
                <Text style={styles.errorText}>{errors.chiefComplaint}</Text>
              )}
              <Text style={styles.helperText}>
                Brief description of the main complaint
              </Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                History <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={history}
                onChangeText={setHistory}
                multiline
                numberOfLines={4}
                placeholder="e.g., Patient reports pain for 3 days, worsening with cold drinks"
              />
              {errors.history && (
                <Text style={styles.errorText}>{errors.history}</Text>
              )}
              <Text style={styles.helperText}>
                Include duration, progression, triggers, and relevant background
              </Text>
            </View>
          </View>
        )}

        {/* Step 3: Clinical Findings */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Clinical Findings</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Clinical Examination Findings{' '}
                <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={clinicalFindings.description || ''}
                onChangeText={text =>
                  setClinicalFindings({...clinicalFindings, description: text})
                }
                multiline
                numberOfLines={6}
                placeholder="e.g., Tooth #16 has a defective amalgam restoration with visible decay"
              />
              {errors.clinicalFindings && (
                <Text style={styles.errorText}>{errors.clinicalFindings}</Text>
              )}
              <Text style={styles.helperText}>
                Include intraoral, extraoral, soft tissue, and periodontal
                findings
              </Text>
            </View>
          </View>
        )}

        {/* Step 4: Radiographic Findings */}
        {currentStep === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Radiographic Findings</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Radiographic Description <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={radiographicFindings.description || ''}
                onChangeText={text =>
                  setRadiographicFindings({
                    ...radiographicFindings,
                    description: text,
                  })
                }
                multiline
                numberOfLines={5}
                placeholder="e.g., Periapical radiograph shows periapical radiolucency around tooth #16"
              />
              {errors.radiographicFindings && (
                <Text style={styles.errorText}>
                  {errors.radiographicFindings}
                </Text>
              )}
              <Text style={styles.helperText}>
                Include bone loss, periapical status, and any other radiographic
                observations
              </Text>
            </View>
          </View>
        )}

        {/* Step 5: Medical History */}
        {currentStep === 5 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Medical History</Text>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Medical History / Systemic Conditions
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={medicalHistory.systemicConditions || ''}
                onChangeText={text =>
                  setMedicalHistory({
                    ...medicalHistory,
                    systemicConditions: text,
                  })
                }
                multiline
                numberOfLines={3}
                placeholder='e.g., Diabetes mellitus type 2, or "None significant"'
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Current Medications</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={medicalHistory.medications || ''}
                onChangeText={text =>
                  setMedicalHistory({...medicalHistory, medications: text})
                }
                multiline
                numberOfLines={3}
                placeholder='e.g., Metformin 500mg, or "None"'
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Habits</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={medicalHistory.habits || ''}
                onChangeText={text =>
                  setMedicalHistory({...medicalHistory, habits: text})
                }
                multiline
                numberOfLines={2}
                placeholder='e.g., Smoking 10 cigarettes/day, or "None reported"'
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handlePrevious}
          disabled={currentStep === 1}>
          <Text
            style={[
              styles.buttonText,
              styles.buttonTextSecondary,
              currentStep === 1 && styles.buttonTextDisabled,
            ]}>
            Previous
          </Text>
        </TouchableOpacity>

        {currentStep < 5 ? (
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleNext}>
            <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
              Next
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonSuccess,
              isSubmitting && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}>
            <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
              {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </TouchableWithoutFeedback>
</KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    backgroundColor: '#2563eb',
  },
  progressDotComplete: {
    backgroundColor: '#16a34a',
  },
  progressDotText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  progressDotTextActive: {
    color: '#ffffff',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#d1d5db',
    marginHorizontal: 8,
  },
  progressLineComplete: {
    backgroundColor: '#16a34a',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
  },
  formContainer: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  genderButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  genderButtonTextActive: {
    color: '#ffffff',
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
  },
  buttonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonSuccess: {
    backgroundColor: '#16a34a',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: '#ffffff',
  },
  buttonTextSecondary: {
    color: '#374151',
  },
  buttonTextDisabled: {
    color: '#9ca3af',
  },
});
