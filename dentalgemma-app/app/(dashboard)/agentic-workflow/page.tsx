'use client';

/**
 * Agentic Workflow Page
 * 
 * Multi-agent diagnostic workflow with real-time visualization
 * Requirements: 4.1-4.10
 */

import { useState, useRef } from 'react';
import { WorkflowVisualizer, WorkflowProgressBar } from '@/components/agentic/workflow-visualizer';
import { AgentGrid } from '@/components/agentic/agent-card';
import { ToolCallLog, ToolCallSummary } from '@/components/agentic/tool-call-log';
import { WorkflowControls } from '@/components/agentic/workflow-controls';
import { createWorkflowEngine } from '@/lib/agentic/workflow-engine';
import { useAppStore } from '@/store/app-store';
import type { WorkflowInput, WorkflowStep, WorkflowResult } from '@/types';
import { Upload, FileText, MapPin, Sparkles, Download, FileDown, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const stripMarkdown = (markdown: string) => {
  if (!markdown) return '';
  
  // Remove code blocks but keep content
  let text = markdown.replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```/g, '');
  });
  
  // Remove headers (#)
  text = text.replace(/^#+\s+/gm, '');
  
  // Remove bold/italic (** or *)
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');
  
  // Remove links [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  // Remove images ![text](url) -> text
  text = text.replace(/!\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  // Remove blockquotes (>)
  text = text.replace(/^>\s+/gm, '');
  
  // Lists: convert * or - to bullet points for better PDF rendering
  text = text.replace(/^[-*+]\s+/gm, '• ');
  
  // Horizontal rules
  text = text.replace(/^-{3,}\s*$/gm, '');
  
  return text;
};

export default function AgenticWorkflowPage() {
  const [input, setInput] = useState<WorkflowInput>({
    text: '',
    image: undefined,
    location: '',
  });
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed' | 'cancelled' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'grid' | 'logs'>('timeline');

  const addToHistory = useAppStore((state) => state.addToHistory);
  const updateDashboardStats = useAppStore((state) => state.updateDashboardStats);
  const dashboardStats = useAppStore((state) => state.dashboardStats);

  const engineRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInput(prev => ({ ...prev, image: file }));
    }
  };

  const handleStartWorkflow = async () => {
    if (!input.text.trim()) {
      alert('Please enter a description or clinical information');
      return;
    }

    try {
      setStatus('running');
      setSteps([]);
      setCurrentStep(0);
      setResult(null);
      setError(null);

      // Create workflow engine
      const engine = createWorkflowEngine(input);
      engineRef.current = engine;

      // Execute workflow and collect steps
      const allSteps: WorkflowStep[] = [];


      let plannedAgents: string[] = [];

      for await (const step of engine.execute()) {
        allSteps.push(step);
        
        // Extract planned agents from Coordinator step
        if (step.agent === 'Coordinator' && step.output?.plan?.requiredAgents) {
          plannedAgents = step.output.plan.requiredAgents;
        }
        
        // Create placeholders for remaining steps
        // The loop returns completed steps. 
        // If we have 1 step (Coordinator), we need placeholders for all planned agents.
        // If we have 2 steps (Coordinator + 1st agent), we need placeholders for remaining planned agents.
        const remainingAgents = plannedAgents.slice(allSteps.length - 1);
        
        const placeholders: WorkflowStep[] = remainingAgents.map(agent => ({
          agent,
          action: 'Waiting to start...',
          input: null,
          output: null,
          confidence: 0,
          timestamp: Date.now(), // Placeholder timestamp
        }));
        
        setSteps([...allSteps, ...placeholders]);
        
        // currentStep points to the index of the step being processed (or just finished)
        // If allSteps has 1 item, currentStep is 0 (Coordinator).
        // If we want to show Coordinator as completed and next as active, use length.
        setCurrentStep(allSteps.length);
        
      }

      // Get final result
      const finalResult = engine.getState();
      if (finalResult.finalReport) {
        setResult({
          steps: allSteps,
          finalReport: finalResult.finalReport,
          recommendations: [],
          referrals: finalResult.specialists,
          research: finalResult.researchPapers,
        });
      }

      setStatus('completed');
      setStatus('completed');
      setCurrentStep(allSteps.length);
    } catch (err) {
      console.error('Workflow error:', err);
      setError((err as Error).message);
      setStatus('error');
    }
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.pause();
      setStatus('paused');
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.resume();
      setStatus('running');
    }
  };

  const handleCancel = () => {
    if (engineRef.current) {
      engineRef.current.cancel();
      setStatus('cancelled');
    }
  };

  const handleOverride = (instruction: string) => {
    console.log('Override instruction:', instruction);
    // In a full implementation, this would modify the workflow behavior
  };

  const handleDownloadReport = () => {
    if (!result?.finalReport) return;

    const blob = new Blob([result.finalReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic-report-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    if (!result?.finalReport) return;

    try {
      // Use jsPDF to generate PDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = 20;

      // Add title
      doc.setFontSize(18);
      doc.setTextColor(0, 51, 153); // Dark Blue
      doc.text('Comprehensive Dental Diagnostic Report', margin, yPosition);
      yPosition += 15;

      // Add timestamp
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // Gray
      doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 10;
      
      // Add line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Add content with pagination
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      
      
      // Split text into lines that fit the width
      const plainText = stripMarkdown(result.finalReport);
      const lines = doc.splitTextToSize(plainText, contentWidth);
      const lineHeight = 7;
      
      for (let i = 0; i < lines.length; i++) {
        // Check if we need a new page
        if (yPosition + lineHeight > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.text(lines[i], margin, yPosition);
        yPosition += lineHeight;
      }

      // Save PDF
      doc.save(`diagnostic-report-${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try downloading as Markdown instead.');
    }
  };

  const handleSaveToHistory = () => {
    if (!result?.finalReport) return;

    try {
      const historyItem = {
        id: crypto.randomUUID(),
        type: 'agentic' as const,
        summary: `Agentic Workflow: ${input.text.substring(0, 60)}${input.text.length > 60 ? '...' : ''}`,
        urgency: 'routine' as const,
        data: {
          input,
          steps,
          result,
        },
        timestamp: new Date(),
      };

      addToHistory(historyItem);

      // Update dashboard stats
      updateDashboardStats({
        totalAnalyses: dashboardStats.totalAnalyses + 1,
      });

      alert('Workflow saved to history!');
    } catch (err) {
      console.error('Failed to save to history:', err);
      alert('Failed to save to history');
    }
  };

  const handleReset = () => {
    setInput({ text: '', image: undefined, location: '' });
    setSteps([]);
    setCurrentStep(undefined);
    setResult(null);
    setStatus('idle');
    setError(null);
    engineRef.current = null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white text-center flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Agentic Diagnostic Workflow</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-2xl">
            Multi-agent AI system that autonomously orchestrates comprehensive dental diagnostics
          </p>
        </div>

        {/* Initialization Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Initializing the AI Engine... First launch can take 1-2 minutes to spin up the multi-agent GPU environment. Subsequent runs will start instantly.
          </p>
        </div>

        {/* Input Section */}
        {status === 'idle' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Input Information</h2>

            {/* Text Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Clinical Description
              </label>
              <textarea
                value={input.text}
                onChange={e => setInput(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Describe the patient's condition, symptoms, or provide clinical case details..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
              />
            </div>

            {/* Image Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline h-4 w-4 mr-1" />
                X-Ray Image (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                {input.image ? `Selected: ${input.image.name}` : 'Choose Image'}
              </button>
            </div>

            {/* Location Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location (Optional)
              </label>
              <input
                type="text"
                value={input.location}
                onChange={e => setInput(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location for specialist referrals (e.g., New York, NY)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartWorkflow}
              disabled={!input.text.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-all text-base font-semibold shadow-lg"
            >
              <Sparkles className="inline h-5 w-5 mr-2" />
              Start Agentic Workflow
            </button>
          </div>
        )}

        {/* Workflow Controls */}
        {status !== 'idle' && (
          <WorkflowControls
            status={status}
            onPause={handlePause}
            onResume={handleResume}
            onCancel={handleCancel}
            onOverride={handleOverride}
          />
        )}

        {/* Progress Bar */}
        {steps.length > 0 && status !== 'idle' && (
          <WorkflowProgressBar steps={steps} currentStep={currentStep} />
        )}

        {/* View Mode Selector */}
        {steps.length > 0 && (
          <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Timeline View
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('logs')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'logs'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tool Logs
            </button>
          </div>
        )}

        {/* Workflow Visualization */}
        {steps.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Workflow Progress</h2>

            {viewMode === 'timeline' && (
              <WorkflowVisualizer steps={steps} currentStep={currentStep} />
            )}

            {viewMode === 'grid' && <AgentGrid steps={steps} currentStep={currentStep} />}

            {viewMode === 'logs' && (
              <div className="space-y-4">
                <ToolCallSummary steps={steps} />
                <ToolCallLog steps={steps} />
              </div>
            )}
          </div>
        )}

        {/* Final Report */}
        {result?.finalReport && status === 'completed' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Comprehensive Report</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveToHistory}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Save className="h-4 w-4" />
                  Save to History
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Download className="h-4 w-4" />
                  Download Markdown
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <FileDown className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
            </div>

            <div className="prose max-w-none bg-gray-50 p-6 rounded-lg border border-gray-200">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.finalReport}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 rounded-lg border border-red-200 p-4">
            <h3 className="text-sm font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Reset Button */}
        {(status === 'completed' || status === 'cancelled' || status === 'error') && (
          <button
            onClick={handleReset}
            className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-base font-semibold"
          >
            Start New Workflow
          </button>
        )}
      </div>
    </div>
  );
}
