import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import type {ImageAnalysisResult, UrgencyLevel} from '../../types';

interface ImageAnalysisResultsProps {
  result: ImageAnalysisResult;
  onStartOver: () => void;
}

const urgencyConfig: Record<
  UrgencyLevel,
  {color: string; bgColor: string; label: string; icon: string}
> = {
  emergency: {
    color: '#991b1b',
    bgColor: '#fef2f2',
    label: 'Emergency',
    icon: '🚨',
  },
  urgent: {
    color: '#c2410c',
    bgColor: '#fff7ed',
    label: 'Urgent',
    icon: '⚠️',
  },
  routine: {
    color: '#1e40af',
    bgColor: '#eff6ff',
    label: 'Routine',
    icon: 'ℹ️',
  },
  'home-care': {
    color: '#15803d',
    bgColor: '#f0fdf4',
    label: 'Home Care',
    icon: '✅',
  },
};

export const ImageAnalysisResults: React.FC<ImageAnalysisResultsProps> = ({
  result,
  onStartOver,
}) => {
  const urgency = urgencyConfig[result.urgency];

  return (
    <View>
      {/* Urgency Card */}
      <View style={[styles.card, {backgroundColor: urgency.bgColor}]}>
        <View style={styles.urgencyHeader}>
          <Text style={styles.urgencyIcon}>{urgency.icon}</Text>
          <View style={styles.urgencyTextContainer}>
            <Text style={[styles.urgencyLabel, {color: urgency.color}]}>
              {urgency.label} Priority
            </Text>
            <Text style={styles.urgencySubtext}>
              Analysis Type: {result.type === 'photo' ? 'Clinical Photo' : 'X-Ray'}
            </Text>
          </View>
        </View>
      </View>

      {/* Type-Specific Info */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Analysis Details</Text>
        {result.type === 'photo' ? (
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Condition:</Text>
              <View
                style={[
                  styles.badge,
                  result.condition === 'decay'
                    ? styles.badgeDecay
                    : result.condition === 'healthy'
                    ? styles.badgeHealthy
                    : styles.badgeOther,
                ]}>
                <Text
                  style={[
                    styles.badgeText,
                    result.condition === 'decay'
                      ? styles.badgeTextDecay
                      : result.condition === 'healthy'
                      ? styles.badgeTextHealthy
                      : styles.badgeTextOther,
                  ]}>
                  {result.condition === 'decay'
                    ? 'Decay Detected'
                    : result.condition === 'healthy'
                    ? 'Healthy'
                    : 'Other Finding'}
                </Text>
              </View>
            </View>
            {result.severity && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Severity:</Text>
                <Text style={styles.detailValue}>
                  {result.severity.charAt(0).toUpperCase() +
                    result.severity.slice(1)}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Confidence:</Text>
              <Text style={styles.detailValue}>
                {Math.round(result.confidence * 100)}%
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.detailsContainer}>
            {result.pathologyClass && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Primary Pathology:</Text>
                <View style={styles.badgePrimary}>
                  <Text style={styles.badgeTextPrimary}>
                    {result.pathologyClass}
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Confidence:</Text>
              <Text style={styles.detailValue}>
                {Math.round(result.confidence * 100)}%
              </Text>
            </View>
            {result.differentialDiagnosis &&
              result.differentialDiagnosis.length > 0 && (
                <View style={styles.differentialContainer}>
                  <Text style={styles.detailLabel}>
                    Differential Diagnosis:
                  </Text>
                  {result.differentialDiagnosis.map((dx, i) => (
                    <Text key={i} style={styles.differentialItem}>
                      • {dx}
                    </Text>
                  ))}
                </View>
              )}
          </View>
        )}
      </View>

      {/* Findings */}
      {result.findings.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Findings</Text>
          {result.findings.map((finding, index) => (
            <View key={index} style={styles.findingItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.findingText}>{finding}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {result.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.recommendationText}>{rec}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Disclaimer */}
      <View style={styles.disclaimerCard}>
        <Text style={styles.disclaimerTitle}>⚠️ Important Notice</Text>
        <Text style={styles.disclaimerText}>
          This AI-generated assessment is for educational purposes only and
          should not replace professional dental evaluation. Please consult a
          licensed dentist for accurate diagnosis and treatment.
        </Text>
      </View>

      {/* Action Buttons */}
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
  urgencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  urgencyTextContainer: {
    flex: 1,
  },
  urgencyLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  urgencySubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeDecay: {
    backgroundColor: '#fef2f2',
  },
  badgeHealthy: {
    backgroundColor: '#f0fdf4',
  },
  badgeOther: {
    backgroundColor: '#fff7ed',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  badgeTextDecay: {
    color: '#991b1b',
  },
  badgeTextHealthy: {
    color: '#15803d',
  },
  badgeTextOther: {
    color: '#c2410c',
  },
  badgePrimary: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeTextPrimary: {
    color: '#1e40af',
    fontSize: 13,
    fontWeight: '600',
  },
  differentialContainer: {
    marginTop: 8,
  },
  differentialItem: {
    fontSize: 13,
    color: '#374151',
    marginTop: 4,
    marginLeft: 8,
  },
  findingItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: '#2563eb',
    marginRight: 8,
    marginTop: 2,
  },
  findingText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 16,
    color: '#15803d',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
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
