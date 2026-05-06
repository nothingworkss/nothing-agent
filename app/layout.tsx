import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";

import { Providers } from "@/app/providers";
import { BottomNav } from "@/components/shared/bottom-nav";
import { Header } from "@/components/shared/header";
import { Sidebar } from "@/components/shared/sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agent Hub — 통합 대시보드",
  description: "프로젝트 실행, 헬스 체크, 로그를 한곳에서 관리하는 운영 콘솔",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Agent Hub",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8fafc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full overflow-x-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-slate-950 focus:px-4 focus:py-2 focus:text-white"
        >
          본문으로 건너뛰기
        </a>
        <Providers>
          <div className="flex min-h-screen min-w-0">
            <Suspense
              fallback={
                <aside className="hidden w-[17rem] border-r border-white/10 bg-[#25221d] lg:block" />
              }
            >
              <Sidebar />
            </Suspense>

            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
              <Header />
              <main
                id="main-content"
                className="min-w-0 flex-1 px-3 py-3 pb-24 md:px-6 md:py-6 md:pb-8 xl:px-8"
              >
                {children}
              </main>
            </div>

            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
