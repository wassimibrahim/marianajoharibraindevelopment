import type { Metadata, Viewport } from "next";
import { Amiri, DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dmsans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbmono", weight: ["400", "500"] });
const amiri = Amiri({ subsets: ["arabic"], variable: "--font-amiri", weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "The Mariana Johari Prefrontal Cortex Laboratory™",
  description:
    "A longitudinal scientific investigation into whether Mariana is finally capable of making good decisions. Happy 24th birthday, Mari 🌸",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#fbf7f0",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable} ${mono.variable} ${amiri.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
