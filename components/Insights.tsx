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
} from "recharts";
import {
  TrendingUp,
  ArrowLeft,
  ShieldAlert,
  Zap,
  Clock,
  X,
  MapPin,
  Package,
  Info,
  Activity,
  Target,
} from "lucide-react";
import Link from "next/link";

export default function Insights() {
  const { logs, loading } = useTracker();
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const analytics = useMemo(() => {
    if (!logs || logs.length === 0) return null;

    const storeMap: Record<string, any> = {};
    const itemTotals: Record<string, number> = {};

    logs.forEach((l) => {
      // Store Aggregation
      if (!storeMap[l.store]) {
        storeMap[l.store] = {
          name: l.store,
          count: 0,
          causes: {},
          items: {},
          rawLogs: [],
        };
      }
      storeMap[l.store].count += 1;
      storeMap[l.store].rawLogs.push(l);
      storeMap[l.store].causes[l.root_cause] =
        (storeMap[l.store].causes[l.root_cause] || 0) + 1;

      const itemKey =
        `${l.brand || ""} ${l.pack_type || ""}`.trim() || "Unknown Item";
      storeMap[l.store].items[itemKey] =
        (storeMap[l.store].items[itemKey] || 0) + 1;

      // Global Item Aggregation for Chart
      itemTotals[itemKey] = (itemTotals[itemKey] || 0) + 1;
    });

    const storeHealth = Object.values(storeMap)
      .map((s: any) => {
        const topCause = Object.entries(s.causes).sort(
          (a: any, b: any) => b[1] - a[1],
        )[0][0];
        const topItem = Object.entries(s.items).sort(
          (a: any, b: any) => b[1] - a[1],
        )[0][0];
        return {
          ...s,
          topCause,
          topItem,
          riskLevel:
            s.count > 5 ? "Critical" : s.count > 2 ? "At Risk" : "Stable",
        };
      })
      .sort((a, b) => b.count - a.count);

    const repeatOffenders = Object.entries(itemTotals)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return { storeHealth, repeatOffenders, total: logs.length };
  }, [logs]);

  const modalData = useMemo(() => {
    if (!selectedStore || !analytics) return null;
    return analytics.storeHealth.find((s) => s.name === selectedStore);
  }, [selectedStore, analytics]);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-pepsi-blue/20 border-t-pepsi-blue rounded-full animate-spin" />
      </div>
    );

  if (!analytics)
    return (
      <div className="max-w-[1400px] mx-auto p-20 text-center border-2 border-dashed border-slate-800 rounded-[3rem] mt-10">
        <Activity className="mx-auto text-slate-800 mb-4" size={48} />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Awaiting Field Data...
        </p>
      </div>
    );

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10 space-y-10 pb-24 relative">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="p-4 bg-slate-900 border border-slate-800 rounded-[1.5rem] text-slate-400 hover:text-white transition-all shadow-xl"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-pepsi-blue mb-1">
              <TrendingUp size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Market Intelligence
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white">
              Operational <span className="text-pepsi-blue">Insights</span>
            </h1>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl flex items-center gap-3">
          <Clock className="text-slate-500" size={14} />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            Last Sync:{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </header>

      {/* VISUALIZATION GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-pepsi-blue p-8 md:p-12 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
          <Zap
            className="absolute right-[-20px] bottom-[-20px] text-white/10 group-hover:scale-110 transition-transform"
            size={200}
          />
          <div className="relative z-10">
            <h3 className="text-white font-black uppercase italic tracking-tighter text-3xl mb-3">
              Predictive Audit
            </h3>
            <p className="text-white/70 text-sm font-bold leading-relaxed mb-8 max-w-md">
              Analyzing {analytics.total} field logs to identify store gaps
              before they impact daily sales volume.
            </p>
            <div className="bg-white/20 inline-block px-5 py-2.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
              {
                analytics.storeHealth.filter((s) => s.riskLevel === "Critical")
                  .length
              }{" "}
              Critical Points
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl flex flex-col">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">
            Volume Risk by SKU
          </h3>
          <div className="flex-1 min-h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.repeatOffenders}>
                <XAxis dataKey="name" hide />
                <Tooltip
                  cursor={{ fill: "#1e293b" }}
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "10px",
                  }}
                />
                <Bar dataKey="count" fill="#e6192e" radius={[8, 8, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* VULNERABILITY INDEX */}
      <section className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="p-8 md:p-10 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">
            Store Vulnerability Index
          </h3>
          <ShieldAlert className="text-pepsi-red" size={24} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50">
                <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Store Account
                </th>
                <th className="p-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {analytics.storeHealth.map((store, i) => (
                <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                  <td className="p-8">
                    <button
                      onClick={() => setSelectedStore(store.name)}
                      className="flex items-center gap-2 font-black text-white uppercase text-sm tracking-tighter hover:text-pepsi-blue transition-all"
                    >
                      <MapPin size={14} className="text-slate-600" /> #
                      {store.name}
                    </button>
                  </td>
                  <td className="p-8 text-right">
                    <button
                      onClick={() => setSelectedStore(store.name)}
                      className="inline-flex items-center gap-2 text-pepsi-blue font-black text-[10px] uppercase tracking-tighter bg-pepsi-blue/10 px-4 py-2 rounded-xl border border-pepsi-blue/20 hover:bg-pepsi-blue hover:text-white transition-all shadow-lg"
                    >
                      <Info size={14} /> View Deep Dive
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL */}
      {selectedStore && modalData && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10">
          <div
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            onClick={() => setSelectedStore(null)}
          />
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-3xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[85vh] flex flex-col">
            <header className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-4">
                <MapPin size={24} className="text-pepsi-blue" />
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                  Store #{selectedStore}
                </h2>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all"
              >
                <X size={20} />
              </button>
            </header>
            <div className="p-8 overflow-y-auto space-y-4">
              {modalData.rawLogs.map((log: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <Package className="text-slate-700" size={18} />
                    <div>
                      <p className="text-xs font-black text-white uppercase">
                        {log.brand} {log.pack_type}
                      </p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase">
                        {log.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-pepsi-blue uppercase">
                      {log.root_cause}
                    </p>
                    <p className="text-[8px] font-bold text-slate-600 uppercase">
                      {new Date(log.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
