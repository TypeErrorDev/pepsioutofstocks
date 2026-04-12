"use client";
import React from "react";
import { useTracker } from "@/context/TrackerContext";
import { Package, AlertTriangle, Zap, CheckCircle } from "lucide-react";

export default function Dashboard() {
  const { profile, logs } = useTracker();
  const displayName = profile?.full_name || "Personnel";

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black text-pepsi-blue uppercase tracking-[0.4em] mb-2">
            Operational Command
          </p>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Welcome, <span className="text-pepsi-blue">{displayName}</span>
          </h2>
        </div>

        {/* ANIMATED SYNC INDICATOR */}
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] leading-none mb-0.5">
              Live Sync Active
            </span>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              Command Linked
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Market Logs"
          value={logs.length}
          icon={<Package size={24} />}
          color="text-pepsi-blue"
        />
        <StatCard
          title="Critical Gaps"
          value={logs.filter((l) => l.root_cause === "Warehouse OOS").length}
          icon={<AlertTriangle size={24} />}
          color="text-pepsi-red"
        />
        <StatCard
          title="Verified Mitigation"
          value={logs.filter((l) => l.root_cause === "In Backstock").length}
          icon={<CheckCircle size={24} />}
          color="text-emerald-500"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl group transition-all hover:border-slate-700">
      <div
        className={`mb-4 ${color} opacity-80 group-hover:opacity-100 transition-opacity`}
      >
        {icon}
      </div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
        {title}
      </p>
      <h3 className="text-3xl font-black text-white italic tracking-tighter">
        {value}
      </h3>
    </div>
  );
}
