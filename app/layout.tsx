import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sfProText = localFont({
  src: [
    {
      path: "../public/fonts/SF-Pro-Text-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/SF-Pro-Text-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/SF-Pro-Text-Semibold.otf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro-text",
});

const sfProDisplay = localFont({
  src: [
    {
      path: "../public/fonts/SF-Pro-Display-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/SF-Pro-Display-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/SF-Pro-Display-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro-display",
});

export const metadata: Metadata = {
  title: "ScriptPad — YouTube Script Writer",
  description: "Camera-ready script writer with shot direction",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sfProText.variable} ${sfProDisplay.variable} h-full bg-white antialiased`}
    >
      <body className="min-h-full bg-white text-[#1D1D1F] font-sans selection:bg-[#E5E5EA] selection:text-black">
        {children}
      </body>
    </html>
  );
}
