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
  TrendingUp,
  ArrowLeft,
  X,
  MapPin,
  Info,
  Activity,
  ShoppingCart,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

const COLORS = ["#005eb8", "#e6192e", "#059669", "#d97706", "#7c3aed"];

export default function Insights() {
  const { logs, loading } = useTracker();
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const analytics = useMemo(() => {
    if (!logs || logs.length === 0) return null;
    const storeMap: Record<string, any> = {};
    const itemAnalysis: Record<string, any> = {};

    logs.forEach((l) => {
      if (!storeMap[l.store])
        storeMap[l.store] = {
          name: l.store,
          stockouts: 0,
          serviceGaps: 0,
          rawLogs: [],
        };
      const s = storeMap[l.store];
      s.rawLogs.push(l);
      l.root_cause === "In Backstock" ? s.serviceGaps++ : s.stockouts++;

      const itemKey = `${l.brand} ${l.pack_type}`;
      if (!itemAnalysis[itemKey])
        itemAnalysis[itemKey] = { name: itemKey, count: 0 };
      itemAnalysis[itemKey].count++;
    });

    const directives = Object.values(storeMap)
      .map((s: any) => ({
        ...s,
        priority:
          s.stockouts > 4 ? "High" : s.serviceGaps > 2 ? "Urgent" : "Routine",
        action:
          s.stockouts > 4
            ? "Inventory Correction Required"
            : s.serviceGaps > 2
              ? "Service Audit"
              : "Standard Monitor",
      }))
      .sort((a, b) => b.stockouts - a.stockouts);

    return {
      directives,
      chartData: Object.values(itemAnalysis)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };
  }, [logs]);

  const modalData = useMemo(
    () => analytics?.directives.find((s) => s.name === selectedStore),
    [selectedStore, analytics],
  );

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-black text-white italic">
        Syncing Operational Metrics...
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-10 space-y-10">
      <header className="flex items-center gap-4">
        <Link
          href="/"
          className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-black uppercase italic text-white">
          Sales & Service <span className="text-pepsi-blue">Directives</span>
        </h1>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-8 rounded-[2rem]">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">
            SKU OOS Frequency
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fill: "#64748b", fontSize: 9 }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {analytics?.chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-7 bg-pepsi-blue p-10 rounded-[2rem] relative overflow-hidden">
          <Activity
            className="absolute right-[-20px] bottom-[-20px] text-white/10"
            size={150}
          />
          <h3 className="text-white font-black uppercase italic text-2xl mb-4">
            Replenishment Priority
          </h3>
          <p className="text-white/80 text-sm font-bold mb-6">
            High-risk accounts detected. Perform inventory corrections to fix
            replenishment cycles.
          </p>
        </div>
      </section>

      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-800">
              <th className="p-6 text-[9px] font-black text-slate-500 uppercase">
                Account
              </th>
              <th className="w-[140px] p-6 text-[9px] font-black text-slate-500 uppercase text-center">
                Priority
              </th>
              <th className="p-6 text-[9px] font-black text-slate-500 uppercase">
                Action Required
              </th>
              <th className="w-[80px] p-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {analytics?.directives.map((store, i) => (
              <tr key={i} className="hover:bg-slate-800/20">
                <td className="p-6 text-sm font-black text-white">
                  #{store.name}
                </td>
                <td className="p-6 text-center">
                  <span
                    className={`px-3 py-1 rounded-lg text-[9px] font-black border ${store.priority === "High" ? "bg-pepsi-red/10 text-pepsi-red border-pepsi-red/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}
                  >
                    {store.priority}
                  </span>
                </td>
                <td className="p-6">
                  <p className="text-[11px] font-black text-white uppercase italic">
                    {store.action}
                  </p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">
                    {store.rawLogs.length} Field Observations
                  </p>
                </td>
                <td className="p-6 text-right">
                  <button
                    onClick={() => setSelectedStore(store.name)}
                    className="p-3 bg-slate-800 text-white rounded-xl"
                  >
                    <Info size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
