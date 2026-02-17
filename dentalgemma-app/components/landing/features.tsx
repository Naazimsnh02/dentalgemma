import {
  ScanLine,
  ClipboardList,
  Mic,
  Workflow,
  MapPin,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: ScanLine,
    title: 'X-Ray Analysis',
    description:
      'Upload dental X-rays for instant AI-powered cavity detection, OPG classification, tooth identification, and comprehensive radiographic assessment.',
  },
  {
    icon: ClipboardList,
    title: 'Clinical Case Assessment',
    description:
      'Enter patient symptoms and clinical findings to receive structured diagnostic reports with treatment plans, urgency levels, and evidence-based recommendations.',
  },
  {
    icon: Mic,
    title: 'Voice Consultation',
    description:
      'Hands-free clinical workflow with real-time voice interaction. Uses Web Speech API with DentalGemma or enhanced Gemini 2.5 Flash Native Audio.',
  },
  {
    icon: Workflow,
    title: 'Agentic Diagnostic Workflow',
    description:
      'Autonomous multi-step diagnostic orchestration powered by Vercel AI SDK 6. Coordinates analysis, research, and referral in one seamless pipeline.',
  },
  {
    icon: MapPin,
    title: 'Find Nearby Dentists',
    description:
      'Locate dental professionals near you with Google Places integration. View ratings, hours, and get directions to the nearest specialist.',
  },
  {
    icon: BookOpen,
    title: 'Research Dashboard',
    description:
      'Access evidence-based dental literature through PubMed integration. Search, filter, and review the latest clinical studies and guidelines.',
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 bg-slate-50/80 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'url(/images/landing/features-bg.png)' }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-blue-600 font-semibold text-sm tracking-widest uppercase mb-4">
            Features
          </p>
          <h2 className="text-4xl font-bold text-[#0F1B2D] max-w-2xl mx-auto mb-4">
            Everything You Need for Dental AI Diagnostics
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Comprehensive AI-powered tools designed to enhance dental diagnostics,
            streamline clinical workflows, and improve patient outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={cn(
                'bg-white rounded-2xl p-8 shadow-sm border border-slate-100 group',
                'hover:shadow-lg hover:border-blue-100 transition-all duration-300'
              )}
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5',
                  'group-hover:bg-blue-100 transition-colors'
                )}
              >
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-[#0F1B2D] mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {feature.description}
              </p>
              <span
                className={cn(
                  'text-blue-600 text-sm font-medium mt-4 inline-flex items-center gap-1',
                  'opacity-0 group-hover:opacity-100 transition-opacity'
                )}
              >
                Learn more →
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
