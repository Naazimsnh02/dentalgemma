'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { SymptomData } from '@/types';

interface QuestionnaireProps {
  onComplete: (data: SymptomData) => void;
  onCancel?: () => void;
}

const PAIN_TYPES = ['Sharp', 'Dull', 'Throbbing', 'Constant', 'Intermittent', 'Pressure'];
const DURATION_OPTIONS = ['Less than 24 hours', '1-3 days', '3-7 days', '1-2 weeks', 'More than 2 weeks'];
const COMMON_TRIGGERS = ['Hot foods/drinks', 'Cold foods/drinks', 'Sweet foods', 'Chewing', 'Pressure', 'Lying down'];
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

export function Questionnaire({ onComplete, onCancel }: QuestionnaireProps) {
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'triggers' | 'associatedSymptoms' | 'medicalHistory', item: string) => {
    const currentArray = formData[field] || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
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
        return true; // Triggers are optional
      case 4:
        return true; // Associated symptoms are optional
      case 5:
        return true; // Medical history is optional
      default:
        return false;
    }
  };

  if (showDisclaimer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Medical Disclaimer</CardTitle>
          <CardDescription>
            Please read carefully before proceeding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm space-y-3">
            <p className="font-medium">
              ⚠️ This symptom checker is for educational and informational purposes only.
            </p>
            <p>
              This tool is NOT a substitute for professional medical advice, diagnosis, or treatment. 
              Always seek the advice of your dentist or other qualified healthcare provider with any 
              questions you may have regarding a dental condition.
            </p>
            <p>
              <strong>Important:</strong> If you are experiencing severe pain, uncontrolled bleeding, 
              difficulty breathing or swallowing, or any other emergency symptoms, call emergency 
              services immediately or go to the nearest emergency room.
            </p>
            <p>
              The results provided by this tool are based on the information you provide and should 
              not be considered a definitive diagnosis. Only a qualified dental professional can 
              provide an accurate diagnosis after a proper examination.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowDisclaimer(false)}
              className="flex-1"
            >
              I Understand, Continue
            </Button>
            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {step + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {step === 0 && 'Location of Symptoms'}
            {step === 1 && 'Pain Type'}
            {step === 2 && 'Duration'}
            {step === 3 && 'Triggers'}
            {step === 4 && 'Associated Symptoms'}
            {step === 5 && 'Medical History'}
          </CardTitle>
          <CardDescription>
            {step === 0 && 'Which tooth or area is affected?'}
            {step === 1 && 'How would you describe the pain?'}
            {step === 2 && 'How long have you had these symptoms?'}
            {step === 3 && 'What makes the pain worse? (Select all that apply)'}
            {step === 4 && 'Are you experiencing any of these? (Select all that apply)'}
            {step === 5 && 'Do you have any relevant medical conditions? (Optional)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 0: Location */}
          {step === 0 && (
            <div className="space-y-2">
              <Label htmlFor="location">Location Description</Label>
              <Textarea
                id="location"
                placeholder="e.g., Upper right molar, lower left side, front tooth, entire jaw..."
                value={formData.location || ''}
                onChange={(e) => updateFormData('location', e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Be as specific as possible about the location of your symptoms
              </p>
            </div>
          )}

          {/* Step 1: Pain Type */}
          {step === 1 && (
            <RadioGroup
              value={formData.painType || ''}
              onValueChange={(value) => updateFormData('painType', value)}
            >
              <div className="space-y-3">
                {PAIN_TYPES.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <RadioGroupItem value={type} id={`pain-${type}`} />
                    <Label
                      htmlFor={`pain-${type}`}
                      className="font-normal cursor-pointer flex-1"
                    >
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {/* Step 2: Duration */}
          {step === 2 && (
            <RadioGroup
              value={formData.duration || ''}
              onValueChange={(value) => updateFormData('duration', value)}
            >
              <div className="space-y-3">
                {DURATION_OPTIONS.map((duration) => (
                  <div key={duration} className="flex items-center space-x-2">
                    <RadioGroupItem value={duration} id={`duration-${duration}`} />
                    <Label
                      htmlFor={`duration-${duration}`}
                      className="font-normal cursor-pointer flex-1"
                    >
                      {duration}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {/* Step 3: Triggers */}
          {step === 3 && (
            <div className="space-y-3">
              {COMMON_TRIGGERS.map((trigger) => (
                <div key={trigger} className="flex items-center space-x-2">
                  <Checkbox
                    id={`trigger-${trigger}`}
                    checked={formData.triggers?.includes(trigger)}
                    onCheckedChange={() => toggleArrayItem('triggers', trigger)}
                  />
                  <Label
                    htmlFor={`trigger-${trigger}`}
                    className="font-normal cursor-pointer flex-1"
                  >
                    {trigger}
                  </Label>
                </div>
              ))}
              <div className="pt-2">
                <Label htmlFor="other-triggers">Other triggers (optional)</Label>
                <Input
                  id="other-triggers"
                  placeholder="Describe any other triggers..."
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      toggleArrayItem('triggers', e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 4: Associated Symptoms */}
          {step === 4 && (
            <div className="space-y-3">
              {ASSOCIATED_SYMPTOMS.map((symptom) => (
                <div key={symptom} className="flex items-center space-x-2">
                  <Checkbox
                    id={`symptom-${symptom}`}
                    checked={formData.associatedSymptoms?.includes(symptom)}
                    onCheckedChange={() => toggleArrayItem('associatedSymptoms', symptom)}
                  />
                  <Label
                    htmlFor={`symptom-${symptom}`}
                    className="font-normal cursor-pointer flex-1"
                  >
                    {symptom}
                  </Label>
                </div>
              ))}
              <div className="pt-2">
                <Label htmlFor="other-symptoms">Other symptoms (optional)</Label>
                <Input
                  id="other-symptoms"
                  placeholder="Describe any other symptoms..."
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      toggleArrayItem('associatedSymptoms', e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 5: Medical History */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medical-history">
                  Medical Conditions, Medications, or Allergies
                </Label>
                <Textarea
                  id="medical-history"
                  placeholder="e.g., Diabetes, high blood pressure, taking blood thinners, allergic to penicillin..."
                  rows={6}
                  className="resize-none"
                  onChange={(e) => {
                    const items = e.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter((item) => item.length > 0);
                    updateFormData('medicalHistory', items);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple items with commas. This information helps provide more accurate recommendations.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleBack}
          variant="outline"
          disabled={step === 0}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isStepValid()}
          className="flex-1"
        >
          {step === totalSteps - 1 ? 'Get Results' : 'Next'}
          {step < totalSteps - 1 && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
