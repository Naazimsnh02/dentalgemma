import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DentalCondition } from '../../data/dentalConditions';

interface ConditionCardProps {
  condition: DentalCondition;
  onPress: () => void;
}

export const ConditionCard: React.FC<ConditionCardProps> = ({ condition, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.icon}>{condition.icon || '🦷'}</Text>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>{condition.name}</Text>
          <Text style={styles.category}>{condition.category}</Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {condition.description}
      </Text>
      
      {condition.symptoms.length > 0 && (
        <View style={styles.infoRow}>
          <Text style={styles.label}>Symptoms:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {condition.symptoms.slice(0, 2).join(', ')}
            {condition.symptoms.length > 2 && ` +${condition.symptoms.length - 2}`}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginRight: 6,
  },
  value: {
    fontSize: 12,
    color: '#4b5563',
    flex: 1,
  },
});
