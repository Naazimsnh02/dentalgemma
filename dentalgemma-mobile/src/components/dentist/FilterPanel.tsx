import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';

export type FilterValues = {
  radius: number;
  specialty: string;
  rating: number | null;
  openNow: boolean;
};

interface FilterPanelProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
  onSearch: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

const SPECIALTIES = [
  'General',
  'Orthodontist',
  'Endodontist',
  'Periodontist',
  'Oral Surgeon',
  'Pediatric Dentist',
  'Prosthodontist',
  'Cosmetic Dentist',
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onSearch,
  isLoading,
  disabled = false,
}) => {
  const handleRadiusChange = (value: number) => {
    onFilterChange({...filters, radius: Math.round(value)});
  };

  const handleSpecialtyChange = (value: string) => {
    onFilterChange({...filters, specialty: value});
  };

  const handleRatingChange = (value: number) => {
    onFilterChange({...filters, rating: value > 0 ? value : null});
  };

  const handleOpenNowToggle = () => {
    onFilterChange({...filters, openNow: !filters.openNow});
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Radius Filter */}
        <View style={styles.filterCard}>
          <Text style={styles.filterLabel}>Radius</Text>
          <Text style={styles.filterValue}>{filters.radius} mi</Text>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={50}
            step={1}
            value={filters.radius}
            onValueChange={handleRadiusChange}
            minimumTrackTintColor="#2563eb"
            maximumTrackTintColor="#d1d5db"
            thumbTintColor="#2563eb"
            disabled={disabled}
          />
        </View>

        {/* Specialty Filter */}
        <View style={styles.filterCard}>
          <Text style={styles.filterLabel}>Specialty</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={filters.specialty}
              onValueChange={handleSpecialtyChange}
              style={styles.picker}
              enabled={!disabled}>
              {SPECIALTIES.map(specialty => (
                <Picker.Item
                  key={specialty}
                  label={specialty}
                  value={specialty}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Rating Filter */}
        <View style={styles.filterCard}>
          <Text style={styles.filterLabel}>Min Rating</Text>
          <Text style={styles.filterValue}>
            {filters.rating ? `${filters.rating}+ ⭐` : 'Any'}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={5}
            step={0.5}
            value={filters.rating || 0}
            onValueChange={handleRatingChange}
            minimumTrackTintColor="#2563eb"
            maximumTrackTintColor="#d1d5db"
            thumbTintColor="#2563eb"
            disabled={disabled}
          />
        </View>

        {/* Open Now Toggle */}
        <View style={styles.filterCard}>
          <Text style={styles.filterLabel}>Open Now</Text>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              filters.openNow && styles.toggleButtonActive,
            ]}
            onPress={handleOpenNowToggle}
            disabled={disabled}>
            <Text
              style={[
                styles.toggleText,
                filters.openNow && styles.toggleTextActive,
              ]}>
              {filters.openNow ? 'Yes' : 'No'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Search Button */}
      <View style={styles.searchButtonContainer}>
        <TouchableOpacity
          style={[
            styles.searchButton,
            (disabled || isLoading) && styles.searchButtonDisabled,
          ]}
          onPress={onSearch}
          disabled={disabled || isLoading}>
          <Text style={styles.searchButtonText}>
            {isLoading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    minWidth: 150,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  filterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  pickerContainer: {
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    marginTop: 4,
  },
  picker: {
    height: 40,
  },
  toggleButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#2563eb',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  searchButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
