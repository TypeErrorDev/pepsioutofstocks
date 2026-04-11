"use client";
import React from "react";
import { useTracker } from "@/context/TrackerContext";
import StockoutForm from "./StockoutForm";
import LogTable from "./LogTable";
import {
  LayoutDashboard,
  History,
  BarChart3,
  LogOut,
  PackageSearch,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const { userName, logs, archiveLogs } = useTracker();
  const highPriorityCount = logs.filter((l) => l.priority === "High").length;

  const handleLogout = () => {
    localStorage.removeItem("pepsi_user");
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Brand Pepsi Blue */}
      <aside className="w-72 bg-pepsi-blue text-white hidden lg:flex flex-col shadow-2xl shrink-0">
        <div className="p-8">
          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/20">
            <div className="bg-white h-10 w-10 rounded-lg flex items-center justify-center shrink-0">
              <div className="bg-pepsi-red h-6 w-6 rounded-full" />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tighter">
              PepsiCo
            </h2>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavButton
            active
            icon={<LayoutDashboard size={20} />}
            label="Field Overview"
          />
          <NavButton icon={<BarChart3 size={20} />} label="Analytics" />
          <NavButton icon={<History size={20} />} label="History" />
        </nav>

        <div className="p-6">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-sm font-bold transition-all border border-white/10 cursor-pointer"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Command Center */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between px-10 shrink-0 backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Route Dashboard
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
              {userName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={archiveLogs}
              className="flex items-center gap-2 px-6 py-2.5 bg-pepsi-red text-white rounded-xl font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <History size={18} /> Archive Route
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Active Alerts"
              value={logs.length}
              icon={<PackageSearch />}
              color="text-blue-400 bg-blue-500/10"
            />
            <StatCard
              label="Urgent Action"
              value={highPriorityCount}
              icon={<AlertCircle />}
              color="text-red-400 bg-red-500/10"
            />
            <StatCard
              label="Days OOS Avg"
              value="2.4"
              icon={<TrendingUp />}
              color="text-emerald-400 bg-emerald-500/10"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-10">
            {/* Form Section */}
            <div className="xl:col-span-4 bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-xl">
              <StockoutForm />
            </div>
            {/* Table Section */}
            <div className="xl:col-span-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-xl overflow-hidden">
              <LogTable />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-slate-900 p-7 rounded-[2.5rem] border border-slate-800 flex items-center justify-between shadow-lg">
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-4xl font-black text-white">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
    </div>
  );
}

function NavButton({ active, icon, label }: any) {
  return (
    <button
      className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all cursor-pointer ${active ? "bg-white text-pepsi-blue shadow-xl" : "text-blue-100 hover:bg-white/10"}`}
    >
      {icon} <span className="font-bold text-sm tracking-wide">{label}</span>
    </button>
  );
}
