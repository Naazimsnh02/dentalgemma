'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Hero() {
  return (
    <section className="relative min-h-[90vh] bg-[#0F1B2D] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — Text content */}
          <div className="flex flex-col items-start gap-8">
            {/* Pill badge */}
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-slate-300">
              🦷 MedGemma Impact Challenge 2026
            </span>

            {/* Headline */}
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              AI-Powered Dental
              <br />
              Diagnostics
              <span className="mt-2 block text-blue-400">
                Smarter. Faster. Accessible.
              </span>
            </h1>

            {/* Subtext */}
            <p className="max-w-lg text-lg leading-relaxed text-slate-300">
              Fine-tuned on 4,148 dental samples across 98 clinical conditions.
              Upload X-rays, assess cases, and get instant AI-powered diagnostic
              insights.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className={cn(
                  'inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-lg font-medium text-white',
                  'transition-colors duration-200 hover:bg-blue-500'
                )}
              >
                Start Free Analysis
                <ArrowRight className="h-5 w-5" />
              </Link>

              <a
                href="#features"
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-lg font-medium text-white',
                  'transition-colors duration-200 hover:bg-white/10'
                )}
              >
                Learn More
                <ChevronDown className="h-5 w-5" />
              </a>
            </div>

            {/* Social proof pill */}
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                98 Conditions
              </span>
              <span className="text-white/30">·</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                4,148 Samples
              </span>
              <span className="text-white/30">·</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                4 Analysis Modes
              </span>
            </div>
          </div>

          {/* Right — Hero image */}
          <div className="relative flex items-center justify-center">
            {/* Glow effect */}
            <div className="absolute inset-0 -z-0 translate-x-8 translate-y-8 rounded-full bg-blue-500/20 blur-[100px]" />

            {/* Image container */}
            <div className="relative z-10">
              <Image
                src="/images/landing/hero.png"
                alt="DentalGemma AI diagnostic analysis interface"
                width={640}
                height={480}
                priority
                className="rounded-3xl"
              />

              {/* Floating pill — top right */}
              <div className="absolute -right-3 -top-3 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-md">
                🔬 98 Conditions
              </div>

              {/* Floating pill — bottom left */}
              <div className="absolute -bottom-3 -left-3 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-md">
                ⚡ Cloud GPU Inference
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
