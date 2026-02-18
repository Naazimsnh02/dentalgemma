'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileImage, AlertCircle } from 'lucide-react';
import type { ImageFormat } from '@/types';

interface XRayUploaderProps {
  onUpload: (file: File) => void;
  onError?: (error: string) => void;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
}

const ACCEPTED_FORMATS: ImageFormat[] = ['jpeg', 'png', 'dicom'];
const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/dicom',
  '.dcm',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIME_TO_FORMAT: Record<string, ImageFormat> = {
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/png': 'png',
  'application/dicom': 'dicom',
};

export function XRayUploader({
  onUpload,
  onError,
  accept = ACCEPTED_MIME_TYPES.join(','),
  maxSize = MAX_FILE_SIZE,
  disabled = false,
}: XRayUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): { valid: boolean; error?: string } => {
      // Check file size
      if (file.size > maxSize) {
        return {
          valid: false,
          error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
        };
      }

      // Check file format
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type.toLowerCase();

      const isValidMime = ACCEPTED_MIME_TYPES.some(
        (type) => type === mimeType || type === `.${fileExtension}`
      );

      if (!isValidMime && !ACCEPTED_FORMATS.includes(fileExtension as ImageFormat)) {
        return {
          valid: false,
          error: `Invalid file format. Accepted formats: ${ACCEPTED_FORMATS.join(', ').toUpperCase()}`,
        };
      }

      return { valid: true };
    },
    [maxSize]
  );

  const handleFile = useCallback(
    (file: File) => {
      const validation = validateFile(file);

      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        onError?.(validation.error || 'Invalid file');
        return;
      }

      setError(null);
      setSelectedFile(file);

      // Create preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // DICOM files don't have preview
        setPreview(null);
      }

      onUpload(file);
    },
    [validateFile, onUpload, onError]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload area */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200 ease-in-out
            ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div
              className={`
              p-4 rounded-full transition-colors
              ${
                isDragging
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'bg-muted'
              }
            `}
            >
              <Upload
                className={`w-8 h-8 ${
                  isDragging ? 'text-blue-500' : 'text-gray-400'
                }`}
              />
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">
                {isDragging ? 'Drop your image here' : 'Upload Dental Image'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Drag and drop or click to browse
              </p>
            </div>

            <div className="text-xs text-gray-400 dark:text-gray-500 space-y-1">
              <p>Supported formats: JPEG, PNG, DICOM</p>
              <p>Maximum file size: {maxSize / (1024 * 1024)}MB</p>
            </div>
          </div>
        </div>
      ) : (
        /* Preview area */
        <div className="relative border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4">
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start space-x-4">
            {preview ? (
              <img
                src={preview}
                alt="Image preview"
                className="w-32 h-32 object-cover rounded-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <FileImage className="w-12 h-12 text-gray-400" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black dark:text-gray-100 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedFile.type || 'Unknown type'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
