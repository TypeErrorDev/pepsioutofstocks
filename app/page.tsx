"use client";
import React from "react";
import { useTracker } from "@/context/TrackerContext";
import Dashboard from "@/components/Dashboard";
import LoginView from "@/components/LoginView";
import { Activity, LogOut, User } from "lucide-react";

export default function Home() {
  const { user, profile, signOut, loading } = useTracker();
  const displayName = profile?.full_name || "Matt Pantel";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-pepsi-blue/30">
      {/* --- SINGLE PERSISTENT HEADER --- */}
      <div className="max-w-400 mx-auto p-4 md:p-8 lg:p-12 pb-0">
        <header className="relative z-50 flex flex-row items-center justify-between gap-6">
          {/* <div className="space-y-1">
            <div className="flex items-center gap-2 text-pepsi-blue">
              <Activity size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Secure Session Active
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
              Field <span className="text-pepsi-blue">Operations</span>
            </h2>
          </div> */}

          <div className="flex items-center gap-4">
            {/* Identity Block */}
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-1.5 pr-4 rounded-full shadow-lg">
              <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-pepsi-blue shadow-inner">
                <User size={20} />
              </div>
              <div className="hidden sm:flex flex-col items-start leading-none pr-2">
                <span className="text-[10px] font-black uppercase tracking-tight">
                  {displayName}
                </span>
                <span className="text-[8px] font-bold text-emerald-500 tracking-widest uppercase">
                  GPID: {profile?.gpid || "81259099"}
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
