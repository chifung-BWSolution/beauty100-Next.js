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
    <section className="relative py-16 sm:py-20 bg-rose-600">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(255,255,255,0.14), transparent 55%)',
        }}
        aria-hidden
      />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
          {title}
        </h2>
        <div className="mt-4 text-base sm:text-lg text-rose-50 leading-relaxed">
          {description}
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center min-h-12 rounded-full bg-white text-rose-700 hover:bg-rose-50 px-8 text-base font-semibold shadow-lg transition-colors"
          >
            {primaryLabel}
            <ArrowRight className="w-4 h-4 ml-2 shrink-0" aria-hidden />
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center min-h-12 rounded-full border-2 border-white text-white hover:bg-white/10 px-8 text-base font-medium transition-colors"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
