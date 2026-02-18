import { Upload, Brain, FileCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    number: "1",
    icon: Upload,
    title: "Upload or Enter",
    description:
      "Upload a dental image (clinical photo or radiograph) or enter clinical case details through our intuitive multi-step form.",
  },
  {
    number: "2",
    icon: Brain,
    title: "AI Analyzes",
    description:
      "DentalGemma processes your input using our fine-tuned MedGemma model running on cloud GPUs for maximum accuracy.",
  },
  {
    number: "3",
    icon: FileCheck,
    title: "Get Results",
    description:
      "Receive a structured diagnostic report with findings, confidence scores, treatment recommendations, and urgency classification.",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-white py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            HOW IT WORKS
          </p>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-[#0F1B2D]">
            AI Diagnostics in Three Simple Steps
          </h2>
          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            From upload to insight — professional, accurate, and effortless clinical analysis.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group flex flex-col items-center text-center">
              {/* Connecting dashed line between steps */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-10 hidden md:block",
                    "left-[calc(50%+3rem)] w-[calc(100%-2rem)]",
                    "border-t-2 border-dashed border-slate-200 z-0"
                  )}
                />
              )}

              {/* Step number circle - Glassmorphism style */}
              <div className="relative z-10 mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:shadow-blue-200">
                 <div className="absolute inset-0 rounded-2xl bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                 <span className="relative z-20 text-2xl font-bold text-blue-600 group-hover:text-white transition-colors duration-300">
                    {step.number}
                 </span>
              </div>

              {/* Icon */}
              <div className="mb-4 p-3 rounded-xl bg-slate-50 text-slate-400 group-hover:text-blue-600 transition-colors">
                <step.icon className="h-6 w-6" />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-[#0F1B2D] mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-slate-600 text-sm leading-relaxed max-w-[280px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
