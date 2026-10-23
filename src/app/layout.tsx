import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoboFlow 2028 // AI Agent Architect Learning Game",
  description: "Autonomous Fleet Dispatch and Multi-Agent Orchestration Simulator (Year 2028)",
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
        className="h-full w-full overflow-hidden bg-slate-950 text-slate-100 flex flex-col"
      >
        {children}
      </body>
    </html>
  );
}
