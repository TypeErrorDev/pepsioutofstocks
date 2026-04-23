"use client";
import React, { useEffect, useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  Activity,
  Sun,
  Moon,
  LogOut,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import LogTable from "./LogTable";
import StockoutForm from "./StockoutForm";

/**
 * THEME TOGGLE COMPONENT
 * Added relative positioning and z-index to ensure visibility
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative z-50 p-2.5 rounded-xl bg-app-card border border-app-border text-app-muted hover:text-pepsi-blue transition-all active:scale-95 shadow-lg flex items-center justify-center"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export default function Dashboard() {
  const { profile, logs, signOut } = useTracker();
  const displayName = profile?.full_name || "Matt Pantel";

  return (
    <div className="min-h-screen bg-app-bg transition-colors duration-300 p-4 md:p-8 lg:p-12">
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-10">

        {/* HEADER: Explicitly structured to force visibility on the right side */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 self-start">
            <div className="flex items-center gap-2 text-pepsi-blue">
              <Activity size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Secure Session Active
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-app-text uppercase italic tracking-tighter leading-none">
              Field <span className="text-pepsi-blue">Operations</span>
            </h2>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* THEME TOGGLE: Forced inline with the other header elements */}
            <ThemeToggle />

            <Link
              href="/insights"
              className="hidden md:flex flex-col items-center justify-center px-6 py-2 bg-app-card border border-app-border rounded-2xl hover:border-pepsi-blue transition-all"
            >
              <span className="text-[9px] font-black uppercase text-pepsi-blue tracking-widest">Analytics Dashboard</span>
              <span className="text-[8px] font-bold uppercase text-app-muted">Admin View</span>
            </Link>

            {/* IDENTITY BLOCK: Verified against your screenshot */}
            <div className="flex items-center gap-3 bg-app-card border border-app-border p-1.5 pr-4 rounded-full shadow-xl">
              <div className="flex flex-col items-end pl-4">
                <span className="text-[10px] font-black uppercase text-app-text tracking-tight leading-none">
                  {displayName}
                </span>
                <span className="text-[8px] font-bold text-emerald-500 tracking-widest uppercase">
                  GPID: {profile?.gpid || "81259099"}
                </span>
              </div>
              <button
                onClick={signOut}
                className="w-10 h-10 bg-app-bg border border-app-border rounded-full flex items-center justify-center text-app-muted hover:text-pepsi-red transition-all"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* STATS OVERVIEW */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-4 pb-4 md:pb-0 custom-scrollbar scroll-smooth">
          <StatCard
            title="Total Field Logs"
            value={logs.length}
            icon={<Package size={18} />}
            color="text-pepsi-blue"
          />
          <StatCard
            title="Logistical Gaps"
            value={logs.filter((l) => l.root_cause !== "Backstock").length}
            icon={<AlertTriangle size={18} />}
            color="text-pepsi-red"
          />
          <StatCard
            title="Service Gaps"
            value={logs.filter((l) => l.root_cause === "Backstock").length}
            icon={<CheckCircle size={18} />}
            color="text-emerald-500"
          />
        </div>

        {/* MAIN INTERFACE */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start pb-10">
          <section className="lg:col-span-4 lg:sticky lg:top-6 order-2 lg:order-1">
            <div className="bg-app-card border border-app-border p-6 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pepsi-blue/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
              <StockoutForm />
            </div>
          </section>

          <section className="lg:col-span-8 order-1 lg:order-2 h-full min-h-[400px] md:min-h-[800px]">
            <div className="bg-app-card border border-app-border rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col relative transition-colors">
              <LogTable />
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="pt-6 border-t border-app-border flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-black text-app-muted uppercase tracking-[0.3em]">
              Verified Terminal: {profile?.full_name}
            </span>
            <span className="w-1.5 h-1.5 bg-app-border rounded-full" />
            <span className="text-[9px] font-black text-app-muted uppercase tracking-[0.3em]">
              GPID: {profile?.gpid}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-app-muted uppercase tracking-[0.3em]">
              System Ready
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

/**
 * REUSABLE STAT CARD
 */
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-app-card border border-app-border p-6 rounded-2xl shadow-lg min-w-[200px] md:min-w-0 flex-1 transition-all hover:border-app-text/10">
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-[9px] font-black text-app-muted uppercase tracking-widest mb-1">
        {title}
      </p>
      <h3 className="text-3xl font-black text-app-text italic tracking-tighter">
        {value}
      </h3>
    </div>
  );
}