import { cn } from "@/lib/utils"

const techItems = [
  { emoji: "⚡", label: "Next.js 16" },
  { emoji: "🧠", label: "MedGemma 1.5 4B" },
  { emoji: "🚀", label: "Modal.com GPU" },
  { emoji: "🤖", label: "Vercel AI SDK 6" },
  { emoji: "📚", label: "PubMed E-Utils" },
  { emoji: "📍", label: "Google Places API" },
  { emoji: "🎨", label: "Tailwind CSS v4" },
  { emoji: "🔧", label: "TypeScript" },
  { emoji: "📱", label: "PWA Ready" },
]

export function TechStack() {
  return (
    <section id="tech-stack" className={cn("bg-white py-20")}>
      <div className={cn("max-w-7xl mx-auto px-6")}>
        <div className={cn("text-center")}>
          <p className={cn("text-blue-600 font-semibold text-sm tracking-widest uppercase")}>
            TECHNOLOGY
          </p>
          <h2 className={cn("text-3xl font-bold text-[#0F1B2D] mt-3")}>
            Built with Modern Technology
          </h2>
          <p className={cn("text-slate-600 mt-4")}>
            Leveraging cutting-edge AI and web technologies for reliable dental diagnostics
          </p>
        </div>

        <div className={cn("flex flex-wrap justify-center gap-4 mt-12")}>
          {techItems.map((item) => (
            <span
              key={item.label}
              className={cn(
                "bg-slate-50 border border-slate-200 rounded-full px-6 py-3 text-sm font-medium text-slate-700",
                "hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 cursor-default"
              )}
            >
              {item.emoji} {item.label}
            </span>
          ))}
        </div>

        <p className={cn("text-sm text-slate-400 mt-8 text-center")}>
          Deployed on Vercel · GPU Inference on Modal.com · 100% Open Source
        </p>
      </div>
    </section>
  )
}
