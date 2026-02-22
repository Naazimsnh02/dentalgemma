import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import type {SymptomData} from '../../types';

interface QuestionnaireProps {
  onComplete: (data: SymptomData) => void;
  onCancel?: () => void;
}

const PAIN_TYPES = [
  'Sharp',
  'Dull',
  'Throbbing',
  'Constant',
  'Intermittent',
  'Pressure',
];
const DURATION_OPTIONS = [
  'Less than 24 hours',
  '1-3 days',
  '3-7 days',
  '1-2 weeks',
  'More than 2 weeks',
];
const COMMON_TRIGGERS = [
  'Hot foods/drinks',
  'Cold foods/drinks',
  'Sweet foods',
  'Chewing',
  'Pressure',
  'Lying down',
];
const ASSOCIATED_SYMPTOMS = [
  'Swelling',
  'Bleeding gums',
  'Bad breath',
  'Fever',
  'Difficulty swallowing',
  'Jaw pain',
  'Headache',
  'Sensitivity to light/sound',
];

export const Questionnaire: React.FC<QuestionnaireProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [formData, setFormData] = useState<Partial<SymptomData>>({
    location: '',
    painType: '',
    duration: '',
    triggers: [],
    associatedSymptoms: [],
    medicalHistory: [],
  });

  const totalSteps = 6;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onComplete(formData as SymptomData);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const updateFormData = (field: keyof SymptomData, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const toggleArrayItem = (
    field: 'triggers' | 'associatedSymptoms' | 'medicalHistory',
    item: string,
  ) => {
    const currentArray = formData[field] || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateFormData(field, newArray);
  };

  const isStepValid = () => {
    switch (step) {
      case 0:
        return formData.location && formData.location.trim().length > 0;
      case 1:
        return formData.painType && formData.painType.length > 0;
      case 2:
        return formData.duration && formData.duration.length > 0;
      case 3:
      case 4:
      case 5:
        return true;
      default:
        return false;
    }
  };

  if (showDisclaimer) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Medical Disclaimer</Text>
        <Text style={styles.cardDescription}>
          Please read carefully before proceeding
        </Text>

        <View style={styles.disclaimerContent}>
          <Text style={styles.disclaimerWarning}>
            ⚠️ This symptom checker is for educational and informational
            purposes only.
          </Text>
          <Text style={styles.disclaimerText}>
            This tool is NOT a substitute for professional medical advice,
            diagnosis, or treatment. Always seek the advice of your dentist or
            other qualified healthcare provider with any questions you may have
            regarding a dental condition.
          </Text>
          <Text style={styles.disclaimerText}>
            <Text style={styles.disclaimerBold}>Important:</Text> If you are
            experiencing severe pain, uncontrolled bleeding, difficulty
            breathing or swallowing, or any other emergency symptoms, call
            emergency services immediately or go to the nearest emergency room.
          </Text>
          <Text style={styles.disclaimerText}>
            The results provided by this tool are based on the information you
            provide and should not be considered a definitive diagnosis. Only a
            qualified dental professional can provide an accurate diagnosis
            after a proper examination.
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => setShowDisclaimer(false)}>
            <Text style={styles.primaryButtonText}>I Understand, Continue</Text>
          </TouchableOpacity>
          {onCancel && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onCancel}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const getStepTitle = () => {
    const titles = [
      'Location of Symptoms',
      'Pain Type',
      'Duration',
      'Triggers',
      'Associated Symptoms',
      'Medical History',
    ];
    return titles[step];
  };

  const getStepDescription = () => {
    const descriptions = [
      'Which tooth or area is affected?',
      'How would you describe the pain?',
      'How long have you had these symptoms?',
      'What makes the pain worse? (Select all that apply)',
      'Are you experiencing any of these? (Select all that apply)',
      'Do you have any relevant medical conditions? (Optional)',
    ];
    return descriptions[step];
  };

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Step {step + 1} of {totalSteps}
          </Text>
          <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, {width: `${progress}%`}]} />
        </View>
      </View>

      {/* Step Content */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{getStepTitle()}</Text>
        <Text style={styles.cardDescription}>{getStepDescription()}</Text>

        <ScrollView style={styles.stepContent}>
          {/* Step 0: Location */}
          {step === 0 && (
            <View>
              <TextInput
                style={styles.textArea}
                placeholder="e.g., Upper right molar, lower left side, front tooth, entire jaw..."
                value={formData.location || ''}
                onChangeText={text => updateFormData('location', text)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.hint}>
                Be as specific as possible about the location of your symptoms
              </Text>
            </View>
          )}

          {/* Step 1: Pain Type */}
          {step === 1 && (
            <View>
              {PAIN_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={styles.radioOption}
                  onPress={() => updateFormData('painType', type)}>
                  <View style={styles.radio}>
                    {formData.painType === type && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 2: Duration */}
          {step === 2 && (
            <View>
              {DURATION_OPTIONS.map(duration => (
                <TouchableOpacity
                  key={duration}
                  style={styles.radioOption}
                  onPress={() => updateFormData('duration', duration)}>
                  <View style={styles.radio}>
                    {formData.duration === duration && (
                      <View style={styles.radioSelected} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>{duration}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 3: Triggers */}
          {step === 3 && (
            <View>
              {COMMON_TRIGGERS.map(trigger => (
                <TouchableOpacity
                  key={trigger}
                  style={styles.checkboxOption}
                  onPress={() => toggleArrayItem('triggers', trigger)}>
                  <View style={styles.checkbox}>
                    {formData.triggers?.includes(trigger) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{trigger}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 4: Associated Symptoms */}
          {step === 4 && (
            <View>
              {ASSOCIATED_SYMPTOMS.map(symptom => (
                <TouchableOpacity
                  key={symptom}
                  style={styles.checkboxOption}
                  onPress={() => toggleArrayItem('associatedSymptoms', symptom)}>
                  <View style={styles.checkbox}>
                    {formData.associatedSymptoms?.includes(symptom) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{symptom}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Step 5: Medical History */}
          {step === 5 && (
            <View>
              <TextInput
                style={styles.textArea}
                placeholder="e.g., Diabetes, high blood pressure, taking blood thinners, allergic to penicillin..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                onChangeText={text => {
                  const items = text
                    .split(',')
                    .map(item => item.trim())
                    .filter(item => item.length > 0);
                  updateFormData('medicalHistory', items);
                }}
              />
              <Text style={styles.hint}>
                Separate multiple items with commas. This information helps
                provide more accurate recommendations.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Navigation */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            step === 0 && styles.buttonDisabled,
          ]}
          onPress={handleBack}
          disabled={step === 0}>
          <Text
            style={[
              styles.secondaryButtonText,
              step === 0 && styles.buttonTextDisabled,
            ]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            !isStepValid() && styles.buttonDisabled,
          ]}
          onPress={handleNext}
          disabled={!isStepValid()}>
          <Text
            style={[
              styles.primaryButtonText,
              !isStepValid() && styles.buttonTextDisabled,
            ]}>
            {step === totalSteps - 1 ? 'Get Results' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  disclaimerContent: {
    gap: 12,
    marginBottom: 20,
  },
  disclaimerWarning: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  disclaimerText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
  disclaimerBold: {
    fontWeight: '600',
  },
  progressContainer: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 13,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  stepContent: {
    maxHeight: 400,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2563eb',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  radioLabel: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2563eb',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  buttonRow: {
    gap: 12,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
});
