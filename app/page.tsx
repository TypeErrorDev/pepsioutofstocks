"use client";
import React from "react";
import Link from "next/link";
import StockoutForm from "@/components/StockoutForm";
import LogTable from "@/components/LogTable";
import { useTracker } from "@/context/TrackerContext";
import {
  ChevronRight,
  LayoutDashboard,
  BarChart3,
  User as UserIcon,
  LogOut,
} from "lucide-react";

export default function DashboardPage() {
  const { userName } = useTracker();

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-pepsi-blue/30">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-10">
        {/* Global Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-pepsi-blue mb-1">
              <LayoutDashboard size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Operational Portal
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
              Field <span className="text-pepsi-blue">Operations</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Professional Link to Analytics */}
            <Link
              href="/insights"
              className="flex items-center gap-3 px-6 py-3 bg-pepsi-blue/10 border border-pepsi-blue/20 rounded-2xl group transition-all hover:bg-pepsi-blue/20 active:scale-95"
            >
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-pepsi-blue uppercase tracking-widest">
                  Management View
                </span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">
                  Analysis Dashboard
                </span>
              </div>
              <div className="p-2 bg-pepsi-blue rounded-xl shadow-lg shadow-blue-900/40">
                <BarChart3
                  size={18}
                  className="text-white group-hover:scale-110 transition-transform"
                />
              </div>
            </Link>

            {/* User Profile / Status */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                  {userName || "Guest"}
                </span>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                  Active Route
                </span>
              </div>
              <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                <UserIcon size={18} className="text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Data Entry (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-10">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              {/* Subtle Brand Watermark */}
              <div className="absolute -top-10 -right-10 opacity-[0.03] pointer-events-none">
                <LayoutDashboard size={200} />
              </div>

              <StockoutForm />
            </div>

            {/* Quick Action / Help Card */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-emerald-500/10 transition-colors">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  Route Assistance
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  Need to update store lists?
                </p>
              </div>
              <ChevronRight
                size={20}
                className="text-emerald-500 group-hover:translate-x-1 transition-transform"
              />
            </div>
          </div>

          {/* Right Column: Active Log (8 Cols) */}
          <div className="lg:col-span-8 h-full min-h-[600px]">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl h-full flex flex-col overflow-hidden">
              <LogTable />
            </div>
          </div>
        </div>

        {/* System Footer */}
        <footer className="mt-12 py-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">
              Verified Data Stream
            </span>
            <div className="h-1 w-1 rounded-full bg-slate-800" />
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">
              Version 2.4.0
            </span>
          </div>
          <button className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-pepsi-red transition-colors">
            <LogOut size={12} />
            Sign Out Session
          </button>
        </footer>
      </div>
    </main>
  );
}
