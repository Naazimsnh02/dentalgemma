/**
 * Simplified PDF Export Component for Clinical Assessment
 * 
 * Generates professional medical-formatted PDF reports using jsPDF
 * Includes the 5 simplified assessment sections with proper formatting
 * 
 * Requirements: 2.15
 */

import jsPDF from 'jspdf';
import type { CaseAssessment, ClinicalCase } from '@/types';

export interface PDFExportOptions {
  assessment: CaseAssessment;
  caseData?: ClinicalCase;
  includePatientInfo?: boolean;
}

export function generateAssessmentPDF(options: PDFExportOptions): void {
  const { assessment, caseData, includePatientInfo = true } = options;
  
  // Create new PDF document (A4 size)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, contentWidth);
    
    lines.forEach((line: string) => {
      checkPageBreak(5);
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    yPosition += 2;
  };

  // Helper function to add section header
  const addSectionHeader = (title: string) => {
    checkPageBreak(20);
    yPosition += 5;
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(margin, yPosition - 5, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 2, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 8;
  };

  // Helper function to add bullet list
  const addBulletList = (items: string[]) => {
    items.forEach((item) => {
      checkPageBreak(5);
      const lines = doc.splitTextToSize(`• ${item}`, contentWidth - 5);
      lines.forEach((line: string) => {
        doc.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
    });
    yPosition += 2;
  };

  // Helper function to add numbered list
  const addNumberedList = (items: string[]) => {
    items.forEach((item, index) => {
      checkPageBreak(5);
      const lines = doc.splitTextToSize(`${index + 1}. ${item}`, contentWidth - 5);
      lines.forEach((line: string) => {
        doc.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
    });
    yPosition += 2;
  };

  // ============================================================================
  // Document Header
  // ============================================================================
  
  doc.setFillColor(30, 58, 138); // Dark blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Clinical Assessment Report', margin, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 30);

  
  doc.setTextColor(0, 0, 0);
  yPosition = 50;

  // ============================================================================
  // Patient Information (if included)
  // ============================================================================
  
  if (includePatientInfo && caseData) {
    addSectionHeader('PATIENT INFORMATION');
    addText(`Age: ${caseData.patient.age} years`, 10, true);
    addText(`Gender: ${caseData.patient.gender.charAt(0).toUpperCase() + caseData.patient.gender.slice(1)}`, 10, true);
    if (caseData.patient.patientId) {
      addText(`Patient ID: ${caseData.patient.patientId}`, 10, true);
    }
    yPosition += 5;
  }

  // ============================================================================
  // Urgency Banner
  // ============================================================================
  
  checkPageBreak(25);
  const urgencyColors: Record<string, [number, number, number]> = {
    'emergency': [220, 38, 38],
    'urgent': [249, 115, 22],
    'routine': [59, 130, 246],
    'home-care': [34, 197, 94],
  };
  
  const urgencyLabels: Record<string, string> = {
    'emergency': 'EMERGENCY - IMMEDIATE CARE REQUIRED',
    'urgent': 'URGENT - SEE DENTIST WITHIN 24-48 HOURS',
    'routine': 'ROUTINE - SCHEDULE REGULAR APPOINTMENT',
    'home-care': 'HOME CARE - SELF CARE WITH MONITORING',
  };

  const urgencyColor = urgencyColors[assessment.urgency] || [107, 114, 128];
  doc.setFillColor(...urgencyColor);
  doc.rect(margin, yPosition, contentWidth, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(urgencyLabels[assessment.urgency] || `URGENCY: ${assessment.urgency.toUpperCase()}`, margin + 2, yPosition + 10);
  doc.setTextColor(0, 0, 0);
  yPosition += 20;

  // ============================================================================
  // Section 1: Patient Assessment
  // ============================================================================
  
  addSectionHeader('1. PATIENT ASSESSMENT');
  addText('Primary Diagnosis:', 11, true);
  addText(assessment.diagnosis.primary, 10);
  yPosition += 3;
  
  if (assessment.diagnosis.differential.length > 0) {
    addText('Differential Diagnoses:', 10, true);
    addBulletList(assessment.diagnosis.differential);
  }

  addText('Etiology / Root Cause:', 10, true);
  addText(assessment.etiology.rootCause, 10);

  // ============================================================================
  // Section 2: Management Plan
  // ============================================================================
  
  addSectionHeader('2. MANAGEMENT PLAN');
  addText('Recommended Treatment Protocol:', 11, true);
  addNumberedList(assessment.managementPlan.protocol);

  // ============================================================================
  // Section 3: Antibiotics
  // ============================================================================
  
  addSectionHeader('3. ANTIBIOTIC CONSIDERATIONS');
  addText(`Antibiotics Indicated: ${assessment.antibiotics?.indicated ? 'YES' : 'NO'}`, 11, true);
  addText('Reasoning:', 10, true);
  addText(assessment.antibiotics?.reason || 'No specific clinical indication for antibiotics at this time.', 10);

  // ============================================================================
  // Section 4: Follow-up
  // ============================================================================
  
  addSectionHeader('4. FOLLOW-UP SCHEDULE');
  addText('Timing:', 11, true);
  addText(assessment.followUp.timing, 10);
  yPosition += 3;
  
  if (assessment.followUp.monitoring.length > 0) {
    addText('Monitoring Parameters:', 10, true);
    addBulletList(assessment.followUp.monitoring);
  }

  // ============================================================================
  // Section 5: Patient Counseling
  // ============================================================================
  
  addSectionHeader('5. PATIENT COUNSELING');
  addText('Patient-Friendly Explanation:', 11, true);
  addText(assessment.patientCounseling.explanation, 10);

  // ============================================================================
  // Footer - Medical Disclaimer
  // ============================================================================
  
  checkPageBreak(35);
  yPosition += 10;
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, yPosition, contentWidth, 25, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('MEDICAL DISCLAIMER', margin + 2, yPosition + 5);
  
  doc.setFont('helvetica', 'normal');
  const disclaimer = 'This assessment is generated by AI and is for educational purposes only. It should not replace professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical decisions.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth - 4);
  let disclaimerY = yPosition + 10;
  disclaimerLines.forEach((line: string) => {
    doc.text(line, margin + 2, disclaimerY);
    disclaimerY += 4;
  });

  // ============================================================================
  // Save PDF
  // ============================================================================
  
  const filename = `dental-assessment-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

// Export button component
export function PDFExportButton({ 
  assessment, 
  caseData, 
  className = '' 
}: { 
  assessment: CaseAssessment; 
  caseData?: ClinicalCase; 
  className?: string;
}) {
  const handleExport = () => {
    generateAssessmentPDF({ assessment, caseData, includePatientInfo: true });
  };

  return (
    <button
      onClick={handleExport}
      className={className || 'px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'}
    >
      Export PDF
    </button>
  );
}
