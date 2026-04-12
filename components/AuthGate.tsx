"use client";
import React from "react";
import { useTracker } from "@/context/TrackerContext";
import { usePathname } from "next/navigation";
import LoginPage from "@/app/login/page"; // Adjust this path to your actual login component

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useTracker();
  const pathname = usePathname();

  // 1. Handle the Loading State
  // Prevents the "Flash" of the login screen while checking the session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-pepsi-blue/20 border-t-pepsi-blue rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">
          Authenticating...
        </p>
      </div>
    );
  }

  // 2. Allow access to the login page itself (to prevent infinite loops)
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // 3. The Hard Gate
  // If no user session is found, force the Login UI
  if (!user) {
    return <LoginPage />;
  }

  // 4. Authorized
  return <>{children}</>;
}
