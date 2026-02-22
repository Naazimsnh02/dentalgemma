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
import type {SymptomData, SymptomResult} from '../types';

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
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buildSymptomPrompt = (data: SymptomData): string => {
    return `You are a dental AI assistant. A patient has reported the following symptoms:

Location: ${data.location}
Pain Type: ${data.painType}
Duration: ${data.duration}
Triggers: ${data.triggers.join(', ') || 'None reported'}
Associated Symptoms: ${data.associatedSymptoms.join(', ') || 'None reported'}
Medical History: ${data.medicalHistory.join(', ') || 'None reported'}

Please provide:
1. A ranked list of 3 possible dental conditions (with likelihood percentages)
2. Urgency classification (emergency, urgent, routine, or home-care)
3. Specific action guidance based on urgency
4. Home care recommendations
5. Red flag warnings to watch for

Format your response clearly with these sections.`;
  };

  const parseModelResponse = (
    response: string,
    data: SymptomData,
  ): SymptomResult => {
    console.log('🔍 PARSING MODEL RESPONSE');
    console.log('Response length:', response.length);
    
    const lines = response.split('\n').filter(line => line.trim());
    console.log('Total lines after filtering:', lines.length);

    const possibleConditions: Array<{condition: string; likelihood: number}> =
      [];
    let urgency: 'emergency' | 'urgent' | 'routine' | 'home-care' = 'routine';
    let actionGuidance = '';
    const homeCareRecommendations: string[] = [];
    const redFlags: string[] = [];

    let currentSection = '';

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      if (
        lowerLine.includes('possible condition') ||
        lowerLine.includes('differential')
      ) {
        currentSection = 'conditions';
        console.log('📋 Section: conditions');
        continue;
      } else if (lowerLine.includes('urgency')) {
        currentSection = 'urgency';
        console.log('📋 Section: urgency');
        continue;
      } else if (
        lowerLine.includes('action') ||
        lowerLine.includes('guidance')
      ) {
        currentSection = 'action';
        console.log('📋 Section: action');
        continue;
      } else if (
        lowerLine.includes('home care') ||
        lowerLine.includes('recommendation')
      ) {
        currentSection = 'homecare';
        console.log('📋 Section: homecare');
        continue;
      } else if (
        lowerLine.includes('red flag') ||
        lowerLine.includes('warning')
      ) {
        currentSection = 'redflags';
        console.log('📋 Section: redflags');
        continue;
      }

      if (currentSection === 'conditions') {
        const match = line.match(/(.+?)[\s-]*(\d+)%/);
        if (match) {
          const condition = {
            condition: match[1].replace(/^\d+\.\s*/, '').trim(),
            likelihood: parseInt(match[2], 10) / 100,
          };
          console.log('  ✓ Condition:', condition);
          possibleConditions.push(condition);
        } else if (line.match(/^\d+\./)) {
          const condition = {
            condition: line.replace(/^\d+\.\s*/, '').trim(),
            likelihood: 0.5,
          };
          console.log('  ✓ Condition (no %):', condition);
          possibleConditions.push(condition);
        }
      } else if (currentSection === 'urgency') {
        if (lowerLine.includes('emergency')) {
          urgency = 'emergency';
          console.log('  ⚠️ Urgency: emergency');
        } else if (lowerLine.includes('urgent')) {
          urgency = 'urgent';
          console.log('  ⚠️ Urgency: urgent');
        } else if (lowerLine.includes('routine')) {
          urgency = 'routine';
          console.log('  ⚠️ Urgency: routine');
        } else if (lowerLine.includes('home') || lowerLine.includes('self-care')) {
          urgency = 'home-care';
          console.log('  ⚠️ Urgency: home-care');
        }
      } else if (currentSection === 'action') {
        if (line.trim() && !line.match(/^\d+\./)) {
          actionGuidance += line.trim() + ' ';
          console.log('  → Action:', line.trim());
        }
      } else if (currentSection === 'homecare') {
        const cleaned = line
          .replace(/^[-•*]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .trim();
        if (cleaned && cleaned.length > 5) {
          console.log('  💊 Home care:', cleaned);
          homeCareRecommendations.push(cleaned);
        }
      } else if (currentSection === 'redflags') {
        const cleaned = line
          .replace(/^[-•*]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .trim();
        if (cleaned && cleaned.length > 5) {
          console.log('  🚩 Red flag:', cleaned);
          redFlags.push(cleaned);
        }
      }
    }

    console.log('📊 PARSING SUMMARY:');
    console.log('  Conditions found:', possibleConditions.length);
    console.log('  Urgency:', urgency);
    console.log('  Action guidance length:', actionGuidance.length);
    console.log('  Home care items:', homeCareRecommendations.length);
    console.log('  Red flags:', redFlags.length);

    if (possibleConditions.length === 0) {
      console.log('⚠️ No conditions found, using default');
      possibleConditions.push({
        condition: 'Dental condition requiring professional evaluation',
        likelihood: 0.6,
      });
    }

    if (!actionGuidance) {
      console.log('⚠️ No action guidance found, using default');
      actionGuidance = getDefaultActionGuidance(urgency);
    }

    if (homeCareRecommendations.length === 0) {
      console.log('⚠️ No home care found, using defaults');
      homeCareRecommendations.push(
        'Maintain good oral hygiene',
        'Rinse with warm salt water',
        'Take over-the-counter pain medication as needed',
      );
    }

    if (redFlags.length === 0) {
      console.log('⚠️ No red flags found, using defaults');
      redFlags.push(
        'Severe or worsening pain',
        'Swelling that increases',
        'Fever or difficulty swallowing',
      );
    }

    return {
      possibleConditions: possibleConditions.slice(0, 3),
      urgency,
      actionGuidance: actionGuidance.trim(),
      homeCareRecommendations,
      redFlags,
    };
  };

  const getDefaultActionGuidance = (
    urgency: 'emergency' | 'urgent' | 'routine' | 'home-care',
  ): string => {
    switch (urgency) {
      case 'emergency':
        return 'Seek immediate emergency care. Go to the nearest emergency room or call emergency services.';
      case 'urgent':
        return 'Contact your dentist within 24 hours for an urgent appointment.';
      case 'routine':
        return 'Schedule a routine dental appointment within 1-2 weeks for evaluation.';
      case 'home-care':
        return 'Monitor symptoms for 24-48 hours. If symptoms persist or worsen, contact your dentist.';
      default:
        return 'Consult with your dentist for proper evaluation and treatment.';
    }
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
        
        const diagnosis = parseModelResponse(response, data);
        
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
