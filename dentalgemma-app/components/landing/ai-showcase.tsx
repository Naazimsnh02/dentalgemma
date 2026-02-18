"use client"

import Image from "next/image"
import Link from "next/link"
import { CheckCircle2, ArrowRight } from "lucide-react"

const features = [
  "Multimodal VQA — analyze images and text together",
  "98 dental conditions across 6 specialized datasets",
  "Cloud GPU inference via Modal.com for fast results",
  "Agentic workflow with autonomous multi-step diagnostics",
]

import { motion } from "framer-motion"

export function AIShowcase() {
  return (
    <section id="ai-showcase" className="relative bg-[#0F1B2D] py-24 overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,#1e3a8a_0%,transparent_50%)] opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,#1e40af_0%,transparent_50%)] opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-sm backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="text-blue-300 font-medium tracking-wide text-xs uppercase">POWERED BY MEDGEMMA 1.5</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-tight leading-[1.15]">
            MedGemma 4B Foundation,
            <span className="block text-blue-400 mt-2">Fine-Tuned for Dental.</span>
          </h2>

          <p className="text-slate-400 text-lg lg:text-xl leading-relaxed mt-8 max-w-2xl mx-auto">
            Our specialized model extends Google&apos;s medical foundation with
            thousands of dental datasets across radiography and clinical photography.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 text-left">
            {features.map((feature) => (
              <div 
                  key={feature} 
                  className="flex flex-col items-center text-center gap-4 group p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all duration-300 h-full"
              >
                <div className="rounded-full bg-blue-500/10 p-3 group-hover:bg-blue-500/20 transition-colors">
                  <CheckCircle2 className="text-blue-400 size-5 shrink-0" />
                </div>
                <span className="text-slate-300 font-medium text-sm lg:text-base group-hover:text-white transition-colors leading-tight">
                    {feature}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <Link
              href="/dashboard"
              className="group bg-blue-600 hover:bg-blue-500 text-white rounded-full px-12 py-5 inline-flex items-center gap-3 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-600/30 font-bold text-lg"
            >
              Explore the Technology
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
