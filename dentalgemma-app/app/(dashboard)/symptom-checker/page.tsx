'use client';

import { useState } from 'react';
import { Loader2, Stethoscope } from 'lucide-react';
import { Questionnaire } from '@/components/symptom-checker/questionnaire';
import { ResultsDisplay } from '@/components/symptom-checker/results-display';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/store/app-store';
import { diagnoseSymptoms } from '@/lib/symptom-checker/diagnosis';
import type { SymptomData, SimpleSymptomResult, AnalysisHistoryItem } from '@/types';
import jsPDF from 'jspdf';

type PageState = 'intro' | 'questionnaire' | 'analyzing' | 'results';

export default function SymptomCheckerPage() {
  const [pageState, setPageState] = useState<PageState>('intro');
  const [symptomData, setSymptomData] = useState<SymptomData | null>(null);
  const [result, setResult] = useState<SimpleSymptomResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addToHistory = useAppStore((state) => state.addToHistory);
  const updateDashboardStats = useAppStore((state) => state.updateDashboardStats);
  const dashboardStats = useAppStore((state) => state.dashboardStats);

  const handleQuestionnaireComplete = async (data: SymptomData) => {
    setSymptomData(data);
    setPageState('analyzing');
    setError(null);

    try {
      const diagnosis = await diagnoseSymptoms(data);
      setResult(diagnosis);
      setPageState('results');
    } catch (err) {
      console.error('Error diagnosing symptoms:', err);
      setError('Failed to analyze symptoms. Please try again.');
      setPageState('questionnaire');
    }
  };

  const handleSaveToHistory = () => {
    if (!result || !symptomData) return;

    const historyItem: AnalysisHistoryItem = {
      id: `symptom-${Date.now()}`,
      type: 'symptom',
      summary: `Symptom check - ${result.urgency.charAt(0).toUpperCase() + result.urgency.slice(1)} Urgency`,
      urgency: result.urgency,
      data: {
        symptomData,
        result,
      },
      timestamp: new Date(),
    };

    addToHistory(historyItem);
    
    // Update dashboard stats
    updateDashboardStats({
      totalAnalyses: dashboardStats.totalAnalyses + 1,
    });
  };

  const handleExportPDF = () => {
    if (!result || !symptomData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Dental Symptom Assessment', margin, yPos);
    yPos += 10;

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPos);
    yPos += 15;

    // Disclaimer
    doc.setFontSize(9);
    doc.setTextColor(200, 0, 0);
    const disclaimerText =
      'DISCLAIMER: This assessment is for informational purposes only and is not a substitute for professional medical advice.';
    const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 2 * margin);
    doc.text(disclaimerLines, margin, yPos);
    yPos += disclaimerLines.length * 5 + 10;
    doc.setTextColor(0, 0, 0);

    // Symptoms
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Reported Symptoms', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Location: ${symptomData.location}`, margin, yPos);
    yPos += 6;
    doc.text(`Pain Type: ${symptomData.painType}`, margin, yPos);
    yPos += 6;
    doc.text(`Duration: ${symptomData.duration}`, margin, yPos);
    yPos += 6;
    doc.text(`Triggers: ${symptomData.triggers.join(', ') || 'None'}`, margin, yPos);
    yPos += 6;
    doc.text(
      `Associated Symptoms: ${symptomData.associatedSymptoms.join(', ') || 'None'}`,
      margin,
      yPos
    );
    yPos += 12;

    // Urgency
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Preliminary Assessment', margin, yPos);
    yPos += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Urgency Level: ${result.urgency.toUpperCase()}`, margin, yPos);
    yPos += 12;

    // Clinical Report
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Clinical Report', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Clean markdown characters for basic PDF text rendering
    const cleanText = result.markdownReport
      .replace(/\*\*/g, '')
      .replace(/#/g, '')
      .trim();

    const reportLines = doc.splitTextToSize(cleanText, pageWidth - 2 * margin);
    
    // Simple pagination for the report
    for (let i = 0; i < reportLines.length; i++) {
        if (yPos > 280) {
            doc.addPage();
            yPos = 20;
        }
        doc.text(reportLines[i], margin, yPos);
        yPos += 5;
    }
    
    yPos += 10;

    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const disclaimerNote = 'Note: This is a preliminary assessment based on self-reported symptoms only, without clinical examination or diagnostic imaging. Professional evaluation is essential for accurate diagnosis.';
    const disclaimerNoteLines = doc.splitTextToSize(disclaimerNote, pageWidth - 2 * margin);
    doc.text(disclaimerNoteLines, margin, yPos);
    doc.setTextColor(0, 0, 0);

    // Save PDF
    doc.save(`symptom-assessment-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleStartOver = () => {
    setSymptomData(null);
    setResult(null);
    setError(null);
    setPageState('intro');
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Stethoscope className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Dental Symptom Checker</h1>
        </div>
        <p className="text-muted-foreground">
          Answer a few questions about your symptoms to receive guidance on next steps
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <p className="text-red-900 dark:text-red-100">{error}</p>
          </CardContent>
        </Card>
      )}

      {pageState === 'intro' && (
        <Card>
          <CardHeader>
            <CardTitle>Welcome to the Symptom Checker</CardTitle>
            <CardDescription>
              This tool will help you understand your dental symptoms and determine the appropriate level of care
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <p>
                <strong>How it works:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Answer 6 simple questions about your symptoms</li>
                <li>Receive an assessment of possible conditions</li>
                <li>Get urgency classification and action guidance</li>
                <li>Learn home care recommendations and warning signs</li>
              </ul>
              <p className="text-muted-foreground pt-2">
                This assessment takes approximately 3-5 minutes to complete.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setPageState('questionnaire')}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-md font-medium transition-colors"
              >
                Start Assessment
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {pageState === 'questionnaire' && (
        <Questionnaire
          onComplete={handleQuestionnaireComplete}
          onCancel={handleStartOver}
        />
      )}

      {pageState === 'analyzing' && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-lg font-medium">Analyzing Your Symptoms</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This may take a few moments...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {pageState === 'results' && result && (
        <ResultsDisplay
          result={result}
          onSave={handleSaveToHistory}
          onExport={handleExportPDF}
          onStartOver={handleStartOver}
        />
      )}
    </div>
  );
}
