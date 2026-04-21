'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2 style={{ color: '#334155', fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>出現錯誤</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>{error?.message || '發生了意外錯誤'}</p>
            <button
              onClick={reset}
              style={{
                padding: '0.5rem 1rem',
                background: '#e11d48',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              重試
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
