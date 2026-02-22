import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import type {DentistInfo} from '../../screens/DentistFinderScreen';

interface DentistCardProps {
  dentist: DentistInfo;
  isSelected: boolean;
  onPress: () => void;
}

export const DentistCard: React.FC<DentistCardProps> = ({
  dentist,
  isSelected,
  onPress,
}) => {
  const handleCall = () => {
    if (dentist.phone && dentist.phone !== 'Not available') {
      const phoneNumber = dentist.phone.replace(/[^0-9]/g, '');
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Phone Not Available', 'No phone number available for this dentist.');
    }
  };

  const handleWebsite = () => {
    if (dentist.website) {
      Linking.openURL(dentist.website);
    } else {
      Alert.alert('Website Not Available', 'No website available for this dentist.');
    }
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dentist.location.lat},${dentist.location.lng}`;
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.containerSelected]}
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name}>{dentist.name}</Text>
          <Text style={styles.specialty}>{dentist.specialty}</Text>
        </View>
      </View>

      {/* Rating and Distance */}
      <View style={styles.infoRow}>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingIcon}>⭐</Text>
          <Text style={styles.ratingText}>{dentist.rating.toFixed(1)}</Text>
        </View>
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceIcon}>📍</Text>
          <Text style={styles.distanceText}>{dentist.distance} mi</Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.addressContainer}>
        <Text style={styles.addressIcon}>📍</Text>
        <Text style={styles.addressText} numberOfLines={2}>
          {dentist.address}
        </Text>
      </View>

      {/* Hours */}
      {dentist.hours && dentist.hours !== 'Hours not available' && (
        <View style={styles.hoursContainer}>
          <Text style={styles.hoursIcon}>🕐</Text>
          <Text style={styles.hoursText} numberOfLines={2}>
            {dentist.hours}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {isSelected && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCall}>
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>

          {dentist.website && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleWebsite}>
              <Text style={styles.actionIcon}>🌐</Text>
              <Text style={styles.actionText}>Website</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={handleDirections}>
            <Text style={styles.actionIcon}>🧭</Text>
            <Text style={[styles.actionText, styles.actionTextPrimary]}>
              Directions
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  containerSelected: {
    borderColor: '#2563eb',
    borderWidth: 2,
    backgroundColor: '#eff6ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#6b7280',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addressIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hoursIcon: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  hoursText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: '#2563eb',
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionTextPrimary: {
    color: '#ffffff',
  },
});
