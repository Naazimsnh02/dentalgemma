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
  { label: 'Technology', href: '#tech-stack' },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
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
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
          scrolled
            ? 'bg-white/80 backdrop-blur-md border-slate-200/50 shadow-sm'
            : 'bg-transparent border-transparent py-2'
        )}
      >
        <nav className="mx-auto flex h-16 max-w-[95%] xl:max-w-screen-2xl items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative overflow-hidden rounded-lg">
                <Image
                src="/icon.png"
                alt="DentalGemma"
                width={36}
                height={36}
                className="transition-transform duration-300 group-hover:scale-110"
                />
            </div>
            <span
              className={cn(
                'text-lg font-bold tracking-tight transition-colors text-slate-900'
              )}
            >
              DentalGemma
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className={cn(
            "hidden items-center gap-1 md:flex px-2 py-1.5 rounded-full transition-all duration-300",
            scrolled 
              ? "bg-transparent" 
              : "bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-lg supports-[backdrop-filter]:bg-slate-900/40"
          )}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => handleAnchorClick(e, link.href)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                    scrolled 
                      ? 'text-slate-700 hover:bg-slate-100 hover:text-blue-600' 
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
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
                'inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300',
                'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25'
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
              "inline-flex items-center justify-center rounded-lg p-2 transition-colors md:hidden",
              scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
            )}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>
      </header>

      {/* Mobile drawer overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 flex h-full w-80 flex-col bg-white border-l border-slate-100 shadow-2xl transition-transform duration-300 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
          <span className="text-lg font-bold text-slate-900">Menu</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className="rounded-lg px-4 py-3 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold',
              'bg-blue-600 text-white transition-all duration-200',
              'hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.97]'
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
