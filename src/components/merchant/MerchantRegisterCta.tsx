import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MERCHANT_REGISTER_HREF } from '@/lib/kol-hub';

type MerchantRegisterCtaProps = {
  title?: string;
  description?: string;
  ctaLabel?: string;
  className?: string;
};

/** Mid-page CTA strip pointing to merchant registration */
export default function MerchantRegisterCta({
  title = '尚未開通商戶帳戶？',
  description = '註冊後即可管理店舖資料、投放推廣資源，並預約 KOL 免費諮詢。',
  ctaLabel = '立即註冊商戶',
  className = '',
}: MerchantRegisterCtaProps) {
  return (
    <section className={`py-12 sm:py-14 bg-rose-50/70 border-y border-rose-100 ${className}`}>
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="max-w-xl">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">{description}</p>
        </div>
        <Link
          href={MERCHANT_REGISTER_HREF}
          className="inline-flex items-center justify-center gap-2 min-h-11 px-6 py-3 rounded-full bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 shrink-0"
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
