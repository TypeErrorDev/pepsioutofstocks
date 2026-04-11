"use client";
import React, { useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import StockoutForm from "./StockoutForm";
import LogTable from "./LogTable";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart3,
  LogOut,
  PackageSearch,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const { userName, logs, archiveLogs } = useTracker();
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = () => {
    localStorage.removeItem("pepsi_user");
    window.location.reload();
  };

  const highPriorityCount = logs.filter((l) => l.priority === "High").length;

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Pro Brand Sidebar */}
      <aside className="w-72 bg-[#004C97] text-white hidden lg:flex flex-col shadow-xl">
        <div className="p-8">
          <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/20">
            <div className="bg-white h-10 w-10 rounded-lg flex items-center justify-center">
              <div className="bg-[#E31837] h-6 w-6 rounded-full" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">PepsiCo</h2>
              <p className="text-blue-200 text-[10px] uppercase tracking-widest font-semibold">
                Merchandiser v1.0
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          <NavButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={<LayoutDashboard size={20} />}
            label="Field Overview"
          />
          <NavButton
            active={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
            icon={<BarChart3 size={20} />}
            label="Trend Insights"
          />
          <NavButton
            active={activeTab === "archive"}
            onClick={() => setActiveTab("archive")}
            icon={<History size={20} />}
            label="History"
          />
        </nav>

        <div className="p-6 mt-auto">
          <div className="bg-blue-900/50 rounded-2xl p-4 border border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#E31837] border-2 border-white flex items-center justify-center font-bold">
                {userName?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-blue-300">Logged in as</p>
                <p className="font-bold truncate">{userName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-all"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Daily Route Dashboard
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Tracking stockouts for{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <button
            onClick={archiveLogs}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E31837] text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
          >
            <History size={18} />
            Archive Active Route
          </button>
        </header>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              label="Active Alerts"
              value={logs.length}
              icon={<PackageSearch className="text-blue-600" />}
              trend="+2 from yesterday"
              color="bg-blue-50"
            />
            <StatCard
              label="Urgent Action"
              value={highPriorityCount}
              icon={<AlertCircle className="text-red-600" />}
              trend="Requires Immediate Visit"
              color="bg-red-50"
            />
            <StatCard
              label="Avg Days OOS"
              value="2.4"
              icon={<TrendingUp className="text-emerald-600" />}
              trend="Down 12%"
              color="bg-emerald-50"
            />
          </div>

          {/* Dual Panel Workspace */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left: Log Form */}
            <div className="xl:col-span-4">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <PlusCircle size={18} className="text-[#004C97]" />
                    Record New Stockout
                  </h3>
                </div>
                <div className="p-6">
                  <StockoutForm />
                </div>
              </div>
            </div>

            {/* Right: Active Log Table */}
            <div className="xl:col-span-8">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden h-full">
                <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <LayoutDashboard size={18} className="text-[#004C97]" />
                    Current Route Impact
                  </h3>
                  <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-[#004C97] rounded-full">
                    {logs.length} ITEMS DETECTED
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <LogTable />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Sub-components
function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl transition-all duration-200 ${
        active
          ? "bg-white text-[#004C97] shadow-xl translate-x-2"
          : "text-blue-100 hover:bg-blue-800/50"
      }`}
    >
      <span className={`${active ? "text-[#E31837]" : ""}`}>{icon}</span>
      <span className="font-bold text-sm tracking-wide">{label}</span>
    </button>
  );
}

function StatCard({ label, value, icon, trend, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-4xl font-black text-slate-800">{value}</p>
        <p className="text-[10px] font-bold mt-2 text-slate-500 uppercase">
          {trend}
        </p>
      </div>
      <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
    </div>
  );
}
