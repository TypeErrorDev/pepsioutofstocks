"use client";
import React from "react";
import { useTracker } from "@/context/TrackerContext";
import { Package, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import LogTable from "./LogTable";
import StockoutForm from "./StockoutForm";

export default function Dashboard() {
  const { profile, logs } = useTracker();
  const displayName = profile?.full_name?.split(" ")[0] || "Personnel";

  return (
    <div className="space-y-6 md:space-y-10 pb-10">
      {/* MOBILE-FIRST HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-pepsi-blue">
            <Activity size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">
              Operational Command
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
            Welcome, <span className="text-pepsi-blue">{displayName}</span>
          </h2>
        </div>

        {/* COMPACT SYNC STATUS */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 border border-emerald-500/20 w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
            Linked
          </span>
        </div>
      </header>

      {/* STATS: SCROLLABLE ON MOBILE, GRID ON DESKTOP */}
      <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-4 pb-4 md:pb-0 custom-scrollbar scroll-smooth">
        <StatCard
          title="Total Logs"
          value={logs.length}
          icon={<Package size={18} />}
          color="text-pepsi-blue"
        />
        <StatCard
          title="OOS Gaps"
          value={logs.filter((l) => l.root_cause !== "In Backstock").length}
          icon={<AlertTriangle size={18} />}
          color="text-pepsi-red"
        />
        <StatCard
          title="Backstock"
          value={logs.filter((l) => l.root_cause === "In Backstock").length}
          icon={<CheckCircle size={18} />}
          color="text-emerald-500"
        />
      </div>

      {/* MAIN CONTENT AREA: STACKED ON MOBILE, ASIDE ON DESKTOP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FORM: STICKY ON DESKTOP */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 order-2 lg:order-1">
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2rem] shadow-2xl">
            <StockoutForm />
          </div>
        </div>

        {/* LIVE STREAM: PRIMARY FOCUS ON MOBILE */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden min-h-[400px]">
            <LogTable />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl min-w-[160px] md:min-w-0 flex-1 transition-all">
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 whitespace-nowrap">
        {title}
      </p>
      <h3 className="text-2xl font-black text-white italic tracking-tighter">
        {value}
      </h3>
    </div>
  );
}
