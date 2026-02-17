'use client';

/**
 * Treatment Form Component
 * 
 * Form for adding/editing treatment entries with:
 * - Name, phase, status, completion %
 * - Next appointment date
 * - Notes
 * - Document upload functionality
 * 
 * Requirements: 6.1, 6.7
 */

import { useState, useEffect } from 'react';
import { z } from 'zod';
import type { Treatment, TreatmentStatus } from '@/types';

// ============================================================================
// Validation Schema
// ============================================================================

export const treatmentSchema = z.object({
  name: z.string().min(1, 'Treatment name is required'),
  phase: z.string().min(1, 'Phase is required'),
  status: z.enum(['not-started', 'in-progress', 'completed']),
  completionPercentage: z.number().min(0).max(100),
  nextAppointment: z.date().optional(),
  notes: z.string(),
  cost: z.number().min(0).optional(),
});

export type TreatmentFormData = z.infer<typeof treatmentSchema>;

// ============================================================================
// Component Props
// ============================================================================

interface TreatmentFormProps {
  onSubmit: (treatment: Treatment) => void;
  onCancel: () => void;
  initialData?: Treatment;
  isSubmitting?: boolean;
}

// ============================================================================
// Main Component
// ============================================================================

export function TreatmentForm({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
}: TreatmentFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<File[]>(initialData?.documents || []);

  // Form state
  const [formData, setFormData] = useState<Partial<TreatmentFormData>>({
    name: initialData?.name || '',
    phase: initialData?.phase || '',
    status: initialData?.status || 'not-started',
    completionPercentage: initialData?.completionPercentage || 0,
    nextAppointment: initialData?.nextAppointment,
    notes: initialData?.notes || '',
    cost: initialData?.cost,
  });

  // Update completion percentage based on status
  useEffect(() => {
    if (formData.status === 'not-started' && formData.completionPercentage !== 0) {
      setFormData((prev) => ({ ...prev, completionPercentage: 0 }));
    } else if (formData.status === 'completed' && formData.completionPercentage !== 100) {
      setFormData((prev) => ({ ...prev, completionPercentage: 100 }));
    }
  }, [formData.status, formData.completionPercentage]);

  // Validate form
  const validateForm = (): boolean => {
    setErrors({});

    try {
      treatmentSchema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          const path = err.path.join('.');
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const treatment: Treatment = {
        id: initialData?.id || crypto.randomUUID(),
        name: formData.name!,
        phase: formData.phase!,
        status: formData.status!,
        completionPercentage: formData.completionPercentage!,
        nextAppointment: formData.nextAppointment,
        notes: formData.notes!,
        documents,
        cost: formData.cost,
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      onSubmit(treatment);
    }
  };

  // Handle document upload
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments((prev) => [...prev, ...files]);
  };

  // Remove document
  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // Update form field
  const updateField = (field: keyof TreatmentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Treatment Name */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Treatment Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Root Canal Therapy"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Phase */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Phase <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.phase || ''}
          onChange={(e) => updateField('phase', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Initial Consultation, Treatment, Follow-up"
        />
        {errors.phase && <p className="text-red-500 text-sm mt-1">{errors.phase}</p>}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.status || 'not-started'}
          onChange={(e) => updateField('status', e.target.value as TreatmentStatus)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
      </div>

      {/* Completion Percentage */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Completion Percentage <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={formData.completionPercentage || 0}
            onChange={(e) => updateField('completionPercentage', parseInt(e.target.value))}
            className="w-full"
            disabled={formData.status === 'not-started' || formData.status === 'completed'}
          />
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-blue-600">
              {formData.completionPercentage || 0}%
            </span>
            <span className="text-sm text-gray-500">
              {formData.status === 'not-started' && '(Auto-set to 0%)'}
              {formData.status === 'completed' && '(Auto-set to 100%)'}
            </span>
          </div>
        </div>
        {errors.completionPercentage && (
          <p className="text-red-500 text-sm mt-1">{errors.completionPercentage}</p>
        )}
      </div>

      {/* Next Appointment */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Next Appointment (Optional)
        </label>
        <input
          type="datetime-local"
          value={
            formData.nextAppointment
              ? new Date(formData.nextAppointment).toISOString().slice(0, 16)
              : ''
          }
          onChange={(e) =>
            updateField('nextAppointment', e.target.value ? new Date(e.target.value) : undefined)
          }
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Cost */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Cost (Optional)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-gray-500">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.cost || ''}
            onChange={(e) => updateField('cost', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Notes
        </label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Add any additional notes about this treatment..."
        />
      </div>

      {/* Document Upload */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Documents
        </label>
        <input
          type="file"
          multiple
          onChange={handleDocumentUpload}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {documents.length > 0 && (
          <div className="mt-3 space-y-2">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 bg-gray-100 rounded-md"
              >
                <span className="text-sm truncate flex-1">{doc.name}</span>
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className="ml-2 px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update Treatment' : 'Add Treatment'}
        </button>
      </div>
    </form>
  );
}
