import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import type {ImageAnalysisResult} from '../../types';

interface ImageAnalysisResultsProps {
  result: ImageAnalysisResult;
  onStartOver: () => void;
  onExportPDF?: () => void;
  onExportJSON?: () => void;
}

// Helper function to strip markdown formatting
function stripMarkdown(text: string): string {
  return text
    // Remove bold/italic markers
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bullet points and list markers
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`(.+?)`/g, '$1')
    // Remove links but keep text
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const ImageAnalysisResults: React.FC<ImageAnalysisResultsProps> = ({
  result,
  onStartOver,
  onExportPDF,
  onExportJSON,
}) => {
  // Get the raw text and strip markdown
  const rawText = result.rawAnalysis || result.findings.join(' ');
  const plainText = stripMarkdown(rawText);

  return (
    <View>
      {/* Single Clinical Analysis Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Clinical Analysis</Text>
        <Text style={styles.analysisText}>{plainText}</Text>
      </View>

      {/* Export buttons */}
      <View style={styles.exportButtons}>
        {onExportPDF && (
          <TouchableOpacity style={styles.exportButton} onPress={onExportPDF}>
            <Text style={styles.exportButtonText}>📄 Export PDF</Text>
          </TouchableOpacity>
        )}
        {onExportJSON && (
          <TouchableOpacity style={styles.exportButtonSecondary} onPress={onExportJSON}>
            <Text style={styles.exportButtonSecondaryText}>📋 Export JSON</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimerTitle}>⚠️ Important Notice</Text>
        <Text style={styles.disclaimerText}>
          This AI-generated assessment is for educational purposes only and
          should not replace professional dental evaluation. Please consult a
          licensed dentist for accurate diagnosis and treatment.
        </Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity style={styles.primaryButton} onPress={onStartOver}>
        <Text style={styles.primaryButtonText}>Analyze Another Image</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  analysisText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    whiteSpace: 'pre-wrap',
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginBottom: 16,
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  exportButtonSecondary: {
    flex: 1,
    backgroundColor: '#6b7280',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  exportButtonSecondaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimerCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#78350f',
    lineHeight: 18,
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
});

