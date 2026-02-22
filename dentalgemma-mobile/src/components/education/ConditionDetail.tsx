import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DentalCondition } from '../../data/dentalConditions';

interface ConditionDetailProps {
  condition: DentalCondition;
  onBack: () => void;
  relatedConditions: DentalCondition[];
  onSelectRelated: (condition: DentalCondition) => void;
}

export const ConditionDetail: React.FC<ConditionDetailProps> = ({
  condition,
  onBack,
  relatedConditions,
  onSelectRelated,
}) => {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `${condition.name}\n\n${condition.description}\n\nSymptoms: ${condition.symptoms.join(', ')}`,
        title: condition.name,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const renderSection = (title: string, items: string[], icon: string, color: string) => {
    if (items.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <View style={[styles.sectionHeader, { backgroundColor: color + '20' }]}>
          <Text style={styles.sectionIcon}>{icon}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionContent}>
          {items.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={[styles.bullet, { color }]}>•</Text>
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.titleRow}>
            <Text style={styles.headerIcon}>{condition.icon || '🦷'}</Text>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{condition.name}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{condition.category}</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.headerDescription}>{condition.description}</Text>
        </View>

        {/* Sections */}
        {renderSection('Symptoms', condition.symptoms, '⚠️', '#ef4444')}
        {renderSection('Causes', condition.causes, '🔍', '#f59e0b')}
        {renderSection('Treatments', condition.treatments, '💊', '#3b82f6')}
        {renderSection('Prevention', condition.prevention, '🛡️', '#10b981')}

        {/* Related Conditions */}
        {relatedConditions.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { backgroundColor: '#8b5cf620' }]}>
              <Text style={styles.sectionIcon}>🔗</Text>
              <Text style={styles.sectionTitle}>Related Conditions</Text>
            </View>
            <View style={styles.relatedContainer}>
              {relatedConditions.map((related) => (
                <TouchableOpacity
                  key={related.id}
                  style={styles.relatedCard}
                  onPress={() => onSelectRelated(related)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.relatedIcon}>{related.icon || '🦷'}</Text>
                  <View style={styles.relatedTextContainer}>
                    <Text style={styles.relatedTitle} numberOfLines={1}>
                      {related.name}
                    </Text>
                    <Text style={styles.relatedCategory}>{related.category}</Text>
                  </View>
                  <Text style={styles.relatedArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>⚠️ Medical Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            This information is for educational purposes only. Always consult with a qualified 
            dentist or healthcare provider for diagnosis and treatment.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  shareButton: {
    padding: 8,
  },
  shareText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  headerDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionContent: {
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 20,
    marginRight: 12,
    marginTop: -2,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  relatedContainer: {
    padding: 16,
  },
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  relatedIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  relatedTextContainer: {
    flex: 1,
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  relatedCategory: {
    fontSize: 12,
    color: '#6b7280',
  },
  relatedArrow: {
    fontSize: 24,
    color: '#9ca3af',
    marginLeft: 8,
  },
  disclaimer: {
    backgroundColor: '#fef3c7',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
});
