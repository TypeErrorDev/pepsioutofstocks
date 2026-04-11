import "./globals.css";
import { TrackerProvider } from "@/context/TrackerContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TrackerProvider>{children}</TrackerProvider>
      </body>
    </html>
  );
}
