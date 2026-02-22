import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Questionnaire} from '../components/symptom-checker/Questionnaire';
import {ResultsDisplay} from '../components/symptom-checker/ResultsDisplay';
import type {SymptomData, SimpleSymptomResult, UrgencyLevel} from '../types';

type PageState = 'intro' | 'questionnaire' | 'analyzing' | 'results';

interface SymptomCheckerScreenProps {
  sendMessage: (
    text: string,
    image: string | undefined,
    history: any[],
    onToken: (token: string) => void,
  ) => Promise<string>;
  isGenerating: boolean;
  onBack: () => void;
}

export const SymptomCheckerScreen: React.FC<SymptomCheckerScreenProps> = ({
  sendMessage,
  isGenerating,
  onBack,
}) => {
  const [pageState, setPageState] = useState<PageState>('intro');
  const [symptomData, setSymptomData] = useState<SymptomData | null>(null);
  const [result, setResult] = useState<SimpleSymptomResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buildSymptomPrompt = (data: SymptomData): string => {
    return `Please evaluate this dental patient based on reported symptoms:

PATIENT: Symptomatic patient evaluation
AGE: Not specified
SEX: Not specified

CHIEF COMPLAINT: Patient reporting dental symptoms.

HISTORY: Location: ${data.location}. Pain Type: ${data.painType}. Duration: ${data.duration}. Triggers: ${data.triggers.join(', ') || 'None'}. Associated Symptoms: ${data.associatedSymptoms.join(', ') || 'None'}.

CLINICAL FINDINGS: Not clinically evaluated yet.

MEDICAL HISTORY: ${data.medicalHistory.join(', ') || 'None reported'}

What is your diagnosis and treatment plan?`;
  };

  const parseSimplifiedResponse = (response: string): SimpleSymptomResult => {
    const cleaned = response.trim();
    
    // Extract urgency just for the banner color
    let urgency: UrgencyLevel = 'routine';
    const urgencyMatch = cleaned.match(/\*\*Urgency:\*\*\s*(.+?)(?:\n|$)/i);
    
    if (urgencyMatch) {
      const text = urgencyMatch[1].toLowerCase();
      if (text.includes('emergency') || text.includes('(2)')) urgency = 'emergency';
      else if (text.includes('urgent') || text.includes('(1)')) urgency = 'urgent';
      else if (text.includes('home')) urgency = 'home-care';
      else urgency = 'routine';
    }

    return {
      urgency,
      markdownReport: cleaned
    };
  };

  const handleQuestionnaireComplete = useCallback(
    async (data: SymptomData) => {
      setSymptomData(data);
      setPageState('analyzing');
      setError(null);

      try {
        const prompt = buildSymptomPrompt(data);
        
        console.log('=== SYMPTOM CHECKER PROMPT ===');
        console.log(prompt);
        console.log('=== END PROMPT ===');
        
        const response = await sendMessage(prompt, undefined, [], () => {});
        
        console.log('=== SYMPTOM CHECKER RESPONSE ===');
        console.log(response);
        console.log('=== END RESPONSE ===');
        
        const diagnosis = parseSimplifiedResponse(response);
        
        console.log('=== PARSED DIAGNOSIS ===');
        console.log(JSON.stringify(diagnosis, null, 2));
        console.log('=== END PARSED DIAGNOSIS ===');
        
        setResult(diagnosis);
        setPageState('results');
      } catch (err) {
        console.error('Error diagnosing symptoms:', err);
        setError('Failed to analyze symptoms. Please try again.');
        setPageState('questionnaire');
      }
    },
    [sendMessage],
  );

  const handleStartOver = useCallback(() => {
    setSymptomData(null);
    setResult(null);
    setError(null);
    setPageState('intro');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Symptom Checker</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}>
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {pageState === 'intro' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome to the Symptom Checker</Text>
            <Text style={styles.cardDescription}>
              This tool will help you understand your dental symptoms and
              determine the appropriate level of care
            </Text>

            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>How it works:</Text>
              <Text style={styles.infoItem}>
                • Answer 6 simple questions about your symptoms
              </Text>
              <Text style={styles.infoItem}>
                • Receive an assessment of possible conditions
              </Text>
              <Text style={styles.infoItem}>
                • Get urgency classification and action guidance
              </Text>
              <Text style={styles.infoItem}>
                • Learn home care recommendations and warning signs
              </Text>
              <Text style={styles.infoNote}>
                This assessment takes approximately 3-5 minutes to complete.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setPageState('questionnaire')}>
              <Text style={styles.primaryButtonText}>Start Assessment</Text>
            </TouchableOpacity>
          </View>
        )}

        {pageState === 'questionnaire' && (
          <Questionnaire
            onComplete={handleQuestionnaireComplete}
            onCancel={handleStartOver}
          />
        )}

        {pageState === 'analyzing' && (
          <View style={styles.card}>
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.analyzingTitle}>
                Analyzing Your Symptoms
              </Text>
              <Text style={styles.analyzingSubtitle}>
                This may take a few moments...
              </Text>
            </View>
          </View>
        )}

        {pageState === 'results' && result && (
          <ResultsDisplay result={result} onStartOver={handleStartOver} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
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
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  infoNote: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 12,
    fontStyle: 'italic',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
});
