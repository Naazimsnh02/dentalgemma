'use client';

/**
 * Dental Anatomy Explorer Component
 * 
 * Interactive SVG visualization of dental anatomy with realistic occlusal 
 * tooth paths, 3D enamel styling, and HTML tooltips.
 */

import { useState } from 'react';
import { Info, HelpCircle } from 'lucide-react';

interface ToothInfo {
  number: number;
  name: string;
  type: string;
  description: string;
  position: { x: number; y: number };
  isUpper?: boolean;
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

const allTeeth: ToothInfo[] = [
  ...upperTeeth.map(t => ({ ...t, isUpper: true })),
  ...lowerTeeth.map(t => ({ ...t, isUpper: false }))
];

const ToothPaths = ({ type }: { type: string }) => {
  switch (type) {
    case 'Incisor': return (
      <path d="M -11,-6 C -5,-9 5,-9 11,-6 C 12,-1 9,6 5,8 C 2,10 -2,10 -5,8 C -9,6 -12,-1 -11,-6 Z" />
    );
    case 'Canine': return (
      <path d="M -9,-6 C 0,-13 0,-13 9,-6 C 11,-1 8,7 4,9 C 2,11 -2,11 -4,9 C -8,7 -11,-1 -9,-6 Z" />
    );
    case 'Premolar': return (
      <>
        <path d="M -10,-8 C -5,-11 5,-11 10,-8 C 12,0 12,6 8,10 C 4,13 -4,13 -8,10 C -12,6 -12,0 -10,-8 Z" />
        <path d="M -5,1 L 5,1" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </>
    );
    case 'Molar': return (
      <>
        <path d="M -13,-11 C -5,-13 5,-13 13,-11 C 15,-2 15,5 11,11 C 5,15 -5,15 -11,11 C -15,5 -15,-2 -13,-11 Z" />
        <path d="M -6,0 L 6,0 M 0,-5 L 0,5" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="-4" cy="-3" r="1" fill="rgba(0,0,0,0.08)" />
        <circle cx="4" cy="-3" r="1" fill="rgba(0,0,0,0.08)" />
        <circle cx="-4" cy="3" r="1" fill="rgba(0,0,0,0.08)" />
        <circle cx="4" cy="3" r="1" fill="rgba(0,0,0,0.08)" />
      </>
    );
    default: return <path d="M -10,-10 L 10,-10 L 10,10 L -10,10 Z" />;
  }
};

export function AnatomyExplorer() {
  const [hoveredTooth, setHoveredTooth] = useState<ToothInfo | null>(null);
  const [selectedTooth, setSelectedTooth] = useState<ToothInfo | null>(null);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'Incisor': return { color: '#3B82F6', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' };
      case 'Canine': return { color: '#10B981', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' };
      case 'Premolar': return { color: '#F59E0B', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' };
      case 'Molar': return { color: '#EF4444', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
      default: return { color: '#6B7280', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };
    }
  };

  const handleToothClick = (tooth: ToothInfo) => {
    setSelectedTooth(tooth);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-50 rounded-xl">
          <Info size={26} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dental Anatomy Explorer</h2>
          <p className="text-gray-600 mt-1">Explore interactive 3D anatomy to understand your teeth better.</p>
        </div>
      </div>

      {/* Modern SVG Viewer Container */}
      <div className="relative w-full aspect-[2/1] bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-gray-200/60 shadow-inner mb-8 overflow-hidden group">
        
        {/* Dynamic HTML Tooltip */}
        <div 
          className="absolute z-20 pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: hoveredTooth ? `${(hoveredTooth.position.x / 850) * 100}%` : '50%',
            top: hoveredTooth
              ? hoveredTooth.isUpper
                ? `calc(${(hoveredTooth.position.y / 400) * 100}% + 24px)`
                : `calc(${(hoveredTooth.position.y / 400) * 100}% - 24px)`
              : '50%',
            opacity: hoveredTooth ? 1 : 0,
            transform: hoveredTooth
              ? hoveredTooth.isUpper
                ? 'translate(-50%, 0%) scale(1)'
                : 'translate(-50%, -100%) scale(1)'
              : 'translate(-50%, -100%) scale(0.95)',
          }}
        >
          {hoveredTooth && (
            <div className={`bg-white/95 backdrop-blur-md shadow-xl border ${getTypeStyle(hoveredTooth.type).border} rounded-xl p-3 w-52 flex flex-col items-center relative`}>
              {/* Little triangle pointer — top for upper teeth, bottom for lower teeth */}
              {hoveredTooth.isUpper ? (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-inherit transform rotate-45"></div>
              ) : (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-inherit transform rotate-45"></div>
              )}
              
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-3 h-3 rounded-full`} style={{ backgroundColor: getTypeStyle(hoveredTooth.type).color }} />
                <span className="font-bold text-gray-900 text-sm">Tooth #{hoveredTooth.number}</span>
              </div>
              <p className="font-semibold text-gray-800 text-center">{hoveredTooth.name}</p>
              <p className={`text-xs mt-1 font-medium px-2 py-0.5 rounded-full ${getTypeStyle(hoveredTooth.type).bg} ${getTypeStyle(hoveredTooth.type).text}`}>
                {hoveredTooth.type}
              </p>
            </div>
          )}
        </div>

        <svg
          viewBox="0 0 850 400"
          className="w-full h-full absolute inset-0 drop-shadow-sm"
        >
          <defs>
            {/* Realistic Enamel Gradient */}
            <radialGradient id="enamel" cx="40%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </radialGradient>
            <radialGradient id="enamelHover" cx="40%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </radialGradient>
            
            <filter id="toothShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
            
            <filter id="archGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Aesthetic Arch Lines */}
          <path
            d="M 50 100 Q 425 40 800 100"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 50 300 Q 425 360 800 300"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Center Midline */}
          <line
            x1="425"
            y1="60"
            x2="425"
            y2="340"
            stroke="#CBD5E1"
            strokeWidth="2"
            strokeDasharray="4,6"
          />

          {/* Render Each Tooth */}
          {allTeeth.map((tooth) => {
            const isHovered = hoveredTooth?.number === tooth.number;
            const isSelected = selectedTooth?.number === tooth.number;
            
            // Calculate outward rotation - teeth should face away from arch center
            const cx = 425;
            const cy = tooth.isUpper ? 60 : 340; // Use actual arch curve center
            const dx = tooth.position.x - cx;
            const dy = tooth.position.y - cy;
            const angleRad = Math.atan2(dy, dx);
            // Adjust rotation: upper teeth point down, lower teeth point up
            const rotAngle = angleRad * (180 / Math.PI) + (tooth.isUpper ? 90 : -90);

            const outX = Math.cos(angleRad) * 28;
            const outY = Math.sin(angleRad) * 28;

            const styleData = getTypeStyle(tooth.type);

            return (
              <g
                key={tooth.number}
                onMouseEnter={() => setHoveredTooth(tooth)}
                onMouseLeave={() => setHoveredTooth(null)}
                onClick={() => handleToothClick(tooth)}
                className="cursor-pointer outline-none"
                transform={`translate(${tooth.position.x}, ${tooth.position.y})`}
              >
                <g>
                  {/* Invisible Hit Area to prevent hover jitter - scales with tooth */}
                  <circle cx="0" cy="0" r="28" fill="transparent" />

                  {/* Glowing halo indicator when selected or hovered */}
                  {(isHovered || isSelected) && (
                    <circle 
                      cx="0" cy="0" r="16" 
                      fill="none"
                      stroke={styleData.color} 
                      strokeWidth="3"
                      opacity="0.4"
                      filter="url(#archGlow)"
                    />
                  )}

                  {/* Rotated Tooth shape with Enamel gradient */}
                  <g transform={`rotate(${rotAngle})`}>
                    <g 
                      fill={isHovered ? "url(#enamelHover)" : "url(#enamel)"} 
                      filter="url(#toothShadow)"
                    >
                      <ToothPaths type={tooth.type} />
                    </g>
                    {/* Outline indicator of the tooth type */}
                    <g fill="none" strokeWidth="1.5" stroke={styleData.color} opacity={isSelected ? 1 : (isHovered ? 0.8 : 0.4)}>
                      <ToothPaths type={tooth.type} />
                    </g>
                  </g>
                </g>
                
                {/* Outward spreading Tooth Number */}
                <text
                  x={outX}
                  y={outY + 4} // Slightly adjust for vertical centering
                  textAnchor="middle"
                  fill={isHovered || isSelected ? styleData.color : "#64748B"}
                  fontSize="12"
                  fontWeight={isHovered || isSelected ? "800" : "600"}
                  pointerEvents="none"
                  className="transition-all duration-200"
                >
                  {tooth.number}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mb-8 bg-gray-50 border border-gray-100 rounded-xl p-4">
        {['Incisor', 'Canine', 'Premolar', 'Molar'].map((type) => (
          <div key={type} className="flex items-center gap-2 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-100">
            <div
              className="w-3.5 h-3.5 rounded-full shadow-inner"
              style={{ backgroundColor: getTypeStyle(type).color }}
            />
            <span className="text-sm text-gray-700 font-semibold">{type}</span>
          </div>
        ))}
      </div>

      {/* Selected Tooth Info Container */}
      {selectedTooth ? (
        <div className={`border rounded-xl p-5 shadow-sm transition-all duration-500 ease-out animate-in slide-in-from-bottom-4 ${getTypeStyle(selectedTooth.type).bg} ${getTypeStyle(selectedTooth.type).border}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white shadow-sm`} style={{ backgroundColor: getTypeStyle(selectedTooth.type).color }}>
                  {selectedTooth.number}
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedTooth.name}
                </h3>
              </div>
              <div className="mt-3 text-gray-700 leading-relaxed bg-white/60 p-4 rounded-lg">
                <p className="mb-2"><strong>Category:</strong> {selectedTooth.type}</p>
                <p><strong>Function & Notes:</strong> {selectedTooth.description}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedTooth(null)}
              className="p-2 rounded-full hover:bg-black/5 text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Close details"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 text-center text-slate-500 flex flex-col items-center justify-center min-h-[140px]">
          <HelpCircle className="w-8 h-8 opacity-40 mb-2" />
          <p className="font-medium">Information Panel</p>
          <p className="text-sm mt-1">Select any tooth from the interactive view above to explore its clinical details.</p>
        </div>
      )}
    </div>
  );
}
