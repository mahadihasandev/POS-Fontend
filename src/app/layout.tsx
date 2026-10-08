import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ReduxProvider from "@/providers/ReduxProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Smart Account | Enterprise POS & ERP Billing",
  description:
    "Fast, modern cloud POS, inventory management, and multi-user RBAC platform.",
  keywords: ["Smart Account", "POS", "Point of Sale", "Billing", "ERP"],
};

export const viewport: Viewport = {
  themeColor: "#101d32",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-100 text-slate-900 selection:bg-teal-500 selection:text-white">
        <ReduxProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              className: "!bg-white !text-slate-900 !border !border-slate-200 !shadow-xl !text-xs !font-medium",
              style: {
                borderRadius: "10px",
                background: "#ffffff",
                color: "#0f172a",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
              },
              success: {
                iconTheme: {
                  primary: "#059669",
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#dc2626",
                  secondary: "#ffffff",
                },
              },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
