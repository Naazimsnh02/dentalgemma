import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
  TextInput,
  Keyboard,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import {DentistList} from '../components/dentist/DentistList';
import {DentistMap} from '../components/dentist/DentistMap';
import {FilterPanel} from '../components/dentist/FilterPanel';
import {searchNearbyDentists, reverseGeocode, geocodeAddress} from '../utils/dentistApi';

interface DentistFinderScreenProps {
  onBack: () => void;
}

export type Location = {
  lat: number;
  lng: number;
};

export type DentistInfo = {
  placeId: string;
  name: string;
  specialty: string;
  rating: number;
  distance: number;
  phone: string;
  website: string;
  hours: string;
  address: string;
  location: Location;
};

export type FilterValues = {
  radius: number;
  specialty: string;
  rating: number | null;
  openNow: boolean;
};

export const DentistFinderScreen: React.FC<DentistFinderScreenProps> = ({
  onBack,
}) => {
  const [dentists, setDentists] = useState<DentistInfo[]>([]);
  const [selectedDentist, setSelectedDentist] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>('');
  const [locationSearchText, setLocationSearchText] = useState<string>('');
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState<FilterValues>({
    radius: 10,
    specialty: 'General',
    rating: null,
    openNow: false,
  });

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      reverseGeocode(userLocation).then(label => {
        setLocationLabel(label);
      });
    }
  }, [userLocation]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setError(null);

    Geolocation.getCurrentPosition(
      position => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setLocationSearchText('');
        setIsGettingLocation(false);
      },
      err => {
        console.error('Location error:', err);
        let errorMessage = 'Unable to get your location. ';

        if (err.code === 1) {
          errorMessage += 'Please enable location permissions in your device settings.';
        } else if (err.code === 2) {
          errorMessage += 'Location service is unavailable. Please check your GPS settings.';
        } else if (err.code === 3) {
          errorMessage += 'Location request timed out. Please try again.';
        } else {
          errorMessage += 'Please try again.';
        }

        setError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 60000,
      },
    );
  };

  const handleLocationSearch = async () => {
    Keyboard.dismiss();
    const query = locationSearchText.trim();
    if (!query) {
      Alert.alert('Enter Location', 'Please type a city or address to search.');
      return;
    }

    setIsSearchingLocation(true);
    setError(null);

    try {
      const found = await geocodeAddress(query);
      if (found) {
        setUserLocation(found);
        setLocationLabel(query);
      } else {
        Alert.alert(
          'Location Not Found',
          'Could not find that location. Please try a different search.',
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to search for location. Please try again.');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!userLocation) {
      Alert.alert(
        'Location Required',
        'Please enable location services or enter a location to search for dentists.',
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchNearbyDentists({
        location: userLocation,
        radius: filters.radius,
        specialty: filters.specialty !== 'General' ? filters.specialty : undefined,
        rating: filters.rating || undefined,
        openNow: filters.openNow,
      });

      setDentists(results);
      setSelectedDentist(null);

      if (results.length === 0) {
        Alert.alert(
          'No Results',
          'No dentists found matching your criteria. Try adjusting your filters.',
        );
      }
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to search for dentists';
      setError(errorMessage);
      Alert.alert('Search Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDentistSelect = (placeId: string) => {
    setSelectedDentist(placeId === selectedDentist ? null : placeId);
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const renderContent = () => {
    if (!hasSearched) {
      return (
        <ScrollView
          contentContainerStyle={styles.centeredContent}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.emptyStateIcon}>🔍</Text>
          <Text style={styles.emptyStateTitle}>Ready to Search</Text>
          <Text style={styles.emptyStateText}>
            Set your location above, adjust filters, then tap "Search" to find
            nearby dentists
          </Text>
        </ScrollView>
      );
    }

    if (isLoading) {
      return (
        <ScrollView
          contentContainerStyle={styles.centeredContent}
          keyboardShouldPersistTaps="handled">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Searching for dentists...</Text>
        </ScrollView>
      );
    }

    if (error) {
      return (
        <ScrollView
          contentContainerStyle={styles.centeredContent}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Search Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    if (dentists.length === 0) {
      return (
        <ScrollView
          contentContainerStyle={styles.centeredContent}
          keyboardShouldPersistTaps="handled">
          <Text style={styles.emptyStateIcon}>🏥</Text>
          <Text style={styles.emptyStateTitle}>No Dentists Found</Text>
          <Text style={styles.emptyStateText}>
            Try adjusting your search filters or expanding the search radius
          </Text>
        </ScrollView>
      );
    }

    if (viewMode === 'list') {
      return (
        <DentistList
          dentists={dentists}
          selectedDentist={selectedDentist}
          onDentistSelect={handleDentistSelect}
        />
      );
    }

    return (
      <DentistMap
        dentists={dentists}
        userLocation={userLocation}
        selectedDentist={selectedDentist}
        onMarkerPress={handleDentistSelect}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {/* Outer non-scrollable fixed header area */}
          <View style={styles.flex}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Find a Dentist</Text>
              <View style={styles.headerRight} />
            </View>

            {/* Location Bar */}
            <View style={styles.locationBar}>
              {isGettingLocation ? (
                <View style={styles.locationStatus}>
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text style={styles.locationText}>Getting your location...</Text>
                </View>
              ) : userLocation ? (
                <View style={styles.locationStatus}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText} numberOfLines={1}>
                    {locationLabel || 'Location detected'}
                  </Text>
                  <TouchableOpacity
                    onPress={getCurrentLocation}
                    style={styles.refreshButton}>
                    <Text style={styles.refreshButtonText}>↺</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.locationStatus}
                  onPress={getCurrentLocation}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationTextError}>
                    Tap to use current location
                  </Text>
                </TouchableOpacity>
              )}

              {/* Location search input */}
              <View style={styles.locationSearchRow}>
                <TextInput
                  style={styles.locationSearchInput}
                  placeholder="Search by city or address..."
                  placeholderTextColor="#9ca3af"
                  value={locationSearchText}
                  onChangeText={setLocationSearchText}
                  onSubmitEditing={handleLocationSearch}
                  returnKeyType="search"
                />
                <TouchableOpacity
                  style={[
                    styles.locationSearchButton,
                    isSearchingLocation && styles.locationSearchButtonDisabled,
                  ]}
                  onPress={handleLocationSearch}
                  disabled={isSearchingLocation}>
                  {isSearchingLocation ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.locationSearchButtonText}>Go</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* View Toggle */}
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[
                  styles.viewToggleButton,
                  viewMode === 'list' && styles.viewToggleButtonActive,
                ]}
                onPress={() => setViewMode('list')}>
                <Text
                  style={[
                    styles.viewToggleText,
                    viewMode === 'list' && styles.viewToggleTextActive,
                  ]}>
                  List
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.viewToggleButton,
                  viewMode === 'map' && styles.viewToggleButtonActive,
                ]}
                onPress={() => setViewMode('map')}>
                <Text
                  style={[
                    styles.viewToggleText,
                    viewMode === 'map' && styles.viewToggleTextActive,
                  ]}>
                  Map
                </Text>
              </TouchableOpacity>
            </View>

            {/* Filters */}
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              isLoading={isLoading}
              disabled={!userLocation}
            />

            {/* Scrollable content area */}
            <View style={styles.content}>{renderContent()}</View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    width: 60,
  },
  locationBar: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  locationTextError: {
    flex: 1,
    fontSize: 14,
    color: '#2563eb',
    marginLeft: 4,
  },
  refreshButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  refreshButtonText: {
    fontSize: 18,
    color: '#2563eb',
    fontWeight: '700',
  },
  locationSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationSearchInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  locationSearchButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  locationSearchButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  locationSearchButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  viewToggleButtonActive: {
    backgroundColor: '#2563eb',
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  viewToggleTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  centeredContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
