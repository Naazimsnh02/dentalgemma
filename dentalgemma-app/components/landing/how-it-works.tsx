import { Upload, Brain, FileCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    number: "1",
    icon: Upload,
    title: "Upload or Enter",
    description:
      "Upload a dental X-ray image or enter clinical case details through our intuitive multi-step form.",
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
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            HOW IT WORKS
          </p>
          <h2 className="mt-3 text-4xl font-bold text-[#0F1B2D]">
            Get AI Diagnostics in Three Simple Steps
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            From upload to insight — fast, accurate, and effortless.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              {/* Connecting dashed line between steps */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-8 hidden md:block",
                    "left-[calc(50%+2.5rem)] w-[calc(100%-1rem)]",
                    "border-t-2 border-dashed border-blue-200"
                  )}
                />
              )}

              {/* Step number circle */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                {step.number}
              </div>

              {/* Icon */}
              <step.icon className="mx-auto mb-4 h-8 w-8 text-blue-600" />

              {/* Title */}
              <h3 className="text-xl font-semibold text-[#0F1B2D]">
                {step.title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
