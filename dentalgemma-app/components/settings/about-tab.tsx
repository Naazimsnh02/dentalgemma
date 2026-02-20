'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Info, ExternalLink, Github, BookOpen, Mail, Shield } from 'lucide-react';

export function AboutTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          About DentalGemma
        </CardTitle>
        <CardDescription>
          Information about the application and resources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Application Info */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold">DentalGemma</h3>
            <p className="text-sm text-muted-foreground">Version 1.0.0</p>
          </div>
          <p className="text-sm">
            A dental AI diagnostic platform leveraging the fine-tuned DentalGemma 1.5 4B IT (Multimodal) model 
            for comprehensive dental diagnostics, clinical assessments, and evidence-based treatment recommendations.
          </p>
        </div>

        <Separator />

        {/* Model Information */}
        <div className="space-y-3">
          <h3 className="font-medium">AI Model</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model:</span>
              <span className="font-medium">DentalGemma 1.5 4B IT</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base Model:</span>
              <span className="font-medium">MedGemma + SigLIP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Training Data:</span>
              <span className="font-medium">5k+ samples</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Conditions Covered:</span>
              <span className="font-medium">98 dental conditions</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Features */}
        <div className="space-y-3">
          <h3 className="font-medium">Key Features</h3>
          <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
            <li>X-Ray Analysis (Cavity, OPG, Tooth ID, General)</li>
            <li>Clinical Case Assessment</li>
            <li>Voice Consultation (Standard & Enhanced)</li>
            <li>Agentic Diagnostic Workflow</li>
            <li>Dentist Finder with Location Services</li>
            <li>Treatment Progress Tracker</li>
            <li>Dental Research Dashboard</li>
            <li>Patient Education Portal</li>
            <li>Dental Symptom Checker</li>
            <li>Interactive Dashboard</li>
            <li>Analysis History Management</li>
          </ul>
        </div>

        <Separator />

        {/* Resources */}
        <div className="space-y-3">
          <h3 className="font-medium">Resources</h3>
          <div className="grid gap-2">
            <a href="https://huggingface.co/naazimsnh02/dentalgemma-1.5-4b-it" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="justify-start w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Model on HuggingFace
              </Button>
            </a>
            <a href="https://github.com/naazimsnh02/dentalgemma" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="justify-start w-full">
                <Github className="mr-2 h-4 w-4" />
                GitHub Repository
              </Button>
            </a>

          </div>
        </div>

        <Separator />

        {/* Legal & Privacy */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Legal & Privacy
          </h3>
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-4 space-y-2">
            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
              Medical Disclaimer
            </p>
            <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
              This application is for educational and informational purposes only. It is not intended to be a substitute 
              for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers 
              with any questions you may have regarding a medical condition.
            </p>
          </div>

        </div>

        <Separator />

        {/* Contact */}
        <div className="space-y-3">
          <h3 className="font-medium">Contact & Support</h3>
          <a href="mailto:naazimsnh02@gmail.com">
            <Button variant="outline" className="justify-start w-full">
              <Mail className="mr-2 h-4 w-4" />
              naazimsnh02@gmail.com
            </Button>
          </a>
        </div>

        {/* Copyright */}
        <div className="pt-4 text-center text-xs text-muted-foreground">
          <p>© 2026 DentalGemma. All rights reserved.</p>
          <p className="mt-1">Built with Next.js, React, and Tailwind CSS</p>
        </div>
      </CardContent>
    </Card>
  );
}
