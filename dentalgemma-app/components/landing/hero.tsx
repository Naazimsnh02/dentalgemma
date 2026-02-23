'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative min-h-screen items-center flex overflow-hidden bg-white">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/landing/hero-v2.png"
          alt="DentalGemma AI Hero Background"
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[95%] xl:max-w-screen-2xl px-4 md:px-8 py-20 lg:py-32 w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Text Content */}
        <div className="flex flex-col items-start text-left gap-6">
          
          {/* Animated Pill Badge */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-1.5 text-sm backdrop-blur-md shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-blue-900 font-medium">MedGemma Impact Challenge 2026</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]"
          >
            AI-Powered Dental
            <span className="block mt-2 text-blue-600">
              Diagnostic Intelligence
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed"
          >
            Enhance clinical precision with instant AI analysis. Fine-tuned on <span className="text-slate-900 font-semibold">5,000+ samples</span> across <span className="text-slate-900 font-semibold">98 conditions</span> for smarter, faster diagnostics.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-2"
          >
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-base font-bold text-white transition-all duration-300 hover:bg-blue-700 hover:scale-105 hover:shadow-lg shadow-blue-500/20"
            >
              Start Free Analysis
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <a
              href="#features"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition-all duration-300 hover:bg-slate-50 hover:scale-105 hover:border-slate-300"
            >
              <Play className="h-4 w-4 fill-slate-700" />
              Watch Demo
            </a>
          </motion.div>
        </div>

        {/* Right Column: Stats Cards (Compact & Right Aligned) */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-10 flex flex-col gap-4 items-end lg:items-end pointer-events-none"
        >
            {[
              { label: 'Clinical Coverage', value: '98+ Conditions' },
              { label: 'Fine-Tuning Data', value: '5k+ Samples' },
              { label: 'Foundation Model', value: 'MedGemma 4B' },
              { label: 'Mobile Support', value: 'Quantized GGUF' },
            ].map((stat, index) => (
              <div 
                key={index}
                className="pointer-events-auto relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-4 backdrop-blur-xl shadow-lg transition-all duration-300 hover:bg-white/80 hover:-translate-y-1 hover:shadow-xl w-64 text-center"
              >
                <div>
                  <div className="text-xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                  <div className="text-xs font-medium text-slate-500">{stat.label}</div>
                </div>
              </div>
            ))}
        </motion.div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-10" />
    </section>
  );
}
