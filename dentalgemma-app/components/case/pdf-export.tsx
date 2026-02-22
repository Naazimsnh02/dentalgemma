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
  const addText = (text: string, fontSize: number = 10, isBold: boolean = false, indent: number = 0) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    // Split text to fit width
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    
    // Check if entire block fits, if not, check per line
    if (yPosition + (lines.length * fontSize * 0.5) > pageHeight - margin) {
       // If block is too big, just add page immediately to avoid orphaned lines if possible
       if (lines.length > 20) { 
          // large block, let it flow naturally
       } else {
          checkPageBreak(lines.length * fontSize * 0.5);
       }
    }

    lines.forEach((line: string) => {
      checkPageBreak(fontSize * 0.5); // Check for each line
      doc.text(line, margin + indent, yPosition);
      yPosition += (fontSize * 0.5); // Increment y by roughly half font size (mm approx)
    });
    yPosition += 3; // Add small spacing after block
  };

  // Helper function to add section header with background
  const addSectionHeader = (title: string) => {
    checkPageBreak(15);
    yPosition += 2;
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(margin, yPosition, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 2, yPosition + 5.5);
    doc.setTextColor(0, 0, 0);
    yPosition += 12; // Move past header
  };

  // Helper function to add bullet list
  const addBulletList = (items: string[]) => {
    items.forEach((item) => {
      // Pre-calculate height of item
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(`• ${item}`, contentWidth - 5);
      const height = lines.length * 5;
      
      checkPageBreak(height);
      
      lines.forEach((line: string) => {
         doc.text(line, margin + 5, yPosition);
         yPosition += 5;
      });
      yPosition += 1;
    });
    yPosition += 2;
  };

  // Helper function to add numbered list
  const addNumberedList = (items: string[]) => {
    items.forEach((item, index) => {
      doc.setFontSize(10);
      const prefix = `${index + 1}. `;
      const lines = doc.splitTextToSize(`${prefix}${item}`, contentWidth - 5);
      const height = lines.length * 5;

      checkPageBreak(height);

      lines.forEach((line: string) => {
        doc.text(line, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 1;
    });
    yPosition += 2;
  };

  // ============================================================================
  // Document Header
  // ============================================================================
  
  doc.setFillColor(30, 58, 138); // Dark blue header
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Clinical Assessment Report', margin, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 32);

  doc.setTextColor(0, 0, 0);
  yPosition = 50;

  // ============================================================================
  // Patient Information (if included)
  // ============================================================================
  
  if (includePatientInfo && caseData) {
    // We create a simpler compact block for patient info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Data', margin, yPosition);
    yPosition += 6;

    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    addText(`Age: ${caseData.patient.age}`, 10, false);
    yPosition -= 3; // tighter spacing
    addText(`Gender: ${caseData.patient.gender.charAt(0).toUpperCase() + caseData.patient.gender.slice(1)}`, 10, false);
    if (caseData.patient.occupation) {
        yPosition -= 3;
        addText(`Occupation: ${caseData.patient.occupation}`, 10, false);
    }
    yPosition += 5;
  }

  // ============================================================================
  // Urgency Banner
  // ============================================================================
  
  checkPageBreak(25);
  const urgencyColors: Record<string, [number, number, number]> = {
    'emergency': [220, 38, 38],   // Red
    'urgent': [234, 88, 12],      // Orange
    'routine': [37, 99, 235],     // Blue
    'home-care': [22, 163, 74],   // Green
  };
  
  const urgencyLabels: Record<string, string> = {
    'emergency': 'EMERGENCY - IMMEDIATE CARE REQUIRED',
    'urgent': 'URGENT - SEE DENTIST WITHIN 24-48 HOURS',
    'routine': 'ROUTINE - SCHEDULE REGULAR APPOINTMENT',
    'home-care': 'HOME CARE - SELF CARE WITH MONITORING',
  };

  const urgencyColor = urgencyColors[assessment.urgency] || [107, 114, 128];
  
  doc.setFillColor(...urgencyColor);
  doc.rect(margin, yPosition, contentWidth, 14, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  
  // Center text in banner
  const bannerText = urgencyLabels[assessment.urgency] || `URGENCY: ${assessment.urgency.toUpperCase()}`;
  doc.text(bannerText, margin + 4, yPosition + 9);
  
  doc.setTextColor(0, 0, 0);
  yPosition += 22;

  // ============================================================================
  // 1. Patient Assessment
  // ============================================================================
  
  addSectionHeader('1. PATIENT ASSESSMENT');
  
  if (assessment.diagnosis.primary) {
      addText('Primary Diagnosis:', 10, true);
      addText(assessment.diagnosis.primary, 10, false, 5); 
  }
  
  if (assessment.diagnosis.differential && assessment.diagnosis.differential.length > 0) {
    addText('Differential Diagnoses:', 10, true);
    addBulletList(assessment.diagnosis.differential);
  }

  if (assessment.etiology.rootCause) {
      addText('Etiology / Root Cause:', 10, true);
      addText(assessment.etiology.rootCause, 10, false, 5);
  }

  // ============================================================================
  // 2. Management Plan
  // ============================================================================
  
  addSectionHeader('2. MANAGEMENT PLAN');
  
  if (assessment.managementPlan.protocol && assessment.managementPlan.protocol.length > 0) {
      addText('Recommended Treatment Protocol:', 10, true);
      addNumberedList(assessment.managementPlan.protocol);
  }

  // ============================================================================
  // 3. Antibiotic Considerations
  // ============================================================================
  
  addSectionHeader('3. ANTIBIOTICS');
  
  addText(`Indicated: ${assessment.antibiotics?.indicated ? 'YES' : 'NO'}`, 10, true);
  if (assessment.antibiotics?.reason) {
      addText('Reasoning:', 10, true);
      addText(assessment.antibiotics.reason, 10, false, 5);
  }

  // ============================================================================
  // 4. Follow-up
  // ============================================================================
  
  addSectionHeader('4. FOLLOW-UP SCHEDULE');
  
  if (assessment.followUp.timing) {
      addText('Timing:', 10, true);
      addText(assessment.followUp.timing, 10, false, 5);
  }
  
  if (assessment.followUp.monitoring && assessment.followUp.monitoring.length > 0) {
    addText('Monitoring Parameters:', 10, true);
    addBulletList(assessment.followUp.monitoring);
  }

  // ============================================================================
  // 5. Patient Counseling
  // ============================================================================
  
  addSectionHeader('5. PATIENT COUNSELING');
  
  if (assessment.patientCounseling.explanation) {
      addText('Explanation for Patient:', 10, true);
      addText(assessment.patientCounseling.explanation, 10, false, 5);
  }

  // ============================================================================
  // Footer - Medical Disclaimer
  // ============================================================================
  if (yPosition + 30 > pageHeight - margin) {
     doc.addPage();
     yPosition = margin;
  } else {
     yPosition += 10;
  }
  
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'italic');
  
  const disclaimer = 'Note: This assessment is generated by AI (DentalGemma) and is intended for educational and clinical support purposes only. It is NOT a substitute for professional diagnosis or treatment. All clinical decisions remain the responsibility of the attending provider.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
  
  disclaimerLines.forEach((line: string) => {
    doc.text(line, margin, yPosition);
    yPosition += 4;
  });

  // Save PDF
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
