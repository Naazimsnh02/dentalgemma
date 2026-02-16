'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCw, Move, Maximize2, X } from 'lucide-react';
import type { VisualAnnotations } from '@/types';

interface XRayViewerProps {
  imageUrl: string;
  annotations?: VisualAnnotations;
  comparisonImageUrl?: string;
  alt?: string;
  className?: string;
}

export function XRayViewer({
  imageUrl,
  annotations,
  comparisonImageUrl,
  alt = 'X-ray image',
  className = '',
}: XRayViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonSlider, setComparisonSlider] = useState(50);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left click
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  }, [position]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(5, prev + delta)));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}
    >
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleRotate}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Rotate"
          >
            <RotateCw className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Reset view"
          >
            <Move className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Fullscreen"
          >
            {isFullscreen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Maximize2 className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Zoom indicator */}
        <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Comparison toggle */}
      {comparisonImageUrl && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm hover:bg-black/70 transition-colors"
          >
            {showComparison ? 'Hide' : 'Show'} Comparison
          </button>
        </div>
      )}

      {/* Image container */}
      <div
        className="relative w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Main image */}
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
          className="relative"
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
          />

          {/* Annotations overlay */}
          {annotations && annotations.boxes.length > 0 && (
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ transform: 'none' }}
            >
              {annotations.boxes.map((box, index) => (
                <g key={index}>
                  <rect
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                    fill="none"
                    stroke={annotations.colors[index] || '#ff0000'}
                    strokeWidth="2"
                    opacity="0.8"
                  />
                  {annotations.labels[index] && (
                    <text
                      x={box.x}
                      y={box.y - 5}
                      fill={annotations.colors[index] || '#ff0000'}
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {annotations.labels[index]} ({Math.round(box.confidence * 100)}%)
                    </text>
                  )}
                </g>
              ))}
            </svg>
          )}
        </div>

        {/* Comparison slider */}
        {showComparison && comparisonImageUrl && (
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                clipPath: `inset(0 ${100 - comparisonSlider}% 0 0)`,
              }}
            >
              <img
                src={comparisonImageUrl}
                alt="Comparison image"
                className="w-full h-full object-contain select-none"
                draggable={false}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                }}
              />
            </div>

            {/* Slider control */}
            <div className="absolute inset-x-0 bottom-8 flex justify-center">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 w-80">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={comparisonSlider}
                  onChange={(e) => setComparisonSlider(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-white text-xs mt-2">
                  <span>Original</span>
                  <span>Comparison</span>
                </div>
              </div>
            </div>

            {/* Divider line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
              style={{ left: `${comparisonSlider}%` }}
            />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
        <p>Drag to pan • Scroll to zoom • Click controls to adjust</p>
      </div>
    </div>
  );
}
