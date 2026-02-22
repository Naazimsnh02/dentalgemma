import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import type {SearchFilters} from '../../types/research';

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  onClose: () => void;
}

const DATE_RANGE_OPTIONS = [
  {label: 'All time', value: 'all'},
  {label: 'Last 6 months', value: 'last-6-months'},
  {label: 'Last year', value: '1-year'},
  {label: 'Last 5 years', value: '5-years'},
] as const;

const CONTENT_TYPE_OPTIONS = [
  {label: 'All types', value: 'all', description: 'All publication types'},
  {
    label: 'Research Papers',
    value: 'research',
    description: 'Original research',
  },
  {label: 'Clinical Trials', value: 'trial', description: 'Clinical studies'},
  {label: 'Reviews', value: 'review', description: 'Systematic reviews'},
  {
    label: 'Case Reports',
    value: 'case-report',
    description: 'Case studies',
  },
  {label: 'Guidelines', value: 'guideline', description: 'Practice guidelines'},
] as const;

const RESULT_COUNT_OPTIONS = [10, 20, 50, 100];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onClose,
}) => {
  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K],
  ) => {
    onFilterChange({...filters, [key]: value});
  };

  const resetFilters = () => {
    onFilterChange({
      dateRange: 'all',
      contentType: 'all',
      maxResults: 20,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Date Range */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📅</Text>
            <Text style={styles.sectionTitle}>Publication Date</Text>
          </View>
          <View style={styles.optionsContainer}>
            {DATE_RANGE_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                onPress={() => updateFilter('dateRange', option.value)}
                style={styles.radioOption}>
                <View
                  style={[
                    styles.radio,
                    filters.dateRange === option.value && styles.radioActive,
                  ]}>
                  {filters.dateRange === option.value && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content Type */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>📄</Text>
            <Text style={styles.sectionTitle}>Content Type</Text>
          </View>
          <View style={styles.optionsContainer}>
            {CONTENT_TYPE_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                onPress={() => updateFilter('contentType', option.value)}
                style={styles.radioOption}>
                <View
                  style={[
                    styles.radio,
                    filters.contentType === option.value && styles.radioActive,
                  ]}>
                  {filters.contentType === option.value && (
                    <View style={styles.radioDot} />
                  )}
                </View>
                <View style={styles.radioContent}>
                  <Text style={styles.radioLabel}>{option.label}</Text>
                  <Text style={styles.radioDescription}>{option.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Number of Results */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🔢</Text>
            <Text style={styles.sectionTitle}>
              Number of Results: {filters.maxResults}
            </Text>
          </View>
          <View style={styles.resultCountContainer}>
            {RESULT_COUNT_OPTIONS.map(count => (
              <TouchableOpacity
                key={count}
                onPress={() => updateFilter('maxResults', count)}
                style={[
                  styles.resultCountButton,
                  filters.maxResults === count &&
                    styles.resultCountButtonActive,
                ]}>
                <Text
                  style={[
                    styles.resultCountText,
                    filters.maxResults === count &&
                      styles.resultCountTextActive,
                  ]}>
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.resultCountHint}>
            More results may take longer to load
          </Text>
        </View>

        {/* Active Filters */}
        {(filters.dateRange !== 'all' ||
          filters.contentType !== 'all' ||
          filters.maxResults !== 20) && (
          <View style={styles.section}>
            <Text style={styles.activeFiltersTitle}>Active Filters</Text>
            <View style={styles.activeFiltersContainer}>
              {filters.dateRange !== 'all' && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterIcon}>📅</Text>
                  <Text style={styles.activeFilterText}>
                    {
                      DATE_RANGE_OPTIONS.find(o => o.value === filters.dateRange)
                        ?.label
                    }
                  </Text>
                </View>
              )}
              {filters.contentType !== 'all' && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterIcon}>📄</Text>
                  <Text style={styles.activeFilterText}>
                    {
                      CONTENT_TYPE_OPTIONS.find(
                        o => o.value === filters.contentType,
                      )?.label
                    }
                  </Text>
                </View>
              )}
              {filters.maxResults !== 20 && (
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterIcon}>🔢</Text>
                  <Text style={styles.activeFilterText}>
                    {filters.maxResults} results
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Reset Button */}
        <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Reset Filters</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Close Button */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Apply Filters</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    maxHeight: 400,
  },
  scrollView: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  optionsContainer: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioActive: {
    borderColor: '#2563EB',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  radioContent: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 14,
    color: '#1F2937',
  },
  radioDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  resultCountContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  resultCountButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  resultCountButtonActive: {
    backgroundColor: '#2563EB',
  },
  resultCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  resultCountTextActive: {
    color: '#FFFFFF',
  },
  resultCountHint: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  activeFiltersTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
  },
  activeFilterIcon: {
    fontSize: 12,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#1E40AF',
  },
  resetButton: {
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  closeButton: {
    paddingVertical: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
