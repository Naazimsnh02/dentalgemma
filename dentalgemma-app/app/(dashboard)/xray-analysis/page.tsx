'use client';

import { useState, useCallback } from 'react';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { XRayUploader } from '@/components/xray/xray-uploader';
import { XRayViewer } from '@/components/xray/xray-viewer';
import { AnalysisResults } from '@/components/xray/analysis-results';
import { SampleXRays } from '@/components/xray/sample-xrays';
import { modalClient } from '@/lib/api/modal-client';
import type { AnalysisType, XRayAnalysis } from '@/types';

type AnalysisStep = 'upload' | 'analyzing' | 'results';

export default function XRayAnalysisPage() {
  const [step, setStep] = useState<AnalysisStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('general');
  const [analysis, setAnalysis] = useState<XRayAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

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

    // Save to localStorage history
    try {
      const historyItem = {
        id: crypto.randomUUID(),
        type: 'xray' as const,
        summary: `${analysis.type.toUpperCase()} Analysis - ${analysis.urgency} priority`,
        urgency: analysis.urgency,
        data: analysis,
        timestamp: new Date(),
      };

      const existingHistory = JSON.parse(
        localStorage.getItem('dentalgemma:history') || '[]'
      );
      existingHistory.unshift(historyItem);
      localStorage.setItem('dentalgemma:history', JSON.stringify(existingHistory));

      alert('Analysis saved to history!');
    } catch (err) {
      console.error('Failed to save to history:', err);
      alert('Failed to save to history');
    }
  }, [analysis]);

  const handleExportPDF = useCallback(() => {
    if (!analysis) return;

    // In production, this would use jsPDF to generate a proper PDF
    alert('PDF export functionality will be implemented with jsPDF library');
    
    // Placeholder: Download JSON as fallback
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `xray-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [analysis]);

  const handleExportJSON = useCallback(() => {
    if (!analysis) return;

    const dataStr = JSON.stringify(analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `xray-analysis-${Date.now()}.json`;
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
              Upload Dental Image
            </h2>
            <XRayUploader onUpload={handleFileUpload} onError={setError} />
          </div>

          {/* Analysis type selector */}
          {imageUrl && (
            <div className="bg-card text-card-foreground rounded-lg border shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">
                Select Analysis Type
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { value: 'cavity', label: 'Cavity Detection', desc: 'Analyze clinical photos for cavities' },
                  { value: 'opg', label: 'OPG Classification', desc: 'Classify panoramic radiographs' },
                  { value: 'general', label: 'General Assessment', desc: 'Evaluate intraoral X-rays (bitewings/periapicals)' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setAnalysisType(type.value as AnalysisType)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      analysisType === type.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <h3 className="font-semibold mb-1">
                      {type.label}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{type.desc}</p>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleAnalyze}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Analyze Image
                </button>
              </div>
            </div>
          )}

          {/* Model training note */}
          {imageUrl && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Note:</strong> The cavity detection model was trained on clinical photographs, 
                OPG classification on panoramic radiographs, and general assessment on intraoral radiographs. 
                For best results, match your image type to the appropriate analysis mode.
              </p>
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
              This may take a few seconds...
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
