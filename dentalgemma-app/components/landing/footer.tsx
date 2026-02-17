import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const productLinks = [
  { label: "X-Ray Analysis", href: "/dashboard" },
  { label: "Clinical Assessment", href: "/dashboard" },
  { label: "Voice Consultation", href: "/dashboard" },
  { label: "Agentic Workflow", href: "/dashboard" },
  { label: "Dentist Finder", href: "/dashboard" },
];

const resourceLinks = [
  { label: "Documentation", href: "#" },
  { label: "Research Papers", href: "#" },
  { label: "PubMed Integration", href: "#" },
  { label: "Model Information", href: "#" },
  { label: "API Reference", href: "#" },
];

const legalLinks = [
  { label: "Medical Disclaimer", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookie Policy", href: "#" },
];

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
      <div className="flex flex-col gap-3">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-slate-400 hover:text-white text-sm"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className={cn("bg-[#0A1120]", "pt-16 pb-8")}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <Image src="/icon.png" alt="DentalGemma" width={32} height={32} />
              <span className="text-white font-bold text-lg">DentalGemma</span>
            </div>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              AI-powered dental diagnostic platform built on Google&apos;s
              MedGemma foundation model.
            </p>
            <Link
              href="https://github.com/naazimsnh02/dentalgemma"
              className="text-slate-400 hover:text-white text-sm mt-4 inline-block"
            >
              GitHub →
            </Link>
          </div>

          {/* Product */}
          <FooterLinkColumn title="Product" links={productLinks} />

          {/* Resources */}
          <FooterLinkColumn title="Resources" links={resourceLinks} />

          {/* Legal */}
          <FooterLinkColumn title="Legal" links={legalLinks} />
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs">
              © 2026 DentalGemma. Built for the MedGemma Impact Challenge.
            </p>
            <p className="text-slate-500 text-xs">
              Made with ❤️ for better dental care
            </p>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-slate-800/50 rounded-xl">
            <p className="text-slate-500 text-xs leading-relaxed">
              ⚠️ DISCLAIMER: This application is for educational and research
              purposes only. It is NOT intended for clinical diagnosis or patient
              care. AI-generated assessments must be validated by licensed dental
              professionals.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
