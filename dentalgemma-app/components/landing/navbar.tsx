'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#ai-showcase' },
  { label: 'Research', href: '#tech-stack' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (!href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setMobileOpen(false);
    },
    []
  );

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 shadow-sm backdrop-blur-md'
            : 'bg-transparent'
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/icon.png"
              alt="DentalGemma"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span
              className={cn(
                'text-lg font-bold tracking-tight transition-colors',
                scrolled ? 'text-slate-900' : 'text-white'
              )}
            >
              DentalGemma
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    scrolled
                      ? 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link
              href="/dashboard"
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97]',
                scrolled
                  ? 'bg-[#0F1B2D] text-white hover:bg-[#1a2d47] hover:shadow-lg'
                  : 'bg-white text-[#0F1B2D] hover:bg-blue-50 hover:shadow-lg'
              )}
            >
              Launch App
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={cn(
              'inline-flex items-center justify-center rounded-lg p-2 transition-colors md:hidden',
              scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'
            )}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </nav>
      </header>

      {/* Mobile drawer overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 flex h-full w-72 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <span className="text-lg font-bold text-slate-900">Menu</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1 px-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className={cn(
                'rounded-lg px-4 py-3 text-base font-medium transition-colors',
                'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="border-t p-4">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold',
              'bg-[#0F1B2D] text-white transition-all duration-200',
              'hover:bg-[#1a2d47] active:scale-[0.97]'
            )}
          >
            Launch App
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
