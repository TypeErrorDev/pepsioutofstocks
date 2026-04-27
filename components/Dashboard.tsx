"use client";
import React, { useEffect, useState, useRef } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  Activity,
  Sun,
  Moon,
  LogOut,
  BarChart3,
  User,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import LogTable from "./LogTable";
import StockoutForm from "./StockoutForm";

export default function Dashboard() {
  const { profile, logs, signOut } = useTracker();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayName = profile?.full_name || "Matt Pantel";

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-app-bg transition-colors duration-300 p-4 md:p-8 lg:p-12">
      <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-10">

        {/* --- HEADER SECTION: Forced to top with relative z-50 --- */}
        <header className="relative z-50 flex flex-row items-center justify-between gap-6">
          <div className="space-y-1">
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

          <div className="flex items-center gap-4 relative" ref={menuRef}>
            <Link
              href="/insights"
              className="hidden md:flex flex-col items-center justify-center px-6 py-2 bg-app-card border border-app-border rounded-2xl hover:border-pepsi-blue transition-all"
            >
              <span className="text-[9px] font-black uppercase text-pepsi-blue tracking-widest">Analytics</span>
              <span className="text-[8px] font-bold uppercase text-app-muted">Reporting</span>
            </Link>

            {/* IDENTITY TRIGGER: Added cursor-pointer and specific z-index */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="relative z-[60] flex items-center gap-3 bg-app-card border border-app-border p-1.5 pr-4 rounded-full shadow-lg hover:border-app-text/20 transition-all active:scale-95 cursor-pointer"
            >
              <div className="pointer-events-none w-10 h-10 bg-app-bg border border-app-border rounded-full flex items-center justify-center text-pepsi-blue shadow-inner">
                <User size={20} />
              </div>
              <div className="pointer-events-none hidden sm:flex flex-col items-start leading-none">
                <span className="text-[10px] font-black uppercase text-app-text tracking-tight">
                  {displayName}
                </span>
                <span className="text-[8px] font-bold text-emerald-500 tracking-widest uppercase">
                  Online
                </span>
              </div>
              <ChevronDown size={14} className={`pointer-events-none text-app-muted transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* DROPDOWN MENU: Forced visibility with forced z-index */}
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-app-card border border-app-border rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] py-3 z-[100] animate-in fade-in zoom-in duration-200">
                <div className="px-5 py-2 mb-2 border-b border-app-border/50">
                  <p className="text-[8px] font-black text-app-muted uppercase tracking-widest">System Settings</p>
                </div>

                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-app-bg/50 transition-colors text-app-text group"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-pepsi-blue" />}
                    <span className="text-[10px] font-black uppercase tracking-tight">Mode: {theme}</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-pepsi-blue' : 'bg-slate-400'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>

                <Link href="/insights" className="md:hidden w-full px-5 py-4 flex items-center gap-3 hover:bg-app-bg/50 transition-colors text-app-text">
                  <BarChart3 size={18} className="text-pepsi-blue" />
                  <span className="text-[10px] font-black uppercase tracking-tight">Analytics</span>
                </Link>

                <div className="mx-3 my-2 border-t border-app-border/50" />

                <button
                  onClick={signOut}
                  className="w-full px-5 py-4 flex items-center gap-3 hover:bg-pepsi-red/10 text-app-muted hover:text-pepsi-red transition-colors"
                >
                  <LogOut size={18} />
                  <span className="text-[10px] font-black uppercase tracking-tight">Log Out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* --- STATS OVERVIEW --- */}
        <div className="relative z-10 flex overflow-x-auto md:grid md:grid-cols-3 gap-4 pb-4 md:pb-0 custom-scrollbar scroll-smooth">
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

        {/* --- MAIN INTERFACE --- */}
        <main className="relative z-0 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start pb-10">
          <section className="lg:col-span-4 lg:sticky lg:top-6 order-2 lg:order-1">
            <div className="bg-app-card border border-app-border p-6 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden transition-colors">
              <StockoutForm />
            </div>
          </section>

          <section className="lg:col-span-8 order-1 lg:order-2 h-full min-h-[400px] md:min-h-[800px]">
            <div className="bg-app-card border border-app-border rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col relative transition-colors">
              <LogTable />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-app-card border border-app-border p-6 rounded-2xl shadow-lg min-w-[200px] md:min-w-0 flex-1 transition-all hover:border-app-text/10">
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-[9px] font-black text-app-muted uppercase tracking-widest mb-1">
        {title}
      </p>
      <h3 className="text-3xl font-black text-app-text italic tracking-tighter leading-none">
        {value}
      </h3>
    </div>
  );
}