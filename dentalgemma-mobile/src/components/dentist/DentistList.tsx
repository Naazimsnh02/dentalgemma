import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {DentistCard} from './DentistCard';
import type {DentistInfo} from '../../screens/DentistFinderScreen';

interface DentistListProps {
  dentists: DentistInfo[];
  selectedDentist: string | null;
  onDentistSelect: (placeId: string) => void;
}

export const DentistList: React.FC<DentistListProps> = ({
  dentists,
  selectedDentist,
  onDentistSelect,
}) => {
  return (
    <View style={styles.container}>
      {/* Results Count */}
      <View style={styles.header}>
        <Text style={styles.resultsCount}>
          {dentists.length} dentist{dentists.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Dentist List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {dentists.map(dentist => (
          <DentistCard
            key={dentist.placeId}
            dentist={dentist}
            isSelected={selectedDentist === dentist.placeId}
            onPress={() => onDentistSelect(dentist.placeId)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
});
