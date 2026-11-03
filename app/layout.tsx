import type { Metadata, Viewport } from "next";
import { Archivo, Bricolage_Grotesque, DM_Mono } from "next/font/google";
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
  authors: [{ name: "Mobile House" }],
  creator: "Mobile House",
  keywords: [
    "mobile shop Chhatrapati Sambhajinagar (Aurangabad)",
    "mobile shop New Usmanpura",
    "Mobile House Sambhajinagar (Aurangabad)",
    "iPhone Samsung OnePlus shop Aurangabad",
    "mobile phones Maharashtra 431005",
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
  robots: {
    index: true,
    follow: true,
  },
  category: "shopping",
};

export const viewport: Viewport = {
  themeColor: "#0B0A09",
  colorScheme: "dark",
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
              "try{if(sessionStorage.getItem('mh-intro')==='1'){document.documentElement.classList.add('intro-seen')}}catch(e){}",
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
