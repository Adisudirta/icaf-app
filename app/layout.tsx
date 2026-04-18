import type { Metadata } from "next";
import { Manrope, Crimson_Text } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson-text",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "ICAF",
  description: "ICAF - Integrated Case Analysis Framework",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${crimsonText.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-manrope">{children}</body>
    </html>
  );
}
