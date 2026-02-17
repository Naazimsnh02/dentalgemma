'use client';

/**
 * Dental Anatomy Explorer Component
 * 
 * Interactive SVG visualization of dental anatomy with hover tooltips
 * Requirements: 8.4
 */

import { useState } from 'react';
import { Info } from 'lucide-react';

interface ToothInfo {
  number: number;
  name: string;
  type: string;
  description: string;
  position: { x: number; y: number };
}

// Dental anatomy data (Universal Numbering System)
const upperTeeth: ToothInfo[] = [
  { number: 1, name: 'Third Molar', type: 'Molar', description: 'Wisdom tooth, often removed', position: { x: 50, y: 100 } },
  { number: 2, name: 'Second Molar', type: 'Molar', description: 'Used for grinding food', position: { x: 100, y: 90 } },
  { number: 3, name: 'First Molar', type: 'Molar', description: 'Primary grinding tooth', position: { x: 150, y: 85 } },
  { number: 4, name: 'Second Premolar', type: 'Premolar', description: 'Helps crush and grind', position: { x: 200, y: 80 } },
  { number: 5, name: 'First Premolar', type: 'Premolar', description: 'Transitional tooth', position: { x: 250, y: 75 } },
  { number: 6, name: 'Canine', type: 'Canine', description: 'Pointed tooth for tearing', position: { x: 300, y: 70 } },
  { number: 7, name: 'Lateral Incisor', type: 'Incisor', description: 'Cutting tooth', position: { x: 350, y: 65 } },
  { number: 8, name: 'Central Incisor', type: 'Incisor', description: 'Front cutting tooth', position: { x: 400, y: 60 } },
  { number: 9, name: 'Central Incisor', type: 'Incisor', description: 'Front cutting tooth', position: { x: 450, y: 60 } },
  { number: 10, name: 'Lateral Incisor', type: 'Incisor', description: 'Cutting tooth', position: { x: 500, y: 65 } },
  { number: 11, name: 'Canine', type: 'Canine', description: 'Pointed tooth for tearing', position: { x: 550, y: 70 } },
  { number: 12, name: 'First Premolar', type: 'Premolar', description: 'Transitional tooth', position: { x: 600, y: 75 } },
  { number: 13, name: 'Second Premolar', type: 'Premolar', description: 'Helps crush and grind', position: { x: 650, y: 80 } },
  { number: 14, name: 'First Molar', type: 'Molar', description: 'Primary grinding tooth', position: { x: 700, y: 85 } },
  { number: 15, name: 'Second Molar', type: 'Molar', description: 'Used for grinding food', position: { x: 750, y: 90 } },
  { number: 16, name: 'Third Molar', type: 'Molar', description: 'Wisdom tooth, often removed', position: { x: 800, y: 100 } },
];

const lowerTeeth: ToothInfo[] = [
  { number: 32, name: 'Third Molar', type: 'Molar', description: 'Wisdom tooth, often removed', position: { x: 50, y: 300 } },
  { number: 31, name: 'Second Molar', type: 'Molar', description: 'Used for grinding food', position: { x: 100, y: 310 } },
  { number: 30, name: 'First Molar', type: 'Molar', description: 'Primary grinding tooth', position: { x: 150, y: 315 } },
  { number: 29, name: 'Second Premolar', type: 'Premolar', description: 'Helps crush and grind', position: { x: 200, y: 320 } },
  { number: 28, name: 'First Premolar', type: 'Premolar', description: 'Transitional tooth', position: { x: 250, y: 325 } },
  { number: 27, name: 'Canine', type: 'Canine', description: 'Pointed tooth for tearing', position: { x: 300, y: 330 } },
  { number: 26, name: 'Lateral Incisor', type: 'Incisor', description: 'Cutting tooth', position: { x: 350, y: 335 } },
  { number: 25, name: 'Central Incisor', type: 'Incisor', description: 'Front cutting tooth', position: { x: 400, y: 340 } },
  { number: 24, name: 'Central Incisor', type: 'Incisor', description: 'Front cutting tooth', position: { x: 450, y: 340 } },
  { number: 23, name: 'Lateral Incisor', type: 'Incisor', description: 'Cutting tooth', position: { x: 500, y: 335 } },
  { number: 22, name: 'Canine', type: 'Canine', description: 'Pointed tooth for tearing', position: { x: 550, y: 330 } },
  { number: 21, name: 'First Premolar', type: 'Premolar', description: 'Transitional tooth', position: { x: 600, y: 325 } },
  { number: 20, name: 'Second Premolar', type: 'Premolar', description: 'Helps crush and grind', position: { x: 650, y: 320 } },
  { number: 19, name: 'First Molar', type: 'Molar', description: 'Primary grinding tooth', position: { x: 700, y: 315 } },
  { number: 18, name: 'Second Molar', type: 'Molar', description: 'Used for grinding food', position: { x: 750, y: 310 } },
  { number: 17, name: 'Third Molar', type: 'Molar', description: 'Wisdom tooth, often removed', position: { x: 800, y: 300 } },
];

const allTeeth = [...upperTeeth, ...lowerTeeth];

export function AnatomyExplorer() {
  const [hoveredTooth, setHoveredTooth] = useState<ToothInfo | null>(null);
  const [selectedTooth, setSelectedTooth] = useState<ToothInfo | null>(null);

  const getToothColor = (type: string): string => {
    switch (type) {
      case 'Incisor':
        return '#3B82F6'; // Blue
      case 'Canine':
        return '#10B981'; // Green
      case 'Premolar':
        return '#F59E0B'; // Orange
      case 'Molar':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  const handleToothClick = (tooth: ToothInfo) => {
    setSelectedTooth(tooth);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Info size={24} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Dental Anatomy Explorer</h2>
          <p className="text-sm text-gray-600">Hover over teeth to learn more about each type</p>
        </div>
      </div>

      {/* SVG Diagram */}
      <div className="relative bg-gray-50 rounded-lg p-8 mb-6">
        <svg
          viewBox="0 0 850 400"
          className="w-full h-auto"
          style={{ maxHeight: '400px' }}
        >
          {/* Upper Jaw Arc */}
          <path
            d="M 50 100 Q 425 40 800 100"
            fill="none"
            stroke="#D1D5DB"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Lower Jaw Arc */}
          <path
            d="M 50 300 Q 425 360 800 300"
            fill="none"
            stroke="#D1D5DB"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Midline */}
          <line
            x1="425"
            y1="50"
            x2="425"
            y2="350"
            stroke="#D1D5DB"
            strokeWidth="1"
            strokeDasharray="3,3"
          />

          {/* Teeth */}
          {allTeeth.map((tooth) => {
            const isHovered = hoveredTooth?.number === tooth.number;
            const isSelected = selectedTooth?.number === tooth.number;
            const scale = isHovered || isSelected ? 1.2 : 1;
            const opacity = isHovered || isSelected ? 1 : 0.8;

            return (
              <g
                key={tooth.number}
                onMouseEnter={() => setHoveredTooth(tooth)}
                onMouseLeave={() => setHoveredTooth(null)}
                onClick={() => handleToothClick(tooth)}
                style={{ cursor: 'pointer' }}
                transform={`translate(${tooth.position.x}, ${tooth.position.y})`}
              >
                {/* Tooth Shape */}
                <circle
                  cx="0"
                  cy="0"
                  r={15 * scale}
                  fill={getToothColor(tooth.type)}
                  opacity={opacity}
                  stroke={isSelected ? '#1F2937' : 'white'}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition-all duration-200"
                />
                
                {/* Tooth Number */}
                <text
                  x="0"
                  y="5"
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {tooth.number}
                </text>

                {/* Hover Tooltip */}
                {isHovered && (
                  <g>
                    <rect
                      x="-60"
                      y="-50"
                      width="120"
                      height="35"
                      fill="white"
                      stroke="#E5E7EB"
                      strokeWidth="1"
                      rx="4"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                    />
                    <text
                      x="0"
                      y="-35"
                      textAnchor="middle"
                      fill="#111827"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      #{tooth.number} - {tooth.name}
                    </text>
                    <text
                      x="0"
                      y="-23"
                      textAnchor="middle"
                      fill="#6B7280"
                      fontSize="8"
                    >
                      {tooth.type}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {['Incisor', 'Canine', 'Premolar', 'Molar'].map((type) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getToothColor(type) }}
            />
            <span className="text-sm text-gray-700 font-medium">{type}</span>
          </div>
        ))}
      </div>

      {/* Selected Tooth Info */}
      {selectedTooth && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Tooth #{selectedTooth.number} - {selectedTooth.name}
              </h3>
              <p className="text-sm text-blue-700 font-medium mb-2">
                {selectedTooth.type}
              </p>
              <p className="text-sm text-gray-700">
                {selectedTooth.description}
              </p>
            </div>
            <button
              onClick={() => setSelectedTooth(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedTooth && (
        <div className="text-center text-sm text-gray-500">
          Click on any tooth to see detailed information
        </div>
      )}
    </div>
  );
}
