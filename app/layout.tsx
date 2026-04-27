import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TrackerProvider } from "@/context/TrackerContext";
import AuthGate from "@/components/AuthGate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FieldPortal | PepsiCo",
  description: "Enterprise Inventory Intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TrackerProvider>
          <AuthGate>
            {children}
          </AuthGate>
        </TrackerProvider>
      </body>
    </html>
  );
}