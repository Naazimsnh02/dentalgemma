import Image from "next/image"
import Link from "next/link"
import { CheckCircle2, ArrowRight } from "lucide-react"

const features = [
  "Multimodal VQA — analyze images and text together",
  "98 dental conditions across 6 specialized datasets",
  "Cloud GPU inference via Modal.com for fast results",
  "Agentic workflow with autonomous multi-step diagnostics",
]

export function AIShowcase() {
  return (
    <section id="ai-showcase" className="bg-[#0F1B2D] py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left column — Text */}
          <div>
            <span className="text-blue-400 font-semibold text-sm tracking-widest uppercase">
              POWERED BY MEDGEMMA
            </span>

            <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight mt-4">
              Built on MedGemma,
              <br />
              Fine-Tuned for Dentistry
            </h2>

            <p className="text-slate-300 text-lg leading-relaxed mt-6">
              Our model extends Google&apos;s MedGemma foundation with
              specialized dental training across radiographic analysis and
              clinical assessment.
            </p>

            <ul className="flex flex-col gap-4 mt-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="text-blue-400 mt-0.5 size-5 shrink-0" />
                  <span className="text-slate-200">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 py-3 mt-8 inline-flex items-center gap-2 transition-colors"
            >
              Explore the App
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Right column — App preview */}
          <div className="relative">
            {/* Blue glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/20 blur-3xl rounded-full" />

            <Image
              src="/images/landing/app-preview.png"
              alt="DentalGemma app preview"
              width={720}
              height={480}
              className="relative rounded-2xl shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
