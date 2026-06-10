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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Apply the saved theme before paint so there is no flash of the
            wrong theme on load. Runs synchronously during HTML parse. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)theme=(dark|light)/);if(m){document.documentElement.setAttribute('data-theme',m[1]);}}catch(e){}})();`,
          }}
        />
        <TrackerProvider>
          <AuthGate>{children}</AuthGate>
        </TrackerProvider>
      </body>
    </html>
  );
}
