import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CtaSection() {
  return (
    <section className={cn(
      'relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 py-24'
    )}>
      {/* Decorative background blobs */}
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="mx-auto mb-6 h-16 w-16 relative flex items-center justify-center">
           <Image
            src="/icon.png"
            alt="DentalGemma"
            width={48}
            height={48}
            className="object-contain drop-shadow-md"
          />
        </div>

        <h2 className="text-3xl font-bold text-white lg:text-4xl">
          Ready to Experience AI Dental Diagnostics?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
          Upload your first clinical photo or radiograph.
        </p>

        <Link
          href="/dashboard"
          className={cn(
            'mt-8 inline-flex items-center gap-2 rounded-full bg-white px-10 py-4',
            'text-lg font-semibold text-blue-700 shadow-lg',
            'transition-all hover:bg-blue-50 hover:shadow-xl'
          )}
        >
          Launch DentalGemma
          <ArrowRight className="h-5 w-5" />
        </Link>

        <p className="mx-auto mt-6 max-w-md text-xs text-blue-200/70">
          ⚠️ For educational and research purposes only. Not intended for clinical diagnosis.
        </p>
      </div>
    </section>
  );
}
