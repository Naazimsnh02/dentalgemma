import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import type {SymptomResult} from '../../types';

interface ResultsDisplayProps {
  result: SymptomResult;
  onStartOver?: () => void;
}

const URGENCY_CONFIG: Record<
  'emergency' | 'urgent' | 'routine' | 'home-care',
  {
    label: string;
    icon: string;
    color: string;
    bgColor: string;
  }
> = {
  emergency: {
    label: 'Emergency',
    icon: '⚠️',
    color: '#991b1b',
    bgColor: '#fef2f2',
  },
  urgent: {
    label: 'Urgent',
    icon: '⏰',
    color: '#9a3412',
    bgColor: '#fff7ed',
  },
  routine: {
    label: 'Routine',
    icon: '✓',
    color: '#1e40af',
    bgColor: '#eff6ff',
  },
  'home-care': {
    label: 'Home Care',
    icon: '🏠',
    color: '#166534',
    bgColor: '#f0fdf4',
  },
};

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  result,
  onStartOver,
}) => {
  const urgencyConfig = URGENCY_CONFIG[result.urgency];

  return (
    <ScrollView style={styles.container}>
      {/* Urgency Banner */}
      <View
        style={[
          styles.urgencyCard,
          {backgroundColor: urgencyConfig.bgColor},
        ]}>
        <View style={styles.urgencyHeader}>
          <Text style={styles.urgencyIcon}>{urgencyConfig.icon}</Text>
          <View style={styles.urgencyContent}>
            <Text style={[styles.urgencyTitle, {color: urgencyConfig.color}]}>
              {urgencyConfig.label} Assessment
            </Text>
            <Text style={styles.urgencyDescription}>
              {result.actionGuidance}
            </Text>
          </View>
        </View>
      </View>

      {/* Primary Assessment */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preliminary Assessment</Text>
        <Text style={styles.cardDescription}>
          Based on your reported symptoms (not a clinical examination)
        </Text>

        <View style={styles.primaryAssessment}>
          <View style={styles.primaryAssessmentIcon}>
            <Text style={styles.primaryAssessmentIconText}>✓</Text>
          </View>
          <View style={styles.primaryAssessmentContent}>
            <Text style={styles.primaryAssessmentTitle}>
              {result.possibleConditions[0]?.condition ||
                'Dental condition requiring evaluation'}
            </Text>
            <Text style={styles.primaryAssessmentNote}>
              A professional dental examination is required for definitive
              diagnosis and treatment planning.
            </Text>
          </View>
        </View>
      </View>

      {/* Home Care Recommendations */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Home Care Recommendations</Text>
        <Text style={styles.cardDescription}>
          Steps you can take to manage your symptoms
        </Text>

        <View style={styles.list}>
          {result.homeCareRecommendations.map((recommendation, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listIcon}>✓</Text>
              <Text style={styles.listText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Red Flags */}
      <View style={styles.card}>
        <View style={styles.redFlagHeader}>
          <Text style={styles.redFlagIcon}>⚠️</Text>
          <Text style={styles.cardTitle}>Warning Signs to Watch For</Text>
        </View>
        <Text style={styles.cardDescription}>
          Seek immediate medical attention if you experience any of these
        </Text>

        <View style={styles.list}>
          {result.redFlags.map((flag, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listIconMuted}>•</Text>
              <Text style={styles.listText}>{flag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimerText}>
          <Text style={styles.disclaimerBold}>Disclaimer:</Text> This assessment
          is for informational purposes only and is not a substitute for
          professional medical advice. Always consult with a qualified dental
          professional for proper diagnosis and treatment.
        </Text>
      </View>

      {/* Action Button */}
      {onStartOver && (
        <TouchableOpacity style={styles.primaryButton} onPress={onStartOver}>
          <Text style={styles.primaryButtonText}>Start New Assessment</Text>
        </TouchableOpacity>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  urgencyCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  urgencyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  urgencyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  urgencyContent: {
    flex: 1,
  },
  urgencyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  urgencyDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 16,
  },
  primaryAssessment: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    marginBottom: 16,
  },
  primaryAssessmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  primaryAssessmentIconText: {
    fontSize: 20,
    color: '#ffffff',
  },
  primaryAssessmentContent: {
    flex: 1,
  },
  primaryAssessmentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  primaryAssessmentNote: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  list: {
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  listIcon: {
    fontSize: 16,
    color: '#16a34a',
    marginRight: 8,
    marginTop: 2,
  },
  listIconMuted: {
    fontSize: 16,
    color: '#6b7280',
    marginRight: 8,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  redFlagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  redFlagIcon: {
    fontSize: 20,
  },
  disclaimerCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#991b1b',
    lineHeight: 20,
  },
  disclaimerBold: {
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});
