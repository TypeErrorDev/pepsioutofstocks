"use client";
import React from "react";
import { useTracker } from "@/context/TrackerContext";
import LoginView from "./LoginView";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useTracker();

  // 1. Theme-Responsive Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center transition-colors duration-300">
        <div className="w-10 h-10 border-2 border-pepsi-blue/20 border-t-pepsi-blue rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase text-app-muted tracking-[0.3em]">
          Operational Sync...
        </p>
      </div>
    );
  }

  // 2. Authorization Check
  // If no session exists or profile hasn't synced, show Login
  if (!user || !profile) {
    return <LoginView />;
  }

  // 3. Render Application
  return <>{children}</>;
}