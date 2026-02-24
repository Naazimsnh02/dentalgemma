'use client';

import { useState, useCallback } from 'react';
import { Loader2, Save, ArrowLeft, X } from 'lucide-react';
import { XRayUploader } from '@/components/xray/xray-uploader';
import { XRayViewer } from '@/components/xray/xray-viewer';
import { AnalysisResults } from '@/components/xray/analysis-results';
import { SampleXRays } from '@/components/xray/sample-xrays';
import { modalClient } from '@/lib/api/modal-client';
import { useAppStore } from '@/store/app-store';
import type { AnalysisType, XRayAnalysis } from '@/types';

type AnalysisStep = 'upload' | 'analyzing' | 'results';

export default function XRayAnalysisPage() {
  const [step, setStep] = useState<AnalysisStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('xray');
  const [analysis, setAnalysis] = useState<XRayAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  const addToHistory = useAppStore((state) => state.addToHistory);
  const updateDashboardStats = useAppStore((state) => state.updateDashboardStats);
  const dashboardStats = useAppStore((state) => state.dashboardStats);

  const handleFileUpload = useCallback((file: File) => {
    setSelectedFile(file);
    setError(null);

    // Create object URL for preview
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  }, []);

  const handleSampleSelect = useCallback((sampleUrl: string, sampleType: AnalysisType) => {
    setImageUrl(sampleUrl);
    setAnalysisType(sampleType);
    setSelectedFile(null); // Clear file since we're using a URL
    setError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!imageUrl) {
      setError('Please upload or select a dental image');
      return;
    }

    setStep('analyzing');
    setError(null);
    setProgress(0);
    setProgressMessage('Preparing image...');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      // Update progress messages
      setTimeout(() => setProgressMessage('Uploading to cloud...'), 1000);
      setTimeout(() => setProgressMessage('Running AI analysis...'), 2000);
      setTimeout(() => setProgressMessage('Processing results...'), 4000);

      // Perform analysis
      const result = await modalClient.analyzeXray(
        selectedFile || imageUrl,
        analysisType
      );

      clearInterval(progressInterval);
      setProgress(100);
      setProgressMessage('Analysis complete!');

      // Wait a moment before showing results
      setTimeout(() => {
        setAnalysis(result);
        setStep('results');
      }, 500);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Analysis failed. Please try again or check your connection.'
      );
      setStep('upload');
    }
  }, [imageUrl, selectedFile, analysisType]);

  const handleReset = useCallback(() => {
    setStep('upload');
    setSelectedFile(null);
    setImageUrl(null);
    setAnalysis(null);
    setError(null);
    setProgress(0);
    setProgressMessage('');
  }, []);

  const handleSaveToHistory = useCallback(() => {
    if (!analysis) return;

    try {
      const historyItem = {
        id: crypto.randomUUID(),
        type: 'xray' as const,
        summary: `${analysis.type === 'photo' ? 'Clinical Photo' : 'X-Ray'} Analysis - ${analysis.urgency} priority`,
        urgency: analysis.urgency,
        data: analysis,
        timestamp: new Date(),
      };

      addToHistory(historyItem);

      // Update dashboard stats
      updateDashboardStats({
        totalAnalyses: dashboardStats.totalAnalyses + 1,
      });

      alert('Analysis saved to history!');
    } catch (err) {
      console.error('Failed to save to history:', err);
      alert('Failed to save to history');
    }
  }, [analysis, addToHistory, updateDashboardStats, dashboardStats]);

  const handleExportPDF = useCallback(async () => {
    if (!analysis || !imageUrl) return;

    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      // Header
      doc.setFontSize(22);
      doc.setTextColor(33, 150, 243); // Material Blue
      doc.text('DentalGemma Analysis Report', margin, y);
      y += 10;

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleString()}`, margin, y);
      y += 15;

      // Divider
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 15;

      // Clinical Analysis - Raw Text
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text('Clinical Analysis', margin, y);
      y += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(50);
      
      // Get raw text and strip markdown
      const rawText = analysis.rawAnalysis || analysis.findings.join(' ');
      const plainText = rawText
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        .trim();
      
      const lines = doc.splitTextToSize(plainText, pageWidth - (margin * 2));
      
      lines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 5;
      });

      // Disclaimer
      if (y > 250) {
        doc.addPage();
        y = 20;
      } else {
        y += 15;
      }
      doc.setFontSize(8);
      doc.setTextColor(150);
      const disclaimer = 'Disclaimer: DentalGemma is for educational and research purposes only. It is not intended for clinical diagnosis. AI-generated assessments must be validated by licensed dental professionals.';
      const discLines = doc.splitTextToSize(disclaimer, pageWidth - (margin * 2));
      doc.text(discLines, margin, y);

      doc.save(`dentalgemma-analysis-${Date.now()}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to generate PDF report');
    }
  }, [analysis, imageUrl]);

  const handleExportJSON = useCallback(() => {
    if (!analysis) return;

    // Create simplified export with just the raw analysis
    const exportData = {
      id: analysis.id,
      timestamp: analysis.timestamp,
      clinicalAnalysis: analysis.rawAnalysis || analysis.findings.join(' '),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dentalgemma-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [analysis]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Dental Image Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload dental images (clinical photos or radiographs) for AI-powered analysis
        </p>
      </div>

      {/* Main content */}
      {step === 'upload' && (
        <div className="space-y-8">
          {/* Upload section */}
          <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">
              {imageUrl ? 'Selected Image' : 'Upload Dental Image'}
            </h2>
            
            {imageUrl ? (
              <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900/40">
                <button
                  onClick={handleReset}
                  className="absolute top-4 right-4 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm z-10"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex justify-center items-center min-h-[200px] bg-gray-50 dark:bg-black/20 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                  <img 
                    src={imageUrl} 
                    alt="Selected dental" 
                    className="max-h-[400px] w-auto object-contain rounded-lg shadow-sm"
                  />
                </div>
              </div>
            ) : (
              <XRayUploader onUpload={handleFileUpload} onError={setError} />
            )}
          </div>

          {/* Analysis type selector */}
          {imageUrl && (
            <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">
                Select Analysis Type
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { value: 'photo', label: 'Clinical Photo Analysis', desc: 'Analyze clinical photographs of teeth and gums' },
                  { value: 'xray', label: 'X-Ray Analysis', desc: 'Analyze dental radiographs (OPG, bitewing, periapical)' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setAnalysisType(type.value as AnalysisType)}
                    className={`group relative p-5 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                      analysisType === type.value
                        ? 'border-blue-500 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 transition-all ${
                      analysisType === type.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {analysisType === type.value && (
                        <svg className="w-full h-full text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <h3 className={`font-semibold mb-1 pr-8 transition-colors ${
                      analysisType === type.value ? 'text-blue-600 dark:text-blue-400' : ''
                    }`}>
                      {type.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{type.desc}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleAnalyze}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md"
                >
                  Analyze Image
                </button>
              </div>
            </div>
          )}



          {/* Sample X-rays */}
          <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
            <SampleXRays onSelectSample={handleSampleSelect} />
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      )}

      {step === 'analyzing' && (
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-12">
          <div className="max-w-md mx-auto text-center space-y-6">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
            
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                Analyzing Image...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{progressMessage}</p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Initializing AI Engine... First launch can take 1-2 minutes to spin up the GPU environment. Subsequent requests will be near-instant.
            </p>
          </div>
        </div>
      )}

      {step === 'results' && analysis && imageUrl && (
        <div className="space-y-8">
          {/* Back button */}
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Analyze Another Image</span>
          </button>

          {/* Results layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Image viewer */}
            <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">
                Dental Image
              </h2>
              <XRayViewer
                imageUrl={imageUrl}
                annotations={analysis.visualData}
                alt="Analyzed dental image"
              />
            </div>

            {/* Right: Analysis results */}
            <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Analysis Results
                </h2>
                <button
                  onClick={handleSaveToHistory}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
              <p className="text-blue-700 text-sm mb-4">
                Initializing AI Engine... First launch can take 1-2 minutes to spin up the GPU environment.
                Subsequent requests will be near-instant.
              </p>
              <AnalysisResults
                analysis={analysis}
                onExportPDF={handleExportPDF}
                onExportJSON={handleExportJSON}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
