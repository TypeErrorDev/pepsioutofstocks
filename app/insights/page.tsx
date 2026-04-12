"use client";
import React from "react";
import Link from "next/link";
import Insights from "@/components/Insights";
import { ArrowLeft, BarChart3, ShieldCheck } from "lucide-react";

export default function InsightsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Navigation & Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-pepsi-blue">
              <BarChart3 size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Corporate Systems
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Inventory <span className="text-pepsi-blue">Analysis</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-md">
              Real-time route mitigation and shelf-availability forecasting for
              merchandising operations.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
            >
              <ArrowLeft size={14} />
              Back to Field Entry
            </Link>
            <div className="hidden sm:flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-500 uppercase">
                Secure Data Link
              </span>
            </div>
          </div>
        </header>

        {/* The Insights Component */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Insights />
        </section>

        {/* Footer for Manager Presentation */}
        <footer className="mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">
            PepsiCo Field Ops Dashboard • v2.4.0
          </p>
          <div className="flex gap-6">
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest cursor-default">
              Privacy Policy
            </span>
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest cursor-default">
              Internal Audit Terms
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
