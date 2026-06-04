import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TrackerProvider } from "@/context/TrackerContext";
import AuthGate from "@/components/AuthGate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shelf Health App",
  description: "A tool to track Out Of Stock Products by store locations",
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
          <AuthGate>{children}</AuthGate>
        </TrackerProvider>
      </body>
    </html>
  );
}
