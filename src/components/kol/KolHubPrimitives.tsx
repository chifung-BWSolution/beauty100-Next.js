import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function KolSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase text-rose-500">
      {children}
    </p>
  );
}

export function KolPrimaryButton({
  href,
  children,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center min-h-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white px-7 text-base font-medium shadow-lg shadow-rose-200/70 transition-all duration-200 ${className}`}
    >
      {children}
      <ArrowRight className="w-4 h-4 ml-2 shrink-0" aria-hidden />
    </Link>
  );
}

export function KolSecondaryButton({
  href,
  children,
  className = '',
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center min-h-12 rounded-full border-2 border-rose-300 text-rose-700 hover:bg-rose-50 px-7 text-base font-medium transition-all duration-200 ${className}`}
    >
      {children}
    </Link>
  );
}

export function KolRoundedImage({
  src,
  alt,
  className = '',
  sizes = '(max-width: 768px) 100vw, 40vw',
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-[1.75rem] shadow-lg shadow-rose-100/60 ${className}`}>
      <Image src={src} alt={alt} fill className="object-cover" sizes={sizes} />
    </div>
  );
}

export function KolBottomCta({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  description: React.ReactNode;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div
        className="rounded-2xl border border-rose-100/70 px-5 sm:px-8 py-7 sm:py-8 shadow-sm"
        style={{
          background:
            'linear-gradient(135deg, #fff1f2 0%, #fdf2f8 45%, #faf5ff 100%)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br from-rose-400 to-pink-500 shadow-sm shrink-0">
              <ArrowRight className="w-5 h-5 text-white rotate-[-45deg]" aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                {title}
              </h2>
              <div className="mt-1.5 text-sm sm:text-[15px] text-slate-500 leading-relaxed">
                {description}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 lg:pl-4">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center min-h-10 rounded-lg px-5 text-sm font-medium text-white shadow-sm transition-all bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
            >
              {primaryLabel}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" aria-hidden />
            </Link>
            {secondaryHref && secondaryLabel && (
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center min-h-10 rounded-lg px-5 text-sm font-medium text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors"
              >
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
