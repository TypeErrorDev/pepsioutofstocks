"use client";
import React from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Clock,
  MapPin,
} from "lucide-react";

export default function Dashboard() {
  // FIX: Destructure profile and logs (matching TrackerContextType)
  const { profile, logs } = useTracker();

  // FIX: Get the name from the profile object safely
  const displayName = profile?.full_name || "Merchandiser";

  // Calculations based on the logs array
  const totalActive = logs.length;
  const recentLogs = logs.slice(0, 5);

  return (
    <div className="space-y-10">
      {/* WELCOME SECTION */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-pepsi-blue uppercase tracking-[0.4em] mb-2">
            Operational Command
          </p>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Welcome, <span className="text-pepsi-blue">{displayName}</span>
          </h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-4">
          <Clock className="text-slate-500" size={16} />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Stockouts"
          value={totalActive}
          icon={<AlertTriangle size={20} />}
          color="text-pepsi-red"
        />
        <StatCard
          title="Market Coverage"
          value={new Set(logs.map((l) => l.store)).size}
          icon={<MapPin size={20} />}
          color="text-pepsi-blue"
        />
        <StatCard
          title="Sync Status"
          value="Live"
          icon={<CheckCircle size={20} />}
          color="text-emerald-500"
        />
      </div>

      {/* RECENT ACTIVITY STREAM */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Recent Field Logs
          </h3>
          <TrendingUp className="text-slate-700" size={18} />
        </div>

        <div className="space-y-4">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-pepsi-blue">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase">
                      {log.brand} {log.pack_type}
                    </p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                      {log.store} • {log.location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-pepsi-blue uppercase">
                    {log.root_cause}
                  </p>
                  <p className="text-[8px] font-bold text-slate-600 uppercase italic">
                    {new Date(log.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-10 text-slate-600 font-black uppercase text-[10px] tracking-widest">
              No active logs in current stream
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl group hover:border-slate-700 transition-all">
      <div
        className={`mb-4 ${color} opacity-80 group-hover:opacity-100 transition-opacity`}
      >
        {icon}
      </div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
        {title}
      </p>
      <h4 className="text-3xl font-black text-white tracking-tighter">
        {value}
      </h4>
    </div>
  );
}
