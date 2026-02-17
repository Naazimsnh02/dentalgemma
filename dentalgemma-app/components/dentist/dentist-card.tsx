'use client';

/**
 * Dentist Card Component
 * 
 * Displays individual dentist information with all required fields
 * Requirements: 5.6, 5.8, 5.9
 */

import { useState } from 'react';
import type { DentistInfo } from '@/types';
import { Star, Phone, Globe, MapPin, Clock, Heart, Navigation } from 'lucide-react';

interface DentistCardProps {
  dentist: DentistInfo;
  isSelected?: boolean;
  isFavorite?: boolean;
  onClick?: () => void;
  onToggleFavorite?: (placeId: string) => void;
}

export function DentistCard({
  dentist,
  isSelected = false,
  isFavorite = false,
  onClick,
  onToggleFavorite,
}: DentistCardProps) {
  const handleGetDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dentist.location.lat},${dentist.location.lng}`;
    window.open(url, '_blank');
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(dentist.placeId);
    }
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dentist.phone && dentist.phone !== 'Not available') {
      window.location.href = `tel:${dentist.phone}`;
    }
  };

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dentist.website) {
      window.open(dentist.website, '_blank');
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg border transition-all cursor-pointer
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 mb-1">
            {dentist.name}
          </h3>
          <p className="text-sm text-gray-600">{dentist.specialty}</p>
        </div>

        {/* Favorite button */}
        <button
          onClick={handleToggleFavorite}
          className={`
            p-2 rounded-full transition-colors
            ${isFavorite 
              ? 'text-red-500 hover:bg-red-50' 
              : 'text-gray-400 hover:bg-gray-100'
            }
          `}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            size={20}
            fill={isFavorite ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Rating and Distance */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1">
          <Star size={16} className="text-yellow-500 fill-yellow-500" />
          <span className="font-medium text-gray-900">
            {dentist.rating.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <MapPin size={16} />
          <span className="text-sm">{dentist.distance} mi</span>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-3">
        {/* Phone */}
        {dentist.phone && dentist.phone !== 'Not available' && (
          <button
            onClick={handlePhoneClick}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors w-full text-left"
          >
            <Phone size={16} className="flex-shrink-0" />
            <span className="truncate">{dentist.phone}</span>
          </button>
        )}

        {/* Website */}
        {dentist.website && (
          <button
            onClick={handleWebsiteClick}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors w-full text-left"
          >
            <Globe size={16} className="flex-shrink-0" />
            <span className="truncate">Visit website</span>
          </button>
        )}

        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <MapPin size={16} className="flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{dentist.address}</span>
        </div>

        {/* Hours */}
        {dentist.hours && dentist.hours !== 'Hours not available' && (
          <div className="flex items-start gap-2 text-sm text-gray-700">
            <Clock size={16} className="flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{dentist.hours}</span>
          </div>
        )}
      </div>

      {/* Get Directions Button */}
      <button
        onClick={handleGetDirections}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Navigation size={16} />
        <span>Get Directions</span>
      </button>
    </div>
  );
}
