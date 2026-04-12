"use client";
import React from "react";
import { useTracker } from "@/context/TrackerContext";
import LoginView from "./LoginView";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useTracker();

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

  if (!user) {
    return <LoginView />;
  }

  return <>{children}</>;
}
