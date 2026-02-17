'use client';

/**
 * Dentist Map Component
 * 
 * Interactive map using Leaflet.js with OpenStreetMap tiles
 * Features: clustered markers, click to highlight, zoom controls, current location
 * Requirements: 5.5, 5.6, 5.7
 */

import { useEffect, useRef, useState } from 'react';
import type { DentistInfo, Location } from '@/types';

// Leaflet imports (dynamic to avoid SSR issues)
let L: any = null;
let MarkerClusterGroup: any = null;

interface DentistMapProps {
  dentists: DentistInfo[];
  center: Location;
  selectedDentist?: string | null;
  onMarkerClick?: (placeId: string) => void;
}

export function DentistMap({
  dentists,
  center,
  selectedDentist,
  onMarkerClick,
}: DentistMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const markerClusterGroupRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);

  // Load Leaflet dynamically (client-side only)
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Import Leaflet
        const leaflet = await import('leaflet');
        L = leaflet.default;

        // Import marker cluster plugin
        const markerCluster = await import('leaflet.markercluster');
        MarkerClusterGroup = (markerCluster as any).default || markerCluster;

        // Fix default marker icon paths
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load Leaflet:', err);
        setError('Failed to load map library');
        setIsLoading(false);
      }
    };

    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) {
      return;
    }

    try {
      // Create map instance
      const map = L.map(mapRef.current, {
        center: [center.lat, center.lng],
        zoom: 13,
        zoomControl: false, // We'll add custom controls
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add zoom control to top-right
      L.control.zoom({
        position: 'topright',
      }).addTo(map);

      // Create marker cluster group
      const clusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
      });

      map.addLayer(clusterGroup);

      mapInstanceRef.current = map;
      markerClusterGroupRef.current = clusterGroup;
    } catch (err) {
      console.error('Failed to initialize map:', err);
      setError('Failed to initialize map');
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [L, center]);

  // Update markers when dentists change
  useEffect(() => {
    if (!L || !mapInstanceRef.current || !markerClusterGroupRef.current) {
      return;
    }

    const map = mapInstanceRef.current;
    const clusterGroup = markerClusterGroupRef.current;

    // Clear existing markers
    clusterGroup.clearLayers();
    markersRef.current.clear();

    // Add markers for each dentist
    dentists.forEach((dentist) => {
      // Create custom icon based on rating
      const iconColor = dentist.rating >= 4.5 ? 'green' : dentist.rating >= 4 ? 'blue' : 'gray';
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="relative">
            <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" fill="${iconColor === 'green' ? '#10b981' : iconColor === 'blue' ? '#3b82f6' : '#6b7280'}"/>
              <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
            <div class="absolute top-[8px] left-1/2 -translate-x-1/2 text-xs font-bold text-gray-800">
              ${dentist.rating.toFixed(1)}
            </div>
          </div>
        `,
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42],
      });

      // Create marker
      const marker = L.marker([dentist.location.lat, dentist.location.lng], {
        icon: customIcon,
      });

      // Add popup
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">${dentist.name}</h3>
          <p class="text-xs text-gray-600">${dentist.specialty}</p>
          <p class="text-xs text-gray-600">Rating: ${dentist.rating} ⭐</p>
          <p class="text-xs text-gray-600">Distance: ${dentist.distance} mi</p>
        </div>
      `);

      // Add click handler
      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(dentist.placeId);
        }
      });

      // Add to cluster group
      clusterGroup.addLayer(marker);
      markersRef.current.set(dentist.placeId, marker);
    });

    // Fit bounds to show all markers
    if (dentists.length > 0) {
      const bounds = L.latLngBounds(
        dentists.map((d) => [d.location.lat, d.location.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [L, dentists, onMarkerClick]);

  // Highlight selected dentist
  useEffect(() => {
    if (!L || !mapInstanceRef.current || !selectedDentist) {
      return;
    }

    const marker = markersRef.current.get(selectedDentist);
    if (marker) {
      // Pan to marker
      mapInstanceRef.current.setView(marker.getLatLng(), 15, {
        animate: true,
      });

      // Open popup
      marker.openPopup();
    }
  }, [L, selectedDentist]);

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);

        if (mapInstanceRef.current && L) {
          // Add user location marker
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: `
              <div class="relative">
                <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                <div class="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75"></div>
              </div>
            `,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });

          L.marker([location.lat, location.lng], { icon: userIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup('Your location');

          // Pan to user location
          mapInstanceRef.current.setView([location.lat, location.lng], 14, {
            animate: true,
          });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please check your browser permissions.');
      }
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center text-red-600">
          <p className="font-semibold">Error loading map</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Current location button */}
      <button
        onClick={handleGetCurrentLocation}
        className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        title="Get current location"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-lg">
        <h4 className="text-xs font-semibold mb-2">Rating Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>4.5+ stars</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>4.0+ stars</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <span>&lt; 4.0 stars</span>
          </div>
        </div>
      </div>
    </div>
  );
}
