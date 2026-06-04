"use client";
import React from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  Package,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import StockoutForm from "./StockoutForm";
import LogTable from "./LogTable";

export default function Dashboard() {
  const { profile, logs } = useTracker();

  // Logic: Only count logs that are NOT hidden
  const activeLogs = logs.filter((l) => !l.is_hidden);

  const totalLogs = activeLogs.length;

  // Logic: Separate logistical issues (Logistical Gaps) from simple backstock issues (Service Gaps)
  const logisticalGaps = activeLogs.filter(
    (l) => l.root_cause !== "Backstock",
  ).length;

  const serviceGaps = activeLogs.filter(
    (l) => l.root_cause === "Backstock",
  ).length;

  return (
    <div className="max-w-400 mx-auto p-4 md:p-8 lg:p-12 space-y-6 md:space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-pepsi-blue text-[10px] font-black uppercase tracking-[0.3em]">
            <div className="w-8 h-0.5 bg-pepsi-blue" />
            Alpha Achievers
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-app-text">
            Shelf <span className="text-pepsi-blue">Health</span>
          </h1>
          <p className="text-app-muted text-xs font-bold uppercase tracking-widest">
            {profile?.full_name} | GPID: {profile?.gpid}
          </p>
        </div>

        <Link
          href="/insights"
          className="group flex items-center gap-3 bg-app-card border border-app-border px-6 py-4 rounded-2xl hover:border-pepsi-blue transition-all duration-300 shadow-lg"
        >
          <div className="p-2 bg-app-bg rounded-xl group-hover:text-pepsi-blue transition-colors">
            <TrendingUp size={20} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-app-muted uppercase mb-1">
              Market Analysis
            </p>
            <p className="text-sm font-black text-app-text uppercase italic">
              Insights
            </p>
          </div>
        </Link>
      </header>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Active Field Logs"
          value={totalLogs}
          icon={<Package size={20} />}
          color="text-pepsi-blue"
        />
        <StatCard
          title="Logistical Gaps"
          value={logisticalGaps}
          icon={<AlertCircle size={20} />}
          color="text-pepsi-red"
        />
        <StatCard
          title="Service Gaps"
          value={serviceGaps}
          icon={<CheckCircle2 size={20} />}
          color="text-emerald-500"
        />
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start pb-10">
        <div className="lg:col-span-4 lg:sticky lg:top-8">
          <div className="bg-app-card border border-app-border p-6 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pepsi-blue/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
            <StockoutForm />
          </div>
        </div>
        <div className="lg:col-span-8 bg-app-card border border-app-border rounded-[2.5rem] shadow-2xl overflow-hidden min-h-150 flex flex-col">
          <LogTable />
        </div>
      </main>

      <footer className="pt-10 border-t border-app-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-black text-app-muted uppercase tracking-[0.3em]">
            Verified Terminal: {profile?.full_name}
          </span>
          <span className="w-1.5 h-1.5 bg-app-border rounded-full" />
          <span className="text-[9px] font-black text-app-muted uppercase tracking-[0.3em]">
            GPID: {profile?.gpid}
          </span>
          <span className="text-[9px] font-black text-app-muted uppercase tracking-[0.3em]">
            ©2026{" "}
            <a target="_blank" href="https://www.x.com/TypeErrorDev">
              TypeErrorDev
            </a>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-app-muted uppercase tracking-[0.3em]">
            System Active
          </span>
        </div>
      </footer>
    </div>
  );
}

// Reusable StatCard Component
function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-app-card border border-app-border p-6 rounded-4xl shadow-xl transition-all hover:scale-[1.02]">
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-[10px] font-black text-app-muted uppercase tracking-widest mb-1">
        {title}
      </p>
      <h3 className="text-4xl font-black text-app-text italic tracking-tighter leading-none">
        {value}
      </h3>
    </div>
  );
}
