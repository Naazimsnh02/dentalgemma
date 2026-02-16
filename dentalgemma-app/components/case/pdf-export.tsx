/**
 * PDF Export Component for Clinical Assessment
 * 
 * Generates professional medical-formatted PDF reports using jsPDF
 * Includes all 8 assessment sections with proper formatting
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
      checkPageBreak();
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    yPosition += 2;
  };

  // Helper function to add section header
  const addSectionHeader = (title: string) => {
    checkPageBreak(15);
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
      checkPageBreak();
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
      checkPageBreak();
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
  doc.text(`Processing Time: ${assessment.processingTime.toFixed(2)}s`, margin, 35);
  
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
  
  checkPageBreak(20);
  const urgencyColors: Record<string, [number, number, number]> = {
    'emergency': [220, 38, 38],
    'urgent': [249, 115, 22],
    'routine': [59, 130, 246],
    'home-care': [34, 197, 94],
  };
  
  const urgencyColor = urgencyColors[assessment.urgency] || [107, 114, 128];
  doc.setFillColor(...urgencyColor);
  doc.rect(margin, yPosition, contentWidth, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`URGENCY: ${assessment.urgency.toUpperCase()}`, margin + 2, yPosition + 10);
  doc.setTextColor(0, 0, 0);
  yPosition += 20;

  // ============================================================================
  // Section 1: Diagnosis
  // ============================================================================
  
  addSectionHeader('1. DIAGNOSIS');
  addText('Primary Diagnosis:', 11, true);
  addText(assessment.diagnosis.primary, 10);
  addText(`ICD-10 Code: ${assessment.diagnosis.icd10}`, 10);
  addText(`Confidence: ${(assessment.diagnosis.confidence * 100).toFixed(1)}%`, 10);
  yPosition += 3;
  
  if (assessment.diagnosis.differential.length > 0) {
    addText('Differential Diagnoses:', 11, true);
    addBulletList(assessment.diagnosis.differential);
  }

  // ============================================================================
  // Section 2: Etiology
  // ============================================================================
  
  addSectionHeader('2. ETIOLOGY');
  addText('Root Cause:', 11, true);
  addText(assessment.etiology.rootCause, 10);
  yPosition += 3;
  
  if (assessment.etiology.contributingFactors.length > 0) {
    addText('Contributing Factors:', 11, true);
    addBulletList(assessment.etiology.contributingFactors);
  }
  
  if (assessment.etiology.riskFactors.length > 0) {
    addText('Risk Factors:', 11, true);
    addBulletList(assessment.etiology.riskFactors);
  }

  // ============================================================================
  // Section 3: Management Plan
  // ============================================================================
  
  addSectionHeader('3. MANAGEMENT PLAN');
  
  if (assessment.managementPlan.immediate.length > 0) {
    addText('Immediate Actions:', 11, true);
    addNumberedList(assessment.managementPlan.immediate);
  }
  
  if (assessment.managementPlan.protocol.length > 0) {
    addText('Treatment Protocol:', 11, true);
    addNumberedList(assessment.managementPlan.protocol);
  }
  
  if (assessment.managementPlan.alternatives.length > 0) {
    addText('Alternative Treatments:', 11, true);
    addBulletList(assessment.managementPlan.alternatives);
  }
  
  addText('Expected Outcomes:', 11, true);
  addText(assessment.managementPlan.expectedOutcomes, 10);
  yPosition += 3;
  
  addText('Duration:', 11, true);
  addText(assessment.managementPlan.duration, 10);

  // ============================================================================
  // Section 4: Antibiotics (if applicable)
  // ============================================================================
  
  if (assessment.antibiotics) {
    addSectionHeader('4. ANTIBIOTIC RECOMMENDATIONS');
    
    addText('Indication:', 11, true);
    addText(assessment.antibiotics.indication, 10);
    yPosition += 3;
    
    addText(`Drug: ${assessment.antibiotics.drug}`, 10, true);
    addText(`Dosage: ${assessment.antibiotics.dosage}`, 10, true);
    addText(`Duration: ${assessment.antibiotics.duration}`, 10, true);
    yPosition += 3;
    
    if (assessment.antibiotics.alternatives.length > 0) {
      addText('Alternative Antibiotics:', 11, true);
      addBulletList(assessment.antibiotics.alternatives);
    }
    
    addText('Rationale:', 11, true);
    addText(assessment.antibiotics.rationale, 10);
  }

  // ============================================================================
  // Section 5: Follow-up
  // ============================================================================
  
  addSectionHeader('5. FOLLOW-UP SCHEDULE');
  
  addText('Initial Follow-up:', 11, true);
  addText(assessment.followUp.initialTiming, 10);
  yPosition += 3;
  
  if (assessment.followUp.monitoring.length > 0) {
    addText('Monitoring Parameters:', 11, true);
    addBulletList(assessment.followUp.monitoring);
  }
  
  addText('Long-term Care:', 11, true);
  addText(assessment.followUp.longTerm, 10);
  yPosition += 3;
  
  if (assessment.followUp.redFlags.length > 0) {
    addText('RED FLAGS - Seek Immediate Care If:', 11, true);
    addBulletList(assessment.followUp.redFlags);
  }

  // ============================================================================
  // Section 6: Patient Counseling
  // ============================================================================
  
  addSectionHeader('6. PATIENT COUNSELING');
  
  addText('Explanation for Patient:', 11, true);
  addText(assessment.patientCounseling.explanation, 10);
  yPosition += 3;
  
  if (assessment.patientCounseling.homeCare.length > 0) {
    addText('Home Care Instructions:', 11, true);
    addBulletList(assessment.patientCounseling.homeCare);
  }
  
  if (assessment.patientCounseling.dietary.length > 0) {
    addText('Dietary Recommendations:', 11, true);
    addBulletList(assessment.patientCounseling.dietary);
  }
  
  addText('Pain Management:', 11, true);
  addText(assessment.patientCounseling.painManagement, 10);
  yPosition += 3;
  
  if (assessment.patientCounseling.emergencyTriggers.length > 0) {
    addText('Emergency Triggers:', 11, true);
    addBulletList(assessment.patientCounseling.emergencyTriggers);
  }

  // ============================================================================
  // Section 7: Clinical Guidelines
  // ============================================================================
  
  addSectionHeader('7. CLINICAL GUIDELINES & EVIDENCE');
  
  addText(`Evidence Level: ${assessment.guidelines.evidenceLevel}`, 11, true);
  yPosition += 3;
  
  if (assessment.guidelines.relevant.length > 0) {
    addText('Relevant Guidelines:', 11, true);
    addBulletList(assessment.guidelines.relevant);
  }
  
  if (assessment.guidelines.references.length > 0) {
    addText('References:', 11, true);
    assessment.guidelines.references.forEach((ref, index) => {
      checkPageBreak();
      const lines = doc.splitTextToSize(`${index + 1}. ${ref}`, contentWidth - 5);
      lines.forEach((line: string) => {
        doc.text(line, margin + 5, yPosition);
        yPosition += 4;
      });
    });
  }

  // ============================================================================
  // Footer - Medical Disclaimer
  // ============================================================================
  
  checkPageBreak(30);
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
  
  const filename = `clinical-assessment-${new Date().toISOString().split('T')[0]}.pdf`;
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
