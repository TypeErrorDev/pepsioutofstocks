"use client";
import { useTracker } from "@/context/TrackerContext";
import LoginView from "./LoginView";
import { Activity } from "lucide-react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useTracker();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Activity className="text-pepsi-blue animate-pulse" size={40} />
        <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">
          Loading Tracker...
        </p>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return <>{children}</>;
}
