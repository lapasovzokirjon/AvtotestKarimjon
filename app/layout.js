import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Avtotest Karimjon — Prava nazariy imtihoniga tayyorlov',
  description:
    "Jizzax viloyatida prava nazariy imtihoniga tayyorlov kursi. 5+ yil tajriba, 2000+ o'quvchi, 91% natija. Vaqtida kelib vazifalarni bajarsangiz — o'tishingizga kafolat beramiz!",
  keywords:
    'prava, avtotest, nazariy imtihon, avtomaktab, Jizzax, haydovchilik guvohnomasi, prava kursi',
  openGraph: {
    title: 'Avtotest Karimjon — Prava nazariy imtihoniga tayyorlov',
    description: "5+ yil tajriba, 2000+ o'quvchi, 91% natija. Jizzax viloyati.",
    type: 'website',
    locale: 'uz_UZ',
  },
  robots: 'index, follow',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#081312',
};

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        {children}

        {/* ===== META (FACEBOOK) PIXEL ===== */}
        {PIXEL_ID && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${PIXEL_ID}');
                fbq('track', 'PageView');
              `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </body>
    </html>
  );
}
