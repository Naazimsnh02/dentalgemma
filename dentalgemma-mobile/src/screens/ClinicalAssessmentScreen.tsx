/**
 * Clinical Assessment Screen
 * 
 * Main screen for clinical case assessment feature:
 * - Multi-step form for data collection
 * - AI-powered assessment generation using local on-device model
 * - Comprehensive report display
 */

import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {CaseForm} from '../components/clinical-assessment/CaseForm';
import {AssessmentReport} from '../components/clinical-assessment/AssessmentReport';
import {ClinicalCase, CaseAssessment, UrgencyLevel} from '../types';

interface ClinicalAssessmentScreenProps {
  sendMessage: (
    text: string,
    image: string | undefined,
    history: any[],
    onToken: (token: string) => void,
  ) => Promise<string>;
  isGenerating: boolean;
  onBack: () => void;
}

export const ClinicalAssessmentScreen: React.FC<
  ClinicalAssessmentScreenProps
> = ({sendMessage, isGenerating, onBack}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessment, setAssessment] = useState<CaseAssessment | null>(null);
  const [caseData, setCaseData] = useState<ClinicalCase | null>(null);

  const buildCasePrompt = (caseData: ClinicalCase): string => {
    return `Please evaluate this dental clinical case:

PATIENT: ${caseData.patient.age} year old ${caseData.patient.gender}${caseData.patient.occupation ? `, ${caseData.patient.occupation}` : ''}
AGE: ${caseData.patient.age}
SEX: ${caseData.patient.gender}

CHIEF COMPLAINT: ${caseData.chiefComplaint.description}

HISTORY: ${caseData.history}

CLINICAL FINDINGS: ${caseData.clinicalFindings.description}

RADIOGRAPHIC FINDINGS: ${caseData.radiographicFindings.description}

MEDICAL HISTORY: ${caseData.medicalHistory.systemicConditions || 'None significant'}
CURRENT MEDICATIONS: ${caseData.medicalHistory.medications || 'None'}
HABITS: ${caseData.medicalHistory.habits || 'None reported'}

What is your diagnosis and treatment plan?`;
  };

  const parseAssessmentResponse = (response: string): CaseAssessment => {
    const cleaned = response.trim();

    // Extract diagnosis
    const diagnosisMatch = cleaned.match(/\*\*Diagnosis:\*\*\s*([^\n]+)/i);
    const primaryDiagnosis = diagnosisMatch
      ? diagnosisMatch[1].trim()
      : 'Diagnosis pending';

    // Extract differential diagnoses
    const differential: string[] = [];
    const diffSection = cleaned.match(
      /\*\*Differential Diagnos(?:is|es):\*\*\s*([\s\S]*?)(?=\n\*\*|\n##|$)/i,
    );
    if (diffSection) {
      const lines = diffSection[1].split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
          const cleaned = trimmed
            .replace(/^[-*•]\s+/, '')
            .replace(/^\d+\.\s+/, '')
            .trim();
          if (cleaned.length > 3) {
            differential.push(cleaned);
          }
        }
      }
    }

    // Extract etiology
    const etiologyMatch = cleaned.match(/\*\*Etiology:\*\*\s*([^\n]+)/i);
    const rootCause = etiologyMatch
      ? etiologyMatch[1].trim()
      : 'To be determined';

    // Extract urgency
    let urgency: UrgencyLevel = 'routine';
    const urgencyMatch = cleaned.match(/\*\*Urgency:\*\*\s*([^\n]+)/i);
    if (urgencyMatch) {
      const urgencyText = urgencyMatch[1].toLowerCase();
      if (urgencyText.includes('urgent (2)') || urgencyText.includes('emergency')) {
        urgency = 'emergency';
      } else if (urgencyText.includes('moderate (1)') || urgencyText.includes('urgent')) {
        urgency = 'urgent';
      } else if (urgencyText.includes('elective (0)') || urgencyText.includes('routine')) {
        urgency = 'routine';
      } else if (urgencyText.includes('home-care') || urgencyText.includes('home care')) {
        urgency = 'home-care';
      }
    }

    // Extract management plan
    const protocol: string[] = [];
    const managementSection = cleaned.match(
      /##\s*Management\s+Plan\s*\n([\s\S]*?)(?=\n##|\n\*\*|$)/i,
    );
    if (managementSection) {
      const lines = managementSection[1].split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^\d+\.\s+/) || trimmed.match(/^[-*•]\s+/)) {
          const cleaned = trimmed
            .replace(/^\d+\.\s+/, '')
            .replace(/^[-*•]\s+/, '')
            .trim();
          if (cleaned.length > 5) {
            protocol.push(cleaned);
          }
        }
      }
    }

    // Fallback: extract any numbered/bulleted list if no management section found
    if (protocol.length === 0) {
      const lines = cleaned.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^\d+\.\s+/) || trimmed.match(/^[-*•]\s+/)) {
          const cleaned = trimmed
            .replace(/^\d+\.\s+/, '')
            .replace(/^[-*•]\s+/, '')
            .trim();
          if (cleaned.length > 10) {
            protocol.push(cleaned);
            if (protocol.length >= 5) break;
          }
        }
      }
    }

    // Extract antibiotics
    const antibioticsIndicatedMatch = cleaned.match(
      /\*\*Antibiotics\s+Indicated:\*\*\s*(Yes|No|Conditional)/i,
    );
    const antibioticsReasonMatch = cleaned.match(/\*\*Reason:\*\*\s*([^\n]+)/i);

    let antibiotics: {indicated: boolean; reason: string} | undefined;
    if (antibioticsIndicatedMatch) {
      const indicated = antibioticsIndicatedMatch[1].toLowerCase();
      antibiotics = {
        indicated: indicated === 'yes',
        reason: antibioticsReasonMatch
          ? antibioticsReasonMatch[1].trim()
          : indicated === 'conditional'
          ? 'Only if systemic signs present'
          : 'Not indicated',
      };
    }

    // Extract follow-up
    const nextApptMatch = cleaned.match(
      /\*\*Next\s+Appointment:\*\*\s*([^\n]+)/i,
    );
    const monitoringMatch = cleaned.match(/\*\*Monitoring:\*\*\s*([^\n]+)/i);

    const followUp = {
      timing: nextApptMatch ? nextApptMatch[1].trim() : '1-2 weeks',
      monitoring: monitoringMatch ? [monitoringMatch[1].trim()] : [],
    };

    // Extract patient counseling
    const counselingSection = cleaned.match(
      /##\s*Patient\s+Counseling\s*\n([\s\S]*?)(?=\n##|$)/i,
    );
    let counselingPoints: string[] = [];
    if (counselingSection) {
      const lines = counselingSection[1].split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^\d+\.\s+/) || trimmed.match(/^[-*•]\s+/)) {
          const cleaned = trimmed
            .replace(/^\d+\.\s+/, '')
            .replace(/^[-*•]\s+/, '')
            .trim();
          if (cleaned.length > 5) {
            counselingPoints.push(cleaned);
          }
        }
      }
    }

    const patientExplanation =
      counselingPoints.length > 0
        ? counselingPoints.join(' ')
        : 'Please consult your dentist for a detailed explanation of your condition and treatment options.';

    return {
      success: true,
      diagnosis: {
        primary: primaryDiagnosis,
        differential: differential.length > 0 ? differential : [],
      },
      etiology: {
        rootCause,
      },
      urgency,
      managementPlan: {
        protocol:
          protocol.length > 0
            ? protocol
            : ['Refer to clinical assessment for treatment details'],
      },
      antibiotics,
      followUp,
      patientCounseling: {
        explanation: patientExplanation,
      },
      processingTime: 0,
    };
  };

  const handleSubmit = useCallback(
    async (submittedCase: ClinicalCase) => {
      setIsSubmitting(true);
      setCaseData(submittedCase);

      try {
        const prompt = buildCasePrompt(submittedCase);

        console.log('=== CLINICAL ASSESSMENT PROMPT ===');
        console.log(prompt);
        console.log('=== END PROMPT ===');

        const response = await sendMessage(prompt, undefined, [], () => {});

        console.log('=== CLINICAL ASSESSMENT RESPONSE ===');
        console.log(response);
        console.log('=== END RESPONSE ===');

        const result = parseAssessmentResponse(response);

        console.log('=== PARSED ASSESSMENT ===');
        console.log(JSON.stringify(result, null, 2));
        console.log('=== END PARSED ASSESSMENT ===');

        if (!result.success) {
          throw new Error('Assessment failed');
        }

        setAssessment(result);
      } catch (error: any) {
        console.error('Assessment error:', error);
        Alert.alert(
          'Assessment Error',
          error.message || 'An unexpected error occurred during assessment',
          [{text: 'OK'}],
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [sendMessage],
  );

  const handleNewAssessment = () => {
    setAssessment(null);
    setCaseData(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Clinical Case Assessment</Text>
          <Text style={styles.subtitle}>
            Comprehensive AI-powered clinical assessment
          </Text>
        </View>
      </View>

      {/* Loading State */}
      {isSubmitting && (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.card}>
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.analyzingTitle}>
                Analyzing Clinical Case...
              </Text>
              <Text style={styles.analyzingSubtitle}>
                This may take a few moments...
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Main Content */}
      {!isSubmitting && (
        <>
          {!assessment ? (
            // Show form if no assessment yet
            <CaseForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          ) : (
            // Show assessment report
            <View style={styles.content}>
              <View style={styles.actionBar}>
                <TouchableOpacity
                  style={styles.newAssessmentButton}
                  onPress={handleNewAssessment}>
                  <Text style={styles.newAssessmentButtonText}>
                    New Assessment
                  </Text>
                </TouchableOpacity>
              </View>

              <AssessmentReport assessment={assessment} />
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
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
  analyzingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  analyzingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  analyzingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  actionBar: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  newAssessmentButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  newAssessmentButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
