"use client";
import React from "react";
import { useTracker } from "@/context/TrackerContext";
import LoginView from "./LoginView";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useTracker();

  // 1. Initial Load / Refresh Hang Prevention
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-pepsi-blue/20 border-t-pepsi-blue rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">
          Operational Sync...
        </p>
      </div>
    );
  }

  // 2. Authorization Check
  // We must have both a session (user) and a database record (profile)
  if (!user || !profile) {
    return <LoginView />;
  }

  // 3. Render Dashboard/App
  return <>{children}</>;
}