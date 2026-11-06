import type { Metadata, Viewport } from "next";
import { Archivo, Bricolage_Grotesque, DM_Mono } from "next/font/google";
import { site } from "@/lib/catalog";
import { siteDescription, siteTitle, siteUrl } from "@/lib/site-url";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const body = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s · Mobile House",
  },
  description: siteDescription,
  applicationName: "Mobile House",
  authors: [{ name: "Mobile House", url: siteUrl }],
  creator: "Mobile House",
  publisher: "Mobile House",
  keywords: [
    "best mobile store in Chhatrapati Sambhajinagar",
    "best mobile shop in Aurangabad",
    "mobile shop CSN",
    "mobile store New Usmanpura",
    "mobile shop near me Aurangabad",
    "iPhone dealer Aurangabad",
    "Samsung mobile shop Chhatrapati Sambhajinagar",
    "OnePlus store Aurangabad",
    "5G mobile shop Aurangabad 431005",
    "mobile exchange Aurangabad",
    "mobile EMI Chhatrapati Sambhajinagar",
    "GST bill mobile shop Aurangabad",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Mobile House",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  appleWebApp: {
    capable: true,
    title: "Mobile House",
    statusBarStyle: "black-translucent",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "shopping",
  formatDetection: { telephone: true, address: true, email: true },
  // Local signals for search engines and answer engines that read meta tags.
  other: {
    "geo.region": "IN-MH",
    "geo.placename": "Chhatrapati Sambhajinagar (Aurangabad), Maharashtra",
    "business:contact_data:street_address": `${site.store.address.line1}, ${site.store.address.line2}`,
    "business:contact_data:locality": "Chhatrapati Sambhajinagar (Aurangabad)",
    "business:contact_data:region": site.store.address.state,
    "business:contact_data:postal_code": site.store.address.postalCode,
    "business:contact_data:country_name": "India",
    "business:contact_data:phone_number": site.store.phoneDisplay,
    "business:contact_data:website": siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0A09",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              // Runs before paint: the day/night skin is on <html> by the time
              // the first frame shows, so a visitor never sees the wrong theme.
              "try{if(sessionStorage.getItem('mh-intro')==='1'){document.documentElement.classList.add('intro-seen')}}catch(e){}" +
              "try{" +
              "var saved=localStorage.getItem('mh-theme');" +
              "var hour=new Date().getHours();" +
              "var theme=(saved==='light'||saved==='dark')?saved:((hour>=6&&hour<18)?'light':'dark');" +
              "document.documentElement.dataset.theme=theme;" +
              "document.documentElement.style.colorScheme=theme;" +
              "var meta=document.querySelector('meta[name=\"theme-color\"]');" +
              "if(meta){meta.setAttribute('content',theme==='light'?'#FDFBF5':'#0B0A09')}" +
              "}catch(e){document.documentElement.dataset.theme='dark'}",
          }}
        />
      </head>
      <body>
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
