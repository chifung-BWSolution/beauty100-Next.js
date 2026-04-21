'use client';

import { useEffect } from 'react';

/**
 * Suppresses "Script error." events from cross-origin scripts
 * that cannot be debugged (no filename, no line/col, no stack).
 * These are typically from third-party scripts running in iframes.
 */
export default function ErrorBoundaryScript() {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      // "Script error." with no file info = cross-origin, suppress it
      if (
        event.message === 'Script error.' &&
        (!event.filename || event.filename === '') &&
        event.lineno === 0 &&
        event.colno === 0
      ) {
        event.preventDefault();
        return true;
      }
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      // Suppress network errors from Supabase/third-party scripts
      if (
        event.reason instanceof TypeError &&
        event.reason.message === 'Failed to fetch'
      ) {
        event.preventDefault();
        console.warn('Suppressed unhandled fetch rejection');
      }
    };

    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  return null;
}
