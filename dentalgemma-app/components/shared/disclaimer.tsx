'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Disclaimer() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <footer
      className={cn(
        'border-t bg-amber-50 dark:bg-amber-950/20 transition-all duration-300',
        isCollapsed ? 'h-12' : 'h-auto'
      )}
      role="contentinfo"
      aria-label="Medical disclaimer"
    >
      <div className="container mx-auto px-6">
        {/* Collapsed Header */}
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Medical Disclaimer</span>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-md p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            aria-label={isCollapsed ? 'Expand disclaimer' : 'Collapse disclaimer'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronUp className="h-4 w-4 text-amber-800 dark:text-amber-200" />
            ) : (
              <ChevronDown className="h-4 w-4 text-amber-800 dark:text-amber-200" />
            )}
          </button>
        </div>

        {/* Expanded Content */}
        {!isCollapsed && (
          <div className="pb-6 space-y-4">
            <div className="text-sm text-amber-900 dark:text-amber-100 space-y-2">
              <p className="font-medium">
                ⚠️ This application is for educational and demonstration purposes only.
              </p>
              <p>
                DentalGemma is NOT a substitute for professional medical advice, diagnosis, or treatment. 
                Always seek the advice of your dentist or other qualified healthcare provider with any 
                questions you may have regarding a dental condition.
              </p>
              <p>
                <strong>Important:</strong> This application is NOT HIPAA compliant. Do not upload real 
                patient data or personally identifiable information. Use only anonymized or sample data 
                for testing and demonstration purposes.
              </p>
              <p>
                Never disregard professional medical advice or delay in seeking it because of something 
                you have read or seen in this application. If you think you may have a dental emergency, 
                call your dentist or emergency services immediately.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-4 text-sm">
              <Link
                href="/privacy-policy"
                className="text-amber-800 dark:text-amber-200 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-amber-800 dark:text-amber-200 hover:underline font-medium"
              >
                Terms of Service
              </Link>
              <Link
                href="/about"
                className="text-amber-800 dark:text-amber-200 hover:underline font-medium"
              >
                About DentalGemma
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-xs text-amber-700 dark:text-amber-300 pt-2 border-t border-amber-200 dark:border-amber-800">
              <p>
                © {new Date().getFullYear()} DentalGemma. All rights reserved. 
                This is a demonstration application built for educational purposes.
              </p>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
