/**
 * Agentic Workflow Tools
 * 
 * Defines tools for the multi-agent diagnostic workflow using Zod schemas
 * Requirements: 4.2-4.6
 */

import { z } from 'zod';
import { modalClient } from '@/lib/api/modal-client';
import type { AnalysisType, ClinicalCase, DentistInfo, ResearchPaper } from '@/types';

// ============================================================================
// Tool Schemas
// ============================================================================

/**
 * Schema for X-ray analysis tool
 */
export const analyzeXraySchema = z.object({
  image: z.string().describe('Base64 encoded X-ray image'),
  analysisType: z.enum(['cavity', 'opg', 'tooth-id', 'general']).describe('Type of analysis to perform'),
});

export type AnalyzeXrayInput = z.infer<typeof analyzeXraySchema>;

/**
 * Schema for clinical case assessment tool
 */
export const assessCaseSchema = z.object({
  patientAge: z.number().min(0).max(150).describe('Patient age in years'),
  patientGender: z.enum(['male', 'female', 'other']).describe('Patient gender'),
  chiefComplaint: z.string().describe('Primary complaint or reason for visit'),
  duration: z.string().describe('Duration of symptoms'),
  painLevel: z.number().min(1).max(10).describe('Pain level from 1-10'),
  clinicalFindings: z.string().describe('Clinical examination findings'),
  radiographicFindings: z.string().optional().describe('Radiographic findings if available'),
  medicalHistory: z.string().optional().describe('Relevant medical history'),
});

export type AssessCaseInput = z.infer<typeof assessCaseSchema>;

/**
 * Schema for research search tool
 */
export const searchResearchSchema = z.object({
  query: z.string().describe('Search query for dental research'),
  maxResults: z.number().min(1).max(50).default(10).describe('Maximum number of results to return'),
  dateRange: z.enum(['last-6-months', '1-year', '5-years', 'all']).optional().describe('Date range filter'),
});

export type SearchResearchInput = z.infer<typeof searchResearchSchema>;

/**
 * Schema for specialist finder tool
 */
export const findSpecialistSchema = z.object({
  location: z.string().describe('Location (address, city, or coordinates)'),
  specialty: z.string().optional().describe('Dental specialty (e.g., Orthodontics, Endodontics)'),
  radius: z.number().min(1).max(50).default(10).describe('Search radius in miles'),
  rating: z.number().min(0).max(5).optional().describe('Minimum rating filter'),
});

export type FindSpecialistInput = z.infer<typeof findSpecialistSchema>;

/**
 * Schema for report generation tool
 */
export const generateReportSchema = z.object({
  xrayAnalysis: z.any().optional().describe('X-ray analysis results'),
  caseAssessment: z.any().optional().describe('Clinical case assessment results'),
  researchPapers: z.array(z.any()).optional().describe('Relevant research papers'),
  specialists: z.array(z.any()).optional().describe('Recommended specialists'),
  additionalNotes: z.string().optional().describe('Additional notes or observations'),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;

/**
 * Schema for clinical guidelines check tool
 */
export const checkGuidelinesSchema = z.object({
  condition: z.string().describe('Dental condition or diagnosis'),
  treatmentType: z.string().optional().describe('Type of treatment being considered'),
});

export type CheckGuidelinesInput = z.infer<typeof checkGuidelinesSchema>;

// ============================================================================
// Tool Implementations
// ============================================================================

/**
 * Analyze X-ray image using DentalGemma model
 */
export async function analyzeXray(input: AnalyzeXrayInput) {
  try {
    const analysis = await modalClient.analyzeXray(input.image, input.analysisType as AnalysisType);
    
    return {
      success: true,
      analysis,
      summary: `Analyzed ${input.analysisType} X-ray. Found ${analysis.findings.length} findings with ${Math.round(analysis.confidence * 100)}% confidence. Urgency: ${analysis.urgency}.`,
    };
  } catch (error) {
    return {
      success: false,
      error: `X-ray analysis failed: ${(error as Error).message}`,
    };
  }
}

/**
 * Assess clinical case using DentalGemma model
 */
export async function assessCase(input: AssessCaseInput) {
  try {
    // Convert input to ClinicalCase format
    const caseData: ClinicalCase = {
      id: crypto.randomUUID(),
      patient: {
        age: input.patientAge,
        gender: input.patientGender,
      },
      chiefComplaint: {
        description: input.chiefComplaint,
        duration: input.duration,
        painLevel: input.painLevel,
        triggers: [],
      },
      clinicalFindings: {
        intraoral: input.clinicalFindings,
        extraoral: '',
        softTissue: '',
        periodontal: '',
      },
      radiographicFindings: {
        description: input.radiographicFindings || '',
        boneLoss: '',
        periapicalStatus: '',
      },
      medicalHistory: {
        medications: [],
        allergies: [],
        systemicConditions: input.medicalHistory ? [input.medicalHistory] : [],
        previousTreatments: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const assessment = await modalClient.assessCase(caseData);
    
    return {
      success: true,
      assessment,
      summary: `Clinical assessment complete. Diagnosis: ${assessment.diagnosis.primary}. Urgency: ${assessment.urgency}.`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Case assessment failed: ${(error as Error).message}`,
    };
  }
}

/**
 * Search dental research on PubMed
 */
export async function searchResearch(input: SearchResearchInput): Promise<{
  success: boolean;
  papers?: ResearchPaper[];
  summary?: string;
  error?: string;
}> {
  try {
    // Call the research API endpoint
    const response = await fetch('/api/research/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: input.query,
        options: {
          maxResults: input.maxResults,
          dateRange: input.dateRange,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Research search failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Research search failed');
    }

    return {
      success: true,
      papers: data.papers,
      summary: `Found ${data.papers.length} research papers on "${input.query}".`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Research search failed: ${(error as Error).message}`,
    };
  }
}

/**
 * Find nearby dental specialists
 */
export async function findSpecialist(input: FindSpecialistInput): Promise<{
  success: boolean;
  specialists?: DentistInfo[];
  summary?: string;
  error?: string;
}> {
  try {
    // Call the dentist finder API endpoint
    const response = await fetch('/api/dentists/nearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: input.location,
        radius: input.radius,
        specialty: input.specialty,
        rating: input.rating,
      }),
    });

    if (!response.ok) {
      throw new Error(`Specialist search failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Specialist search failed');
    }

    return {
      success: true,
      specialists: data.results,
      summary: `Found ${data.results.length} dental specialists near ${input.location}${input.specialty ? ` specializing in ${input.specialty}` : ''}.`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Specialist search failed: ${(error as Error).message}`,
    };
  }
}

/**
 * Generate comprehensive diagnostic report
 */
export async function generateReport(input: GenerateReportInput) {
  try {
    let report = '# Comprehensive Dental Diagnostic Report\n\n';
    report += `Generated: ${new Date().toLocaleString()}\n\n`;

    // Add X-ray analysis section
    if (input.xrayAnalysis) {
      report += '## X-Ray Analysis\n\n';
      report += `**Type:** ${input.xrayAnalysis.type}\n`;
      report += `**Confidence:** ${Math.round(input.xrayAnalysis.confidence * 100)}%\n`;
      report += `**Urgency:** ${input.xrayAnalysis.urgency}\n\n`;
      report += '**Findings:**\n';
      input.xrayAnalysis.findings.forEach((finding: string) => {
        report += `- ${finding}\n`;
      });
      report += '\n**Recommendations:**\n';
      input.xrayAnalysis.recommendations.forEach((rec: string) => {
        report += `- ${rec}\n`;
      });
      report += '\n';
    }

    // Add clinical assessment section
    if (input.caseAssessment) {
      report += '## Clinical Assessment\n\n';
      report += `**Primary Diagnosis:** ${input.caseAssessment.diagnosis.primary}\n`;
      report += `**Urgency:** ${input.caseAssessment.urgency}\n\n`;
      
      if (input.caseAssessment.diagnosis.differential.length > 0) {
        report += '**Differential Diagnoses:**\n';
        input.caseAssessment.diagnosis.differential.forEach((diff: string) => {
          report += `- ${diff}\n`;
        });
        report += '\n';
      }

      report += '**Management Plan:**\n';
      input.caseAssessment.managementPlan.protocol.forEach((step: string) => {
        report += `- ${step}\n`;
      });
      report += '\n';
    }

    // Add research section
    if (input.researchPapers && input.researchPapers.length > 0) {
      report += '## Supporting Research\n\n';
      input.researchPapers.slice(0, 5).forEach((paper: any) => {
        report += `**${paper.title}**\n`;
        report += `Authors: ${paper.authors.join(', ')}\n`;
        report += `Journal: ${paper.journal} (${paper.date})\n`;
        report += `URL: ${paper.url}\n\n`;
      });
    }

    // Add specialist referrals section
    if (input.specialists && input.specialists.length > 0) {
      report += '## Recommended Specialists\n\n';
      input.specialists.slice(0, 3).forEach((specialist: any) => {
        report += `**${specialist.name}**\n`;
        report += `Specialty: ${specialist.specialty}\n`;
        report += `Rating: ${specialist.rating} stars\n`;
        report += `Phone: ${specialist.phone}\n`;
        report += `Address: ${specialist.address}\n\n`;
      });
    }

    // Add additional notes
    if (input.additionalNotes) {
      report += '## Additional Notes\n\n';
      report += input.additionalNotes + '\n\n';
    }

    // Add disclaimer
    report += '---\n\n';
    report += '**Medical Disclaimer:** This report is generated by AI for educational purposes only. ';
    report += 'It should not be used as a substitute for professional medical advice, diagnosis, or treatment. ';
    report += 'Always seek the advice of a qualified healthcare provider with any questions regarding a medical condition.\n';

    return {
      success: true,
      report,
      summary: 'Comprehensive diagnostic report generated successfully.',
    };
  } catch (error) {
    return {
      success: false,
      error: `Report generation failed: ${(error as Error).message}`,
    };
  }
}

/**
 * Check clinical guidelines for a condition
 */
export async function checkGuidelines(input: CheckGuidelinesInput) {
  try {
    // This would typically query a guidelines database
    // For now, we'll provide general guidance based on common conditions
    
    const guidelines: Record<string, any> = {
      'dental caries': {
        relevant: [
          'ADA Guidelines for Caries Management',
          'WHO Guidelines for Dental Caries Prevention',
        ],
        evidenceLevel: 'A',
        recommendations: [
          'Fluoride varnish application',
          'Dietary counseling',
          'Restorative treatment as needed',
        ],
      },
      'periodontal disease': {
        relevant: [
          'AAP Guidelines for Periodontal Therapy',
          'EFP Clinical Practice Guidelines',
        ],
        evidenceLevel: 'A',
        recommendations: [
          'Scaling and root planing',
          'Oral hygiene instruction',
          'Periodontal maintenance',
        ],
      },
      'endodontic infection': {
        relevant: [
          'AAE Guidelines for Endodontic Treatment',
          'ESE Position Statement on Root Canal Treatment',
        ],
        evidenceLevel: 'A',
        recommendations: [
          'Root canal therapy',
          'Antibiotic therapy if indicated',
          'Follow-up radiographic evaluation',
        ],
      },
    };

    const conditionKey = input.condition.toLowerCase();
    let matchedGuideline = null;

    // Find matching guideline
    for (const [key, value] of Object.entries(guidelines)) {
      if (conditionKey.includes(key) || key.includes(conditionKey)) {
        matchedGuideline = value;
        break;
      }
    }

    if (matchedGuideline) {
      return {
        success: true,
        guidelines: matchedGuideline,
        summary: `Found ${matchedGuideline.relevant.length} relevant clinical guidelines for ${input.condition} (Evidence Level: ${matchedGuideline.evidenceLevel}).`,
      };
    }

    // Default response if no specific guideline found
    return {
      success: true,
      guidelines: {
        relevant: ['General Dental Practice Guidelines'],
        evidenceLevel: 'C',
        recommendations: [
          'Comprehensive clinical examination',
          'Appropriate diagnostic imaging',
          'Evidence-based treatment planning',
          'Patient education and informed consent',
        ],
      },
      summary: `General clinical guidelines provided for ${input.condition}. Consult specialty-specific guidelines for detailed protocols.`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Guidelines check failed: ${(error as Error).message}`,
    };
  }
}

// ============================================================================
// Tool Exports
// ============================================================================

export const tools = {
  analyzeXray: {
    schema: analyzeXraySchema,
    execute: analyzeXray,
    description: 'Analyze dental X-ray images for cavities, pathologies, and tooth structures',
  },
  assessCase: {
    schema: assessCaseSchema,
    execute: assessCase,
    description: 'Assess clinical cases and provide comprehensive diagnostic recommendations',
  },
  searchResearch: {
    schema: searchResearchSchema,
    execute: searchResearch,
    description: 'Search PubMed for relevant dental research and evidence-based literature',
  },
  findSpecialist: {
    schema: findSpecialistSchema,
    execute: findSpecialist,
    description: 'Find nearby dental specialists based on location and specialty',
  },
  generateReport: {
    schema: generateReportSchema,
    execute: generateReport,
    description: 'Generate comprehensive diagnostic report combining all analysis results',
  },
  checkGuidelines: {
    schema: checkGuidelinesSchema,
    execute: checkGuidelines,
    description: 'Check clinical guidelines and evidence-based protocols for dental conditions',
  },
};
