import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

interface HomeScreenProps {
  onNavigateToChat: () => void;
  onNavigateToSymptomChecker: () => void;
  onNavigateToImageAnalysis: () => void;
  onNavigateToEducation: () => void;
  onNavigateToDentistFinder: () => void;
  onUnloadModel: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToChat,
  onNavigateToSymptomChecker,
  onNavigateToImageAnalysis,
  onNavigateToEducation,
  onNavigateToDentistFinder,
  onUnloadModel,
}) => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>DentalGemma</Text>
        <Text style={styles.subtitle}>AI-Powered Dental Assistant</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}>
        <View style={styles.statusCard}>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Model Loaded & Ready</Text>
          </View>
        </View>

        <View style={styles.featuresGrid}>
          {/* Chat Feature */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={onNavigateToChat}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>💬</Text>
            </View>
            <Text style={styles.featureTitle}>Chat Assistant</Text>
            <Text style={styles.featureDescription}>
              Ask questions and get AI-powered dental advice with image analysis
            </Text>
          </TouchableOpacity>

          {/* Symptom Checker Feature */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={onNavigateToSymptomChecker}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🩺</Text>
            </View>
            <Text style={styles.featureTitle}>Symptom Checker</Text>
            <Text style={styles.featureDescription}>
              Interactive questionnaire to assess your dental symptoms
            </Text>
          </TouchableOpacity>

          {/* Image Analysis Feature */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={onNavigateToImageAnalysis}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>📸</Text>
            </View>
            <Text style={styles.featureTitle}>Image Analysis</Text>
            <Text style={styles.featureDescription}>
              Analyze dental X-rays and photos with AI
            </Text>
          </TouchableOpacity>

          {/* Education Portal */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={onNavigateToEducation}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>📚</Text>
            </View>
            <Text style={styles.featureTitle}>Education Portal</Text>
            <Text style={styles.featureDescription}>
              Browse 98 dental conditions and learn about oral health
            </Text>
          </TouchableOpacity>

          {/* Dentist Finder */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={onNavigateToDentistFinder}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>📍</Text>
            </View>
            <Text style={styles.featureTitle}>Dentist Finder</Text>
            <Text style={styles.featureDescription}>
              Find nearby dental professionals with maps and filters
            </Text>
          </TouchableOpacity>

          {/* Coming Soon - Research */}
          <View style={[styles.featureCard, styles.featureCardDisabled]}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🔬</Text>
            </View>
            <Text style={styles.featureTitle}>Research</Text>
            <Text style={styles.featureDescription}>
              Search dental research papers
            </Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ About On-Device AI</Text>
          <Text style={styles.infoText}>
            DentalGemma runs entirely on your device using the fine-tuned
            dentalgemma-1.5-4b-it model. Your data never leaves your phone,
            ensuring complete privacy.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.unloadButton}
          onPress={onUnloadModel}>
          <Text style={styles.unloadButtonText}>Unload Model</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  statusCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  featuresGrid: {
    gap: 12,
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureCardDisabled: {
    opacity: 0.6,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  comingSoonBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 20,
  },
  unloadButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  unloadButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
