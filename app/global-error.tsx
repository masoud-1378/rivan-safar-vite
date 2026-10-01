'use client';

/**
 * میز P-B فاز ۲ (PB-02): مرز خطای روت.
 * وقتی خطا داخل خود روت لئوت رخ می‌دهد، به‌جای صفحهٔ سفید پیش‌فرض، این
 * کامپوننت جایگزین کل درخت می‌شود؛ پس html و body خودش را دارد و فقط با
 * استایل inline کار می‌کند (CSS سراسری لئوت در این حالت لود نیست).
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF7F2',
          color: '#172027',
          fontFamily: 'system-ui, Tahoma, sans-serif',
          padding: '24px',
        }}
      >
        <main
          style={{
            maxWidth: '560px',
            width: '100%',
            background: '#fff',
            border: '1px solid #E2E6E8',
            borderRadius: '16px',
            padding: '40px 32px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 12px' }}>
            مشکلی در بارگذاری سایت پیش آمد
          </h1>
          <p style={{ fontSize: '15px', lineHeight: 2, color: '#66727A', margin: '0 0 28px' }}>
            لطفاً یک بار صفحه را تازه کنید. اگر مشکل ادامه داشت، مستقیم با
            پشتیبانی ریوان سفر در تماس باشید.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                background: '#FF6600',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 28px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              تلاش دوباره
            </button>
            <a
              href="/"
              style={{
                border: '1px solid #E2E6E8',
                borderRadius: '12px',
                padding: '12px 28px',
                fontSize: '15px',
                fontWeight: 700,
                color: '#102A3A',
                textDecoration: 'none',
              }}
            >
              صفحه اصلی
            </a>
          </div>
          {process.env.NODE_ENV === 'development' && error?.message ? (
            <pre
              dir="ltr"
              style={{
                marginTop: '24px',
                textAlign: 'left',
                fontSize: '12px',
                color: '#8A989F',
                whiteSpace: 'pre-wrap',
              }}
            >
              {error.message}
            </pre>
          ) : null}
        </main>
      </body>
    </html>
  );
}
