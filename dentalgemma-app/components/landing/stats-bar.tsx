import { Shield, Database, Scan, Globe, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stat {
  icon: LucideIcon;
  value: string;
  label: string;
}

const stats: Stat[] = [
  { icon: Shield, value: '98', label: 'Dental Conditions' },
  { icon: Database, value: '4,148', label: 'Training Samples' },
  { icon: Scan, value: '4', label: 'Analysis Modes' },
  { icon: Globe, value: 'Free', label: 'Open Access' },
];

export function StatsBar() {
  return (
    <section className="bg-white border-y border-slate-100 py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                'flex flex-col items-center text-center',
                index > 0 && 'md:border-l md:border-slate-200'
              )}
            >
              <stat.icon className="mb-2 h-5 w-5 text-blue-600" />
              <span className="text-3xl font-bold text-[#0F1B2D]">
                {stat.value}
              </span>
              <span className="text-sm text-slate-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
