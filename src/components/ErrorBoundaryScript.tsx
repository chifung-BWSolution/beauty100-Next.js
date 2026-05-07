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
        event.stopImmediatePropagation();
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
        event.stopImmediatePropagation();
      }
    };

    // Use capture phase to intercept before other handlers
    window.addEventListener('error', handler, true);
    window.addEventListener('unhandledrejection', rejectionHandler, true);

    return () => {
      window.removeEventListener('error', handler, true);
      window.removeEventListener('unhandledrejection', rejectionHandler, true);
    };
  }, []);

  return null;
}
