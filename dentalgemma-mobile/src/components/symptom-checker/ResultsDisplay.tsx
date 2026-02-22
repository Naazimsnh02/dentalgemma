import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import Markdown from 'react-native-markdown-display';
import type {SimpleSymptomResult} from '../../types';

interface ResultsDisplayProps {
  result: SimpleSymptomResult;
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
              Review the detailed clinical report below for guidance.
            </Text>
          </View>
        </View>
      </View>

      {/* AI Markdown Report */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Clinical Report</Text>
        <Text style={styles.cardDescription}>
          Based on your reported symptoms (not a clinical examination). A professional dental examination is required for definitive diagnosis and treatment planning.
        </Text>

        <View style={styles.markdownContainer}>
          <Markdown style={markdownStyles}>
            {result.markdownReport}
          </Markdown>
        </View>
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
  markdownContainer: {
    marginTop: 8,
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

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  heading1: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 14,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 6,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 12,
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  strong: {
    fontWeight: '700',
    color: '#111827',
  },
  em: {
    fontStyle: 'italic',
  },
  bullet_list: {
    marginBottom: 12,
  },
  ordered_list: {
    marginBottom: 12,
  },
  list_item: {
    marginBottom: 6,
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  code_inline: {
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  blockquote: {
    backgroundColor: '#f9fafb',
    borderLeftWidth: 4,
    borderLeftColor: '#d1d5db',
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  hr: {
    backgroundColor: '#e5e7eb',
    height: 1,
    marginVertical: 16,
  },
});
