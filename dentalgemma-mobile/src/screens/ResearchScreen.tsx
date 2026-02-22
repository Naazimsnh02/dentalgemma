import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {PaperCard} from '../components/research/PaperCard';
import {FilterPanel} from '../components/research/FilterPanel';
import {searchPubMed, savePaper, unsavePaper, getSavedPapers} from '../utils/researchApi';
import type {ResearchPaper, SearchFilters} from '../types/research';

interface ResearchScreenProps {
  onBack: () => void;
}

export const ResearchScreen: React.FC<ResearchScreenProps> = ({onBack}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: 'all',
    contentType: 'all',
    maxResults: 20,
  });

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowSaved(false);

    try {
      const results = await searchPubMed(searchQuery, filters);
      setPapers(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      Alert.alert('Search Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters]);

  const handleSavePaper = useCallback(async (paper: ResearchPaper) => {
    try {
      await savePaper(paper);
      setPapers(prev =>
        prev.map(p => (p.pmid === paper.pmid ? {...p, saved: true} : p)),
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to save paper');
    }
  }, []);

  const handleUnsavePaper = useCallback(async (pmid: string) => {
    try {
      await unsavePaper(pmid);
      setPapers(prev =>
        prev.map(p => (p.pmid === pmid ? {...p, saved: false} : p)),
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to remove paper');
    }
  }, []);

  const handleShowSaved = useCallback(async () => {
    try {
      const saved = await getSavedPapers();
      setPapers(saved);
      setShowSaved(true);
      setSearchQuery('');
      setError(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to load saved papers');
    }
  }, []);

  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>🔬</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Research Dashboard</Text>
            <Text style={styles.headerSubtitle}>Search PubMed</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleShowSaved}
          style={[styles.savedButton, showSaved && styles.savedButtonActive]}>
          <Text style={styles.savedIcon}>{showSaved ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search dental research..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            editable={!isLoading}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={handleSearch}
          style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
          disabled={isLoading || !searchQuery.trim()}>
          <Text style={styles.searchButtonText}>
            {isLoading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Toggle */}
      <View style={styles.filterToggleContainer}>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterToggle}>
          <Text style={styles.filterIcon}>🔧</Text>
          <Text style={styles.filterToggleText}>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Text>
        </TouchableOpacity>
        {papers.length > 0 && (
          <Text style={styles.resultCount}>
            {papers.length} {papers.length === 1 ? 'result' : 'results'}
          </Text>
        )}
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Results */}
      <ScrollView
        style={styles.resultsContainer}
        contentContainerStyle={styles.resultsContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Searching PubMed...</Text>
            <Text style={styles.loadingSubtext}>This may take a few moments</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Search Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleSearch} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : papers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {showSaved ? '⭐' : '🔍'}
            </Text>
            <Text style={styles.emptyTitle}>
              {showSaved ? 'No Saved Papers' : 'No Results'}
            </Text>
            <Text style={styles.emptyText}>
              {showSaved
                ? 'Papers you save will appear here'
                : searchQuery
                ? `No papers found for "${searchQuery}"`
                : 'Enter a search query to find research papers'}
            </Text>
          </View>
        ) : (
          papers.map(paper => (
            <PaperCard
              key={paper.pmid}
              paper={paper}
              onSave={handleSavePaper}
              onUnsave={handleUnsavePaper}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#1F2937',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerIconText: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  savedButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  savedButtonActive: {
    backgroundColor: '#DBEAFE',
  },
  savedIcon: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 10,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  searchButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterIcon: {
    fontSize: 14,
  },
  filterToggleText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  resultCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsContent: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#4B5563',
    marginTop: 16,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
});
