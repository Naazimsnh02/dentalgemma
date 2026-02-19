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
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

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
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Treatment Progress Tracker
        </h1>
        <p className="text-muted-foreground">
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-card text-card-foreground rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative border border-border">
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
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
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
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
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
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
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
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
        <Card className="border-dashed border-2 py-16 flex flex-col items-center justify-center text-center">
          <CardContent className="flex flex-col items-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <ClipboardList className="h-12 w-12 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No treatments yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md">
              Start tracking your dental treatments by adding your first treatment to see your progress timeline and analytics.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              Add Your First Treatment
            </button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Timeline View */}
          {activeTab === 'timeline' && (
            <Card className="shadow-md p-6">
              <TreatmentTimeline treatments={treatments} onTreatmentClick={handleEdit} />
            </Card>
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

    </div>
  );
}
