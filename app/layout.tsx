import "./globals.css";
import { TrackerProvider } from "@/context/TrackerContext";
import AuthGate from "@/components/AuthGate";

export const metadata = {
  title: "PepsiCo Stockout Tracker",
  description: "Operational Intelligence for Merchandisers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950">
        <TrackerProvider>
          <AuthGate>{children}</AuthGate>
        </TrackerProvider>
      </body>
    </html>
  );
}
