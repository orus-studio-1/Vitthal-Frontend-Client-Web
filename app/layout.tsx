import type { Metadata } from "next";
import { Outfit, Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Footer, Header } from "@/components/Landing_Page";
import PreFooter from "@/components/shared/PreFooter";
import { Toaster } from "@/components/ui/sonner";
import { consoleGuardScript, isProduction } from "@/lib/consoleGuard";
import DeletionRecoveryOverlay from "@/components/shared/DeletionRecoveryOverlay";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MTWO Groups | B2B Industrial Marketplace",
  description:
    "Source industrial products from verified vendors with transparent pricing, MOQ, and delivery timelines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${montserrat.variable} scroll-smooth h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body
        className={`${outfit.variable} ${montserrat.variable} min-h-full flex flex-col font-body`}
      >
        {isProduction ? (
          <Script
            id="console-guard"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: consoleGuardScript }}
          />
        ) : null}
        <Toaster position="top-right" richColors/>
        <Header />
        <DeletionRecoveryOverlay>
          {children}
        </DeletionRecoveryOverlay>
        <PreFooter />
        <Footer />
      </body>
    </html>
  );
}
