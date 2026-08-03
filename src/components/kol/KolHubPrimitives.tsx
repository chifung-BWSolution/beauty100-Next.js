import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <Button
      asChild
      size="lg"
      className={`min-h-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white px-7 text-base shadow-lg shadow-rose-200/70 transition-all duration-200 ${className}`}
    >
      <Link href={href}>
        {children}
        <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
      </Link>
    </Button>
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
    <Button
      asChild
      size="lg"
      variant="outline"
      className={`min-h-12 rounded-full border-rose-300 text-rose-700 hover:bg-rose-50 px-7 text-base transition-all duration-200 ${className}`}
    >
      <Link href={href}>{children}</Link>
    </Button>
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
    <section className="relative py-16 sm:py-20 overflow-hidden bg-gradient-to-br from-rose-600 to-rose-700">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight text-balance">
          {title}
        </h2>
        <p className="mt-4 text-base sm:text-lg text-rose-50 leading-relaxed text-balance">
          {description}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="min-h-12 rounded-full bg-white text-rose-700 hover:bg-rose-50 px-8 text-base font-semibold shadow-lg"
          >
            <Link href={primaryHref}>
              {primaryLabel}
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden />
            </Link>
          </Button>
          {secondaryHref && secondaryLabel && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-12 rounded-full border-white/70 bg-transparent text-white hover:bg-white/10 px-8 text-base"
            >
              <Link href={secondaryHref}>{secondaryLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
