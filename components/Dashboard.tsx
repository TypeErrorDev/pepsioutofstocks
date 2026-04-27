"use client";
import React from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  Package,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import LogTable from "./LogTable";
import StockoutForm from "./StockoutForm";

export default function Dashboard() {
  const { profile, logs } = useTracker();

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-12 space-y-6 md:space-y-10">

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

        {/* Left Section: The Stockout Form */}
        <section className="lg:col-span-4 lg:sticky lg:top-6 order-2 lg:order-1">
          <div className="bg-slate-900 border border-slate-800 p-6 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pepsi-blue/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
            <StockoutForm />
          </div>
        </section>

        {/* Right Section: The Live Feed Table */}
        <section className="lg:col-span-8 order-1 lg:order-2 h-full min-h-[400px] md:min-h-[800px]">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden h-full flex flex-col relative transition-colors">
            <LogTable />
          </div>
        </section>

      </main>

      {/* --- FOOTER: Verified Identity Data --- */}
      <footer className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
            Verified Terminal: {profile?.full_name}
          </span>
          <span className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
            GPID: {profile?.gpid}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
            System Ready
          </span>
        </div>
      </footer>
    </div>
  );
}

/**
 * REUSABLE STAT CARD
 * Locked to Slate palette for permanent dark theme.
 */
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg min-w-[200px] md:min-w-0 flex-1 transition-all hover:border-slate-700">
      <div className={`${color} mb-3`}>{icon}</div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
        {title}
      </p>
      <h3 className="text-3xl font-black text-slate-50 italic tracking-tighter leading-none">
        {value}
      </h3>
    </div>
  );
}