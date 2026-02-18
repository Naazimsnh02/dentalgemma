'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] bg-[#0F1B2D] overflow-hidden flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/landing/hero.png"
          alt="DentalGemma AI Hero Background"
          fill
          priority
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1B2D]/80 via-[#0F1B2D]/60 to-[#0F1B2D]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:py-28 w-full">
        <div className="flex flex-col items-center text-center gap-8">
          {/* Pill badge */}
          <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
            🦷 MedGemma Impact Challenge 2026
          </span>

          {/* Headline */}
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl">
            AI-Powered Dental
            <br />
            Diagnostics
            <span className="mt-2 block text-blue-400">
              Smarter. Faster. Accessible.
            </span>
          </h1>

          {/* Subtext */}
          <p className="max-w-2xl text-lg leading-relaxed text-slate-300">
            Fine-tuned on 4,148 dental samples across 98 clinical conditions.
            Upload dental images, assess cases, and get instant AI-powered
            diagnostic insights.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className={cn(
                'inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-lg font-medium text-white',
                'transition-colors duration-200 hover:bg-blue-500 shadow-lg shadow-blue-500/25'
              )}
            >
              Start Free Analysis
              <ArrowRight className="h-5 w-5" />
            </Link>

            <a
              href="#features"
              className={cn(
                'inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-lg font-medium text-white',
                'transition-colors duration-200 hover:bg-white/10 backdrop-blur-sm'
              )}
            >
              Learn More
              <ChevronDown className="h-5 w-5" />
            </a>
          </div>

          {/* Social proof pill */}
          <div className="mt-8 inline-flex flex-wrap justify-center items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm text-slate-300 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span>98 Conditions Covered</span>
            </div>
            <span className="text-white/20 hidden sm:inline">|</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>4,148 Training Samples</span>
            </div>
            <span className="text-white/20 hidden sm:inline">|</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Expert-Validated Insights</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
