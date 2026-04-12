import "./globals.css";
import { TrackerProvider } from "@/context/TrackerContext";
import AuthGate from "@/components/AuthGate";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TrackerProvider>
          {/* AuthGate sits inside Provider so it can access the user session */}
          <AuthGate>{children}</AuthGate>
        </TrackerProvider>
      </body>
    </html>
  );
}
