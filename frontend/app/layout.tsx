import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";
import Script from "next/script";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Bulks - AI-Powered TikTok & Instagram Reel Generator",
  description:
    "Transform your content strategy with our professional platform that generates engaging TikTok and Instagram Reels automatically. Perfect for marketing teams and content creators.",
  generator: "Bulks",
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "manifest",
        url: "/site.webmanifest",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-L0HTN41YPN"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-L0HTN41YPN', { send_page_view: false });
          `}
        </Script>
        <link rel="preconnect" href="https://framerusercontent.com" />
        <link rel="preconnect" href="https://storage.googleapis.com" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <TooltipProvider>
          <AuthProvider>{children}</AuthProvider>
          <Analytics />
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
