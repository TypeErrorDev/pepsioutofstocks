"use client";
import React from "react";
import { useTracker } from "@/context/TrackerContext";
import Dashboard from "@/components/Dashboard";
import { LogOut, User } from "lucide-react";

export default function Home() {
  // Auth + loading are handled by <AuthGate> in the layout, so this page only
  // ever renders for a signed-in user.
  const { profile, signOut } = useTracker();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-pepsi-blue/30">
      {/* --- SINGLE PERSISTENT HEADER --- */}
      <div className="max-w-400 mx-auto p-4 md:p-8 lg:p-12 pb-0">
        <header className="relative z-50 flex flex-row items-center justify-end gap-6">
          <div className="flex items-center gap-4">
            {/* Identity Block */}
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-1.5 pr-4 rounded-full shadow-lg">
              <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-pepsi-blue shadow-inner">
                <User size={20} />
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none pr-2">
                <span className="text-[10px] font-black uppercase tracking-tight">
                  {profile?.full_name ?? "—"}
                </span>
                <span className="text-[8px] font-bold text-emerald-500 tracking-widest uppercase">
                  GPID: {profile?.gpid ?? "—"}
                </span>
              </div>
            </div>

            {/* PRONOUNCED SIGN OUT BUTTON */}
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-pepsi-red hover:border-pepsi-red/30 transition-all active:scale-95 group shadow-xl"
            >
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-pepsi-red transition-colors">
                Sign Out
              </span>
              <LogOut
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </header>
      </div>

      {/* Renders Dashboard content without its own header */}
      <Dashboard />
    </div>
  );
}
