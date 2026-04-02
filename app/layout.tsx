import type { Metadata } from "next";

import { Providers } from "@/components/layout/providers";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MWANGIZ Cosmetics",
    template: "%s | MWANGIZ Cosmetics",
  },
  description:
    "Premium mobile-first cosmetics marketplace for skincare, makeup, and beauty essentials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--background)] font-sans text-[var(--foreground)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
