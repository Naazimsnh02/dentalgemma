import { cn } from "@/lib/utils"

const techItems = [
  { emoji: "⚡", label: "Next.js 16" },
  { emoji: "🧠", label: "MedGemma 1.5 4B" },
  { emoji: "🚀", label: "Modal.com GPU" },
  { emoji: "🤖", label: "Custom Async Engine" },
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

        <div className={cn("flex flex-wrap justify-center gap-3 mt-12")}>
          {techItems.map((item) => (
            <span
              key={item.label}
              className={cn(
                "bg-white/50 backdrop-blur-sm border border-slate-200/60 rounded-full px-6 py-3 text-sm font-semibold text-slate-800",
                "hover:border-blue-400/50 hover:bg-white hover:text-blue-700 transition-all duration-300 cursor-default shadow-sm hover:shadow-md"
              )}
            >
              <span className="mr-2 opacity-80">{item.emoji}</span> {item.label}
            </span>
          ))}
        </div>

        <p className={cn("text-sm text-slate-400 mt-8 text-center")}>
          Deployed on Vercel · GPU Inference on Modal.com
        </p>
      </div>
    </section>
  )
}
