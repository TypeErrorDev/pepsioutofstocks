"use client";
import React, { useState } from "react";
import Link from "next/link";
import StockoutForm from "@/components/StockoutForm";
import LogTable from "@/components/LogTable";
import { useTracker } from "@/context/TrackerContext";
import {
  LayoutDashboard,
  BarChart3,
  User as UserIcon,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function DashboardPage() {
  const { userName, registerUser } = useTracker();
  const [tempName, setTempName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName.trim()) return;
    setIsRegistering(true);
    await registerUser(tempName);
    setIsRegistering(false);
  };

  // --- GATEKEEPER UI (Show if not logged in) ---
  if (!userName) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-pepsi-blue/10 rounded-3xl border border-pepsi-blue/20">
                <ShieldCheck size={40} className="text-pepsi-blue" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              Field <span className="text-pepsi-blue">Ops</span> Portal
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Beverage Merchandising Systems
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-6"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Employee Username
              </label>
              <input
                autoFocus
                type="text"
                placeholder="e.g. jdoe"
                className="w-full bg-slate-800/50 text-white p-4 rounded-2xl border border-slate-700 outline-none focus:border-pepsi-blue focus:bg-slate-800 transition-all font-bold"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
              />
            </div>
            <button
              disabled={isRegistering}
              className="w-full bg-pepsi-blue text-white font-black py-5 rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isRegistering ? "AUTHENTICATING..." : "ACCESS PORTAL"}
              {!isRegistering && <ChevronRight size={18} />}
            </button>
          </form>

          <p className="text-center text-[9px] text-slate-700 font-black uppercase tracking-[0.3em]">
            Internal Use Only • PepsiCo Logistics
          </p>
        </div>
      </main>
    );
  }

  // --- MAIN DASHBOARD UI (Show if logged in) ---
  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-pepsi-blue/30">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-10">
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
            <Link
              href="/insights"
              className="flex items-center gap-3 px-6 py-3 bg-pepsi-blue/10 border border-pepsi-blue/20 rounded-2xl group transition-all hover:bg-pepsi-blue/20"
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
                <BarChart3 size={18} className="text-white" />
              </div>
            </Link>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                  {userName}
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-10">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden">
              <StockoutForm />
            </div>
          </div>

          <div className="lg:col-span-8 min-h-[600px]">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl h-full flex flex-col overflow-hidden">
              <LogTable />
            </div>
          </div>
        </div>

        <footer className="mt-12 py-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-700">
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">
            Verified Data Stream • v2.4.0
          </span>
          <button
            onClick={() => {
              localStorage.removeItem("pepsi_user");
              window.location.reload();
            }}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] hover:text-pepsi-red transition-colors cursor-pointer"
          >
            <LogOut size={12} />
            Sign Out Session
          </button>
        </footer>
      </div>
    </main>
  );
}
