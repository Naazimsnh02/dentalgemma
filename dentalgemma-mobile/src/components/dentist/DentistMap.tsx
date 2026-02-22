import React, {useRef, useEffect} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Circle} from 'react-native-maps';
import type {DentistInfo, Location} from '../../screens/DentistFinderScreen';

interface DentistMapProps {
  dentists: DentistInfo[];
  userLocation: Location | null;
  selectedDentist: string | null;
  onMarkerPress: (placeId: string) => void;
}

export const DentistMap: React.FC<DentistMapProps> = ({
  dentists,
  userLocation,
  selectedDentist,
  onMarkerPress,
}) => {
  const mapRef = useRef<MapView>(null);

  // Fit map to show all markers when dentists change
  useEffect(() => {
    if (dentists.length > 0 && mapRef.current) {
      const coordinates = dentists.map(d => ({
        latitude: d.location.lat,
        longitude: d.location.lng,
      }));

      // Add user location if available
      if (userLocation) {
        coordinates.push({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        });
      }

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
        animated: true,
      });
    }
  }, [dentists, userLocation]);

  // Center on selected dentist
  useEffect(() => {
    if (selectedDentist && mapRef.current) {
      const dentist = dentists.find(d => d.placeId === selectedDentist);
      if (dentist) {
        mapRef.current.animateToRegion({
          latitude: dentist.location.lat,
          longitude: dentist.location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    }
  }, [selectedDentist, dentists]);

  const initialRegion = userLocation
    ? {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}>
        {/* User Location Circle */}
        {userLocation && (
          <Circle
            center={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            }}
            radius={1609.34 * 10} // 10 miles in meters
            strokeColor="rgba(37, 99, 235, 0.3)"
            fillColor="rgba(37, 99, 235, 0.1)"
          />
        )}

        {/* Dentist Markers */}
        {dentists.map(dentist => (
          <Marker
            key={dentist.placeId}
            coordinate={{
              latitude: dentist.location.lat,
              longitude: dentist.location.lng,
            }}
            title={dentist.name}
            description={`${dentist.specialty} • ${dentist.rating}⭐ • ${dentist.distance} mi`}
            onPress={() => onMarkerPress(dentist.placeId)}
            pinColor={
              selectedDentist === dentist.placeId ? '#2563eb' : '#dc2626'
            }
          />
        ))}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: '#dc2626'}]} />
          <Text style={styles.legendText}>Dentist</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: '#2563eb'}]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  legend: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
});
