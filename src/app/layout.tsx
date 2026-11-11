import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduAgent.AI // AI 智能體遊戲化教育大廳",
  description: "專為學生與教師打造的提示工程 (Prompt Engineering) 與自主多智能體 (Multi-Agent Swarm) 遊戲化實戰學習平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased dark"
    >
      <head>
        {/* Modern Web Guidance: prevent FOUC and adapt native UI to dark mode */}
        <meta name="color-scheme" content="dark" />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full w-full bg-slate-950 text-slate-100 flex flex-col"
      >
        {children}
      </body>
    </html>
  );
}
