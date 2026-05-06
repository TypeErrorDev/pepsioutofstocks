"use client";
import React, { useMemo } from "react";
import { useTracker } from "@/context/TrackerContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowLeft, LayoutDashboard, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Insights() {
  const { logs, loading } = useTracker();

  const analytics = useMemo(() => {
    if (!logs || logs.length === 0) return null;
    const storeMap: Record<string, any> = {};
    const brandMap: Record<string, number> = {};

    logs.forEach((l) => {
      // Store Aggregation
      if (!storeMap[l.store]) {
        storeMap[l.store] = { name: l.store, stockouts: 0, gaps: 0 };
      }
      l.root_cause === "Backstock" ? storeMap[l.store].gaps++ : storeMap[l.store].stockouts++;

      // Brand Aggregation
      brandMap[l.brand] = (brandMap[l.brand] || 0) + 1;
    });

    const chartData = Object.entries(brandMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      stores: Object.values(storeMap).sort((a, b) => (b.stockouts + b.gaps) - (a.stockouts + a.gaps)),
      chartData,
      total: logs.length
    };
  }, [logs]);

  if (loading) return <div className="min-h-screen bg-app-bg animate-pulse" />;
  if (!analytics) return <div className="min-h-screen bg-app-bg flex items-center justify-center text-app-muted uppercase font-black">No Data Available</div>;

  return (
    <div className="min-h-screen bg-app-bg p-4 md:p-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center gap-4">
          <Link href="/" className="p-3 bg-app-card border border-app-border rounded-2xl text-app-muted hover:text-pepsi-blue transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-pepsi-blue text-[10px] font-black uppercase tracking-widest">
              <LayoutDashboard size={12} /> Analytics Engine
            </div>
            <h1 className="text-2xl md:text-4xl font-black uppercase italic text-app-text">
              Market <span className="text-pepsi-blue">Intelligence</span>
            </h1>
          </div>
        </header>

        {/* Chart Section */}
        <div className="bg-app-card border border-app-border p-6 rounded-[2.5rem] shadow-xl">
          <p className="text-[10px] font-black text-app-muted uppercase tracking-[0.2em] mb-6 ml-2">Top At-Risk Brands</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.chartData}>
                <XAxis
                  dataKey="name"
                  fontSize={10}
                  fontWeight="black"
                  stroke="var(--color-app-muted)"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: 'var(--color-app-card)', borderColor: 'var(--color-app-border)', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {analytics.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "var(--color-pepsi-blue)" : "var(--color-app-border)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Account Priority Index */}
        <div className="bg-app-card border border-app-border rounded-[2.5rem] overflow-hidden shadow-xl">
          <div className="p-6 border-b border-app-border">
            <p className="text-[10px] font-black text-app-muted uppercase tracking-[0.2em]">Account Priority Index</p>
          </div>
          <div className="divide-y divide-app-border">
            {analytics.stores.map((store) => (
              <div key={store.name} className="p-6 flex items-center justify-between hover:bg-app-bg/50 transition-colors">
                <div>
                  <p className="text-lg font-black text-app-text uppercase">Store #{store.name}</p>
                  <p className="text-[10px] font-bold text-app-muted uppercase tracking-tighter">
                    {store.stockouts} Logistical Gaps • {store.gaps} Service Gaps
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${store.stockouts > 3 ? "bg-pepsi-red/10 text-pepsi-red border-pepsi-red/20" : "bg-app-bg text-app-muted border-app-border"
                  }`}>
                  {store.stockouts > 3 ? "Critical" : "Routine"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}