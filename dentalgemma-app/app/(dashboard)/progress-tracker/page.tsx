'use client';

/**
 * Treatment Progress Tracker Page
 * 
 * Complete treatment tracking interface with:
 * - Treatment form for add/edit
 * - Timeline visualization
 * - Progress charts
 * - Treatment cards with color-coded indicators
 * - PDF export functionality
 * - localStorage persistence
 * 
 * Requirements: 6.1-6.10
 */

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';
import { TreatmentForm } from '@/components/treatment/treatment-form';
import { TreatmentTimeline } from '@/components/treatment/treatment-timeline';
import { TreatmentCard } from '@/components/treatment/treatment-card';
import { ProgressCharts } from '@/components/dashboard/charts';
import type { Treatment } from '@/types';
import jsPDF from 'jspdf';

// ============================================================================
// Main Component
// ============================================================================

export default function ProgressTrackerPage() {
  const { treatments, addTreatment, updateTreatment, deleteTreatment } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'timeline' | 'list' | 'charts'>('timeline');

  // Handle form submission
  const handleSubmit = (treatment: Treatment) => {
    if (editingTreatment) {
      updateTreatment(treatment.id, treatment);
    } else {
      addTreatment(treatment);
    }
    setShowForm(false);
    setEditingTreatment(undefined);
  };

  // Handle edit
  const handleEdit = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this treatment?')) {
      deleteTreatment(id);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingTreatment(undefined);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.text('Treatment Progress Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, {
      align: 'center',
    });
    yPosition += 15;

    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    const notStarted = treatments.filter((t) => t.status === 'not-started').length;
    const inProgress = treatments.filter((t) => t.status === 'in-progress').length;
    const completed = treatments.filter((t) => t.status === 'completed').length;
    const totalCost = treatments.reduce((sum, t) => sum + (t.cost || 0), 0);

    doc.text(`Total Treatments: ${treatments.length}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Not Started: ${notStarted}`, 20, yPosition);
    yPosition += 7;
    doc.text(`In Progress: ${inProgress}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Completed: ${completed}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Total Cost: $${totalCost.toFixed(2)}`, 20, yPosition);
    yPosition += 15;

    // Treatments
    doc.setFontSize(14);
    doc.text('Treatments', 20, yPosition);
    yPosition += 10;

    treatments.forEach((treatment, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(12);
      doc.text(`${index + 1}. ${treatment.name}`, 20, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.text(`Phase: ${treatment.phase}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Status: ${treatment.status}`, 25, yPosition);
      yPosition += 6;
      doc.text(`Completion: ${treatment.completionPercentage}%`, 25, yPosition);
      yPosition += 6;

      if (treatment.nextAppointment) {
        doc.text(
          `Next Appointment: ${new Date(treatment.nextAppointment).toLocaleDateString()}`,
          25,
          yPosition
        );
        yPosition += 6;
      }

      if (treatment.cost) {
        doc.text(`Cost: $${treatment.cost.toFixed(2)}`, 25, yPosition);
        yPosition += 6;
      }

      if (treatment.notes) {
        const lines = doc.splitTextToSize(`Notes: ${treatment.notes}`, pageWidth - 50);
        doc.text(lines, 25, yPosition);
        yPosition += lines.length * 6;
      }

      yPosition += 5;
    });

    // Save PDF
    doc.save(`treatment-progress-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Treatment Progress Tracker</h1>
        <p className="text-gray-600">
          Track your dental treatment progress, milestones, and appointments
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          + Add Treatment
        </button>
        {treatments.length > 0 && (
          <button
            onClick={handleExportPDF}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Export PDF
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingTreatment ? 'Edit Treatment' : 'Add New Treatment'}
            </h2>
            <TreatmentForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              initialData={editingTreatment}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      {treatments.length > 0 && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === 'timeline'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Timeline View
              </button>
              <button
                onClick={() => setActiveTab('list')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === 'list'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                List View
              </button>
              <button
                onClick={() => setActiveTab('charts')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === 'charts'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Charts & Analytics
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Content */}
      {treatments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No treatments yet</h3>
          <p className="text-gray-600 mb-6">
            Start tracking your dental treatments by adding your first treatment
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Add Your First Treatment
          </button>
        </div>
      ) : (
        <>
          {/* Timeline View */}
          {activeTab === 'timeline' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <TreatmentTimeline treatments={treatments} onTreatmentClick={handleEdit} />
            </div>
          )}

          {/* List View */}
          {activeTab === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {treatments.map((treatment) => (
                <TreatmentCard
                  key={treatment.id}
                  treatment={treatment}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Charts View */}
          {activeTab === 'charts' && <ProgressCharts treatments={treatments} />}
        </>
      )}

      {/* Disclaimer */}
      <div className="mt-12 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-950">
          <strong>Note:</strong> This treatment tracker is for personal record-keeping only. Always
          consult with your dental professional for medical advice and treatment decisions. Data is
          stored locally in your browser.
        </p>
      </div>
    </div>
  );
}
