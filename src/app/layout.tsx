import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "@/app/globals.css";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-editorial",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-interface",
});

export const metadata: Metadata = {
  title: "Chart Library Atlas",
  description:
    "A complete chart gallery across Chart.js, Recharts, and ECharts with a shared API dataset layer and editorial design language.",
};

export const viewport: Viewport = {
  themeColor: "#f4ede1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable} antialiased`}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
