"use client";
import React, { useMemo, useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ArrowLeft,
  X,
  MapPin,
  Info,
  Activity,
  ShoppingCart,
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";

const COLORS = ["#005eb8", "#e6192e", "#059669", "#d97706", "#7c3aed"];

export default function Insights() {
  const { logs, loading } = useTracker();
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const analytics = useMemo(() => {
    if (!logs || logs.length === 0) return null;

    const storeMap: Record<string, any> = {};
    const itemAnalysis: Record<
      string,
      { name: string; count: number; stores: Set<string> }
    > = {};

    logs.forEach((l) => {
      if (!storeMap[l.store]) {
        storeMap[l.store] = {
          name: l.store,
          totalLogs: 0,
          serviceGaps: 0,
          stockouts: 0,
          rawLogs: [],
        };
      }
      const s = storeMap[l.store];
      s.totalLogs++;
      s.rawLogs.push(l);
      if (l.root_cause === "In Backstock") s.serviceGaps++;
      else s.stockouts++;

      const itemKey = `${l.brand} ${l.pack_type}`;
      if (!itemAnalysis[itemKey]) {
        itemAnalysis[itemKey] = { name: itemKey, count: 0, stores: new Set() };
      }
      itemAnalysis[itemKey].count++;
      itemAnalysis[itemKey].stores.add(l.store);
    });

    const directives = Object.values(storeMap)
      .map((s: any) => {
        let priority = "Routine";
        let action = "Standard Replenishment";
        if (s.stockouts > 4) {
          priority = "High";
          action = "Immediate Par Increase Required";
        } else if (s.serviceGaps > 2) {
          priority = "Urgent";
          action = "Service Routine Audit";
        }
        return { ...s, priority, action };
      })
      .sort((a, b) => b.totalLogs - a.totalLogs);

    const chartData = Object.values(itemAnalysis)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { directives, chartData, total: logs.length };
  }, [logs]);

  const modalData = useMemo(() => {
    if (!selectedStore || !analytics) return null;
    return analytics.directives.find((s) => s.name === selectedStore);
  }, [selectedStore, analytics]);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-pepsi-blue/20 border-t-pepsi-blue rounded-full animate-spin" />
      </div>
    );

  if (!analytics)
    return (
      <div className="max-w-[1400px] mx-auto p-10 text-center border-2 border-dashed border-slate-800 rounded-[3rem] mt-10">
        <Activity className="mx-auto text-slate-800 mb-4" size={48} />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Awaiting Live Field Data
        </p>
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-6 md:py-10 space-y-6 md:space-y-10 pb-24 relative">
      <header className="flex items-center gap-4">
        <Link
          href="/"
          className="p-3 md:p-4 bg-slate-900 border border-slate-800 rounded-2xl md:rounded-[1.5rem] text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-pepsi-blue mb-0.5">
            <LayoutDashboard size={12} />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">
              Market Overview
            </span>
          </div>
          <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter italic text-white">
            Sales & Service <span className="text-pepsi-blue">Directives</span>
          </h1>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-[2rem] shadow-xl min-h-[300px]">
          <h3 className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">
            Volume Risk by SKU
          </h3>
          <div className="h-[200px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.chartData}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fill: "#64748b", fontSize: 9, fontWeight: 900 }}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "10px",
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                  {analytics.chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-7 bg-pepsi-blue p-6 md:p-10 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-center">
          <Activity
            className="absolute right-[-10px] bottom-[-10px] text-white/10"
            size={150}
          />
          <div className="relative z-10">
            <h3 className="text-white font-black uppercase italic tracking-tighter text-xl md:text-2xl mb-2">
              Replenishment Priority
            </h3>
            <p className="text-white/80 text-xs md:text-sm font-bold leading-relaxed mb-6 max-w-lg">
              Cross-referencing {analytics.total} field observations. Priority
              stores require handheld inventory corrections to fix replenishment
              cycles.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
                {
                  analytics.directives.filter((d) => d.priority === "High")
                    .length
                }{" "}
                High Priority
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
                {
                  analytics.directives.filter((d) => d.priority === "Urgent")
                    .length
                }{" "}
                Service Gaps
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="p-6 md:p-8 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tighter">
            Account Priority Index
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[650px]">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Store
                </th>
                <th className="w-[140px] p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">
                  Priority
                </th>
                <th className="w-[280px] p-6 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Direct Action
                </th>
                <th className="w-[80px] p-6 text-right text-[9px] font-black text-slate-500 uppercase tracking-widest text-transparent">
                  View
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {analytics.directives.map((store, i) => (
                <tr
                  key={i}
                  className="hover:bg-slate-800/20 transition-all group h-16"
                >
                  <td className="p-6">
                    <span className="text-sm font-black text-white uppercase tracking-tight">
                      #{store.name}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border ${
                        store.priority === "High"
                          ? "bg-pepsi-red/10 text-pepsi-red border-pepsi-red/20"
                          : store.priority === "Urgent"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {store.priority}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col whitespace-nowrap">
                      <span className="text-[11px] font-black text-white uppercase italic tracking-tight">
                        {store.action}
                      </span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">
                        {store.totalLogs} Field Logs
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button
                      onClick={() => setSelectedStore(store.name)}
                      className="p-3 bg-slate-800 hover:bg-pepsi-blue text-white rounded-xl transition-all"
                    >
                      <Info size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedStore && modalData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            onClick={() => setSelectedStore(null)}
          />
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col max-h-[90vh]">
            <header className="p-6 md:p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3 text-white">
                <ShoppingCart size={20} className="text-pepsi-blue" />
                <h2 className="text-lg md:text-2xl font-black uppercase italic tracking-tighter">
                  Directives: #{selectedStore}
                </h2>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
              >
                <X size={20} />
              </button>
            </header>
            <div className="p-6 md:p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <h4 className="text-[9px] font-black text-pepsi-blue uppercase mb-3 tracking-widest flex items-center gap-2">
                    <RefreshCw size={12} /> Inventory Correction
                  </h4>
                  <p className="text-xs md:text-sm text-white font-bold leading-relaxed italic">
                    Verified Stockouts: {modalData.stockouts}. Action: Zero the
                    inventory count in handheld to trigger replenishment.
                  </p>
                </div>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <h4 className="text-[9px] font-black text-amber-500 uppercase mb-3 tracking-widest flex items-center gap-2">
                    <AlertCircle size={12} /> Service Efficiency
                  </h4>
                  <p className="text-xs md:text-sm text-white font-bold leading-relaxed italic">
                    Service Gaps: {modalData.serviceGaps}. Action: Confirm
                    backroom inventory was pulled before merchandiser
                    end-of-shift.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Verified Field Logs
                </h4>
                {modalData.rawLogs.map((log: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-white uppercase truncate">
                        {log.brand} {log.pack_type}
                      </p>
                      <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest truncate">
                        {log.location}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[9px] font-black text-pepsi-blue uppercase">
                        {log.root_cause}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
