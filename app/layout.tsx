import type { Metadata } from "next";
import "./globals.css";
import { TrackerProvider } from "@/context/TrackerContext";
import AuthGate from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "Inventory Intelligence | PepsiCo Field Ops",
  description: "Real-time supply chain and stockout tracking for field personnel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TrackerProvider>
          <AuthGate>
            {children}
          </AuthGate>
        </TrackerProvider>
      </body>
    </html>
  );
}