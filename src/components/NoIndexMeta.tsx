'use client';

/**
 * Renders a noindex/nofollow meta tag for pages that should not be indexed by search engines.
 * In React 18+ with Next.js App Router, <meta> tags rendered in components are hoisted to <head>.
 */
export default function NoIndexMeta() {
  return <meta name="robots" content="noindex, nofollow" />;
}
