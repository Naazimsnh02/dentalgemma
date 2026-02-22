import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import type {AnalysisType, ImageAnalysisResult} from '../types';
import {ImageAnalysisResults} from '../components/image-analysis/ImageAnalysisResults.tsx';

type PageState = 'intro' | 'type-selection' | 'analyzing' | 'results';

interface ImageAnalysisScreenProps {
  sendMessage: (
    text: string,
    image: string | undefined,
    history: any[],
    onToken: (token: string) => void,
  ) => Promise<string>;
  isGenerating: boolean;
  onBack: () => void;
}

export const ImageAnalysisScreen: React.FC<ImageAnalysisScreenProps> = ({
  sendMessage,
  isGenerating,
  onBack,
}) => {
  const [pageState, setPageState] = useState<PageState>('intro');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('photo');
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const buildAnalysisPrompt = (type: AnalysisType): string => {
    if (type === 'photo') {
      return `You are a dental AI assistant analyzing a clinical photograph. Please provide:

1. Detailed findings about what you observe in the image
2. Condition classification (healthy, decay, or other)
3. Severity assessment if applicable (mild, moderate, severe)
4. Confidence level (0-1)
5. Urgency classification (emergency, urgent, routine, or home-care)
6. Specific recommendations for the patient

Format your response clearly with these sections.`;
    } else {
      return `You are a dental AI assistant analyzing a dental X-ray/radiograph. Please provide:

1. Detailed findings about what you observe in the radiograph
2. Pathology classification if present (Healthy, Caries, Impacted, BDC-BDR, Infection, Fractured)
3. Differential diagnosis possibilities
4. Confidence level (0-1)
5. Urgency classification (emergency, urgent, routine, or home-care)
6. Specific recommendations for the patient

Format your response clearly with these sections.`;
    }
  };

  const parseModelResponse = (
    response: string,
    type: AnalysisType,
  ): ImageAnalysisResult => {
    console.log('🔍 PARSING IMAGE ANALYSIS RESPONSE');
    console.log('Response length:', response.length);
    console.log('Analysis type:', type);

    const lines = response.split('\n').filter(line => line.trim());
    console.log('Total lines after filtering:', lines.length);

    const findings: string[] = [];
    let confidence = 0.8;
    let urgency: 'emergency' | 'urgent' | 'routine' | 'home-care' = 'routine';
    const recommendations: string[] = [];
    let condition: 'healthy' | 'decay' | 'other' = 'other';
    let severity: 'mild' | 'moderate' | 'severe' | undefined;
    let pathologyClass:
      | 'Healthy'
      | 'Caries'
      | 'Impacted'
      | 'BDC-BDR'
      | 'Infection'
      | 'Fractured'
      | undefined;
    const differentialDiagnosis: string[] = [];

    let currentSection = '';

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Section detection
      if (lowerLine.includes('finding')) {
        currentSection = 'findings';
        console.log('📋 Section: findings');
        continue;
      } else if (lowerLine.includes('condition') && type === 'photo') {
        currentSection = 'condition';
        console.log('📋 Section: condition');
        continue;
      } else if (lowerLine.includes('pathology') && type === 'xray') {
        currentSection = 'pathology';
        console.log('📋 Section: pathology');
        continue;
      } else if (lowerLine.includes('severity')) {
        currentSection = 'severity';
        console.log('📋 Section: severity');
        continue;
      } else if (lowerLine.includes('confidence')) {
        currentSection = 'confidence';
        console.log('📋 Section: confidence');
        continue;
      } else if (lowerLine.includes('urgency')) {
        currentSection = 'urgency';
        console.log('📋 Section: urgency');
        continue;
      } else if (
        lowerLine.includes('recommendation') ||
        lowerLine.includes('action')
      ) {
        currentSection = 'recommendations';
        console.log('📋 Section: recommendations');
        continue;
      } else if (lowerLine.includes('differential')) {
        currentSection = 'differential';
        console.log('📋 Section: differential');
        continue;
      }

      // Content extraction
      if (currentSection === 'findings') {
        const cleaned = line
          .replace(/^[-•*]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .trim();
        if (cleaned && cleaned.length > 5) {
          console.log('  ✓ Finding:', cleaned);
          findings.push(cleaned);
        }
      } else if (currentSection === 'condition' && type === 'photo') {
        if (lowerLine.includes('healthy') || lowerLine.includes('normal')) {
          condition = 'healthy';
          console.log('  ✓ Condition: healthy');
        } else if (
          lowerLine.includes('decay') ||
          lowerLine.includes('caries') ||
          lowerLine.includes('cavity')
        ) {
          condition = 'decay';
          console.log('  ✓ Condition: decay');
        } else {
          condition = 'other';
          console.log('  ✓ Condition: other');
        }
      } else if (currentSection === 'pathology' && type === 'xray') {
        if (lowerLine.includes('healthy')) {
          pathologyClass = 'Healthy';
        } else if (lowerLine.includes('caries')) {
          pathologyClass = 'Caries';
        } else if (lowerLine.includes('impacted')) {
          pathologyClass = 'Impacted';
        } else if (lowerLine.includes('bdc') || lowerLine.includes('bdr')) {
          pathologyClass = 'BDC-BDR';
        } else if (lowerLine.includes('infection')) {
          pathologyClass = 'Infection';
        } else if (lowerLine.includes('fracture')) {
          pathologyClass = 'Fractured';
        }
        console.log('  ✓ Pathology:', pathologyClass);
      } else if (currentSection === 'severity') {
        if (lowerLine.includes('severe')) {
          severity = 'severe';
        } else if (lowerLine.includes('moderate')) {
          severity = 'moderate';
        } else if (lowerLine.includes('mild')) {
          severity = 'mild';
        }
        console.log('  ✓ Severity:', severity);
      } else if (currentSection === 'confidence') {
        const match = line.match(/(\d+(?:\.\d+)?)/);
        if (match) {
          let value = parseFloat(match[1]);
          if (value > 1) value = value / 100;
          confidence = value;
          console.log('  ✓ Confidence:', confidence);
        }
      } else if (currentSection === 'urgency') {
        if (lowerLine.includes('emergency')) {
          urgency = 'emergency';
        } else if (lowerLine.includes('urgent')) {
          urgency = 'urgent';
        } else if (lowerLine.includes('routine')) {
          urgency = 'routine';
        } else if (lowerLine.includes('home')) {
          urgency = 'home-care';
        }
        console.log('  ⚠️ Urgency:', urgency);
      } else if (currentSection === 'recommendations') {
        const cleaned = line
          .replace(/^[-•*]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .trim();
        if (cleaned && cleaned.length > 5) {
          console.log('  💡 Recommendation:', cleaned);
          recommendations.push(cleaned);
        }
      } else if (currentSection === 'differential' && type === 'xray') {
        const cleaned = line
          .replace(/^[-•*]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .trim();
        if (cleaned && cleaned.length > 5) {
          console.log('  🔬 Differential:', cleaned);
          differentialDiagnosis.push(cleaned);
        }
      }
    }

    console.log('📊 PARSING SUMMARY:');
    console.log('  Findings:', findings.length);
    console.log('  Confidence:', confidence);
    console.log('  Urgency:', urgency);
    console.log('  Recommendations:', recommendations.length);

    // Defaults
    if (findings.length === 0) {
      findings.push('Image analysis completed. Please consult a dentist for detailed evaluation.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Consult with a dental professional for proper diagnosis and treatment.');
    }

    const baseResult = {
      type,
      findings,
      confidence,
      urgency,
      recommendations,
    };

    if (type === 'photo') {
      return {
        ...baseResult,
        condition,
        severity,
      };
    } else {
      return {
        ...baseResult,
        pathologyClass,
        differentialDiagnosis:
          differentialDiagnosis.length > 0 ? differentialDiagnosis : undefined,
      };
    }
  };

  const handleImagePicker = useCallback(
    (source: 'camera' | 'library') => {
      const options = {
        mediaType: 'photo' as const,
        quality: 0.8 as const,
        includeBase64: true,
      };

      const launchFunction =
        source === 'camera' ? launchCamera : launchImageLibrary;

      launchFunction(options, response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.error('ImagePicker Error:', response.errorMessage);
          Alert.alert('Error', 'Failed to select image. Please try again.');
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          if (asset.uri) {
            setSelectedImage(asset.uri);
            setPageState('type-selection');
            setError(null);
          }
        }
      });
    },
    [],
  );

  const handleAnalyze = useCallback(async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setPageState('analyzing');
    setError(null);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const prompt = buildAnalysisPrompt(analysisType);

      console.log('=== IMAGE ANALYSIS PROMPT ===');
      console.log(prompt);
      console.log('=== END PROMPT ===');

      // Read image as base64
      const base64Image = selectedImage.startsWith('data:')
        ? selectedImage.split(',')[1]
        : selectedImage;

      const response = await sendMessage(prompt, base64Image, [], () => {});

      clearInterval(progressInterval);
      setProgress(100);

      console.log('=== IMAGE ANALYSIS RESPONSE ===');
      console.log(response);
      console.log('=== END RESPONSE ===');

      const analysis = parseModelResponse(response, analysisType);

      console.log('=== PARSED ANALYSIS ===');
      console.log(JSON.stringify(analysis, null, 2));
      console.log('=== END PARSED ANALYSIS ===');

      setResult(analysis);
      setPageState('results');
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError('Failed to analyze image. Please try again.');
      setPageState('type-selection');
    }
  }, [selectedImage, analysisType, sendMessage]);

  const handleStartOver = useCallback(() => {
    setSelectedImage(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setPageState('intro');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Image Analysis</Text>
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
            <Text style={styles.cardTitle}>Dental Image Analysis</Text>
            <Text style={styles.cardDescription}>
              Upload dental images (clinical photos or X-rays) for AI-powered
              analysis
            </Text>

            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>How it works:</Text>
              <Text style={styles.infoItem}>
                • Take a photo or select from your gallery
              </Text>
              <Text style={styles.infoItem}>
                • Choose analysis type (photo or X-ray)
              </Text>
              <Text style={styles.infoItem}>
                • Receive detailed findings and recommendations
              </Text>
              <Text style={styles.infoItem}>
                • Get urgency classification and action guidance
              </Text>
              <Text style={styles.infoNote}>
                For best results, ensure good lighting and clear focus.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleImagePicker('camera')}>
              <Text style={styles.primaryButtonText}>📷 Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handleImagePicker('library')}>
              <Text style={styles.secondaryButtonText}>
                🖼️ Choose from Gallery
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {pageState === 'type-selection' && selectedImage && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Selected Image</Text>
            <Image
              source={{uri: selectedImage}}
              style={styles.imagePreview}
              resizeMode="contain"
            />

            <Text style={styles.sectionTitle}>Select Analysis Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  analysisType === 'photo' && styles.typeButtonActive,
                ]}
                onPress={() => setAnalysisType('photo')}>
                <Text
                  style={[
                    styles.typeButtonText,
                    analysisType === 'photo' && styles.typeButtonTextActive,
                  ]}>
                  Clinical Photo
                </Text>
                <Text style={styles.typeButtonDesc}>
                  Analyze teeth and gums
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeButton,
                  analysisType === 'xray' && styles.typeButtonActive,
                ]}
                onPress={() => setAnalysisType('xray')}>
                <Text
                  style={[
                    styles.typeButtonText,
                    analysisType === 'xray' && styles.typeButtonTextActive,
                  ]}>
                  X-Ray
                </Text>
                <Text style={styles.typeButtonDesc}>
                  Analyze radiographs
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAnalyze}>
              <Text style={styles.primaryButtonText}>Analyze Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleStartOver}>
              <Text style={styles.secondaryButtonText}>Choose Different Image</Text>
            </TouchableOpacity>
          </View>
        )}

        {pageState === 'analyzing' && (
          <View style={styles.card}>
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.analyzingTitle}>Analyzing Image...</Text>
              <Text style={styles.analyzingSubtitle}>
                This may take a few moments...
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, {width: `${progress}%`}]}
                />
              </View>
            </View>
          </View>
        )}

        {pageState === 'results' && result && selectedImage && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Analysis Results</Text>
              <Image
                source={{uri: selectedImage}}
                style={styles.resultImage}
                resizeMode="contain"
              />
            </View>
            <ImageAnalysisResults
              result={result}
              onStartOver={handleStartOver}
            />
          </View>
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
    marginBottom: 16,
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
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#f3f4f6',
  },
  resultImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 12,
    backgroundColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  typeButtonTextActive: {
    color: '#2563eb',
  },
  typeButtonDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
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
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
});