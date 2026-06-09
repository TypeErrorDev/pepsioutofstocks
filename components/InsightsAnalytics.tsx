"use client";
import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  CalendarClock,
  Megaphone,
  PieChart as PieIcon,
  Repeat,
  TrendingUp,
} from "lucide-react";
import type { StockoutLog } from "@/context/TrackerContext";
import {
  type PromoCalendarRow,
  chronicCount,
  chronicOffenders,
  promoOverlap,
  rootCauseBreakdown,
  summarizeKpis,
  topProducts,
  trendByWeek,
} from "@/lib/analytics";
import Modal from "./Modal";

const CAUSE_COLORS = [
  "#005cb4",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#64748b",
];

const TOOLTIP_STYLE = {
  backgroundColor: "var(--color-app-card)",
  border: "1px solid var(--color-app-border)",
  borderRadius: "12px",
  fontSize: "11px",
  fontWeight: 700,
} as const;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function weekLabel(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return m ? `${MONTHS[m - 1]} ${d}` : iso;
}

type ChartId = "cause" | "trend" | "chronic" | "promo";

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-48 items-center justify-center text-center text-[11px] font-black uppercase tracking-[0.2em] text-app-muted">
      {message}
    </div>
  );
}

export default function InsightsAnalytics({
  logs,
  promos,
}: {
  logs: StockoutLog[];
  promos: PromoCalendarRow[];
}) {
  const [activeChart, setActiveChart] = useState<ChartId | null>(null);

  const kpis = useMemo(() => summarizeKpis(logs), [logs]);
  const causes = useMemo(() => rootCauseBreakdown(logs), [logs]);
  const chronic = useMemo(
    () =>
      chronicOffenders(logs, 8).map((c) => ({
        ...c,
        label: `${c.product} @ ${c.store}`,
      })),
    [logs],
  );
  const chronicTotal = useMemo(() => chronicCount(logs), [logs]);
  const trend = useMemo(
    () => trendByWeek(logs).map((w) => ({ ...w, label: weekLabel(w.weekStart) })),
    [logs],
  );
  const overlap = useMemo(() => promoOverlap(logs, promos), [logs, promos]);
  const products = useMemo(() => topProducts(logs, 6), [logs]);

  const pct = (n: number) => `${Math.round(n * 100)}%`;

  const cards: {
    id: ChartId;
    icon: React.ReactNode;
    title: string;
    value: string;
    hint: string;
  }[] = [
    {
      id: "cause",
      icon: <PieIcon size={16} />,
      title: "Root-Cause Mix",
      value: causes[0] ? causes[0].cause : "—",
      hint: causes[0] ? `${pct(causes[0].pct)} of gaps` : "No data",
    },
    {
      id: "trend",
      icon: <TrendingUp size={16} />,
      title: "Gaps Over Time",
      value: String(kpis.total),
      hint: `${trend.length} week${trend.length === 1 ? "" : "s"} tracked`,
    },
    {
      id: "chronic",
      icon: <Repeat size={16} />,
      title: "Chronic Offenders",
      value: String(chronicTotal),
      hint: "items gapped 2+ times",
    },
    {
      id: "promo",
      icon: <Megaphone size={16} />,
      title: "Promo Impact",
      value: pct(overlap.pct),
      hint: `${overlap.onPromo} of ${overlap.total} on promo`,
    },
  ];

  const chartTitle: Record<ChartId, string> = {
    cause: "Root-Cause Mix",
    trend: "Gaps Logged Over Time",
    chronic: "Chronic Offenders",
    promo: "Promotion Impact",
  };

  return (
    <div className="space-y-4">
      {/* Glanceable KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        <Kpi
          icon={<AlertCircle size={16} />}
          label="Open Gaps"
          value={String(kpis.open)}
        />
        <Kpi
          icon={<CalendarClock size={16} />}
          label="Avg Open Age"
          value={`${kpis.avgOpenAgeDays.toFixed(1)}d`}
        />
        <Kpi
          icon={<TrendingUp size={16} />}
          label="Resolved"
          value={pct(kpis.resolutionRate)}
        />
      </div>

      {/* Clickable visualization cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setActiveChart(card.id)}
            className="group flex flex-col items-start gap-2 rounded-2xl border border-app-border bg-app-card p-4 text-left transition-all hover:border-pepsi-blue cursor-pointer"
          >
            <div className="flex w-full items-center justify-between text-app-muted">
              <span className="text-pepsi-blue">{card.icon}</span>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-0 transition-opacity group-hover:opacity-100">
                View ›
              </span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-app-muted">
              {card.title}
            </span>
            <span className="truncate text-xl font-black uppercase italic tracking-tight text-app-text">
              {card.value}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wide text-app-muted">
              {card.hint}
            </span>
          </button>
        ))}
      </div>

      <Modal
        open={activeChart !== null}
        title={activeChart ? chartTitle[activeChart] : ""}
        subtitle="Reflects the active filters"
        onClose={() => setActiveChart(null)}
      >
        {activeChart === "cause" &&
          (causes.length === 0 ? (
            <EmptyState message="No gaps match the current filters" />
          ) : (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={causes}
                    dataKey="count"
                    nameKey="cause"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {causes.map((c, i) => (
                      <Cell
                        key={c.cause}
                        fill={CAUSE_COLORS[i % CAUSE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value, name) => [`${value} gaps`, name]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "10px", fontWeight: 700 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <ul className="space-y-1.5">
                {causes.map((c, i) => (
                  <li
                    key={c.cause}
                    className="flex items-center justify-between text-xs font-bold text-app-text"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{
                          backgroundColor: CAUSE_COLORS[i % CAUSE_COLORS.length],
                        }}
                      />
                      {c.cause}
                    </span>
                    <span className="text-app-muted">
                      {c.count} ({pct(c.pct)})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        {activeChart === "trend" &&
          (trend.length === 0 ? (
            <EmptyState message="No gaps match the current filters" />
          ) : (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={trend}
                  margin={{ top: 8, right: 12, bottom: 0, left: -16 }}
                >
                  <XAxis
                    dataKey="label"
                    fontSize={10}
                    stroke="var(--color-app-muted)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    fontSize={10}
                    stroke="var(--color-app-muted)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => [`${value} new gaps`, "Logged"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-pepsi-blue)"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {products.length > 0 && (
                <div>
                  <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-app-muted">
                    Most-gapped products
                  </p>
                  <ul className="space-y-1.5">
                    {products.map((p) => (
                      <li
                        key={p.product}
                        className="flex items-center justify-between text-xs font-bold text-app-text"
                      >
                        <span>{p.product}</span>
                        <span className="text-app-muted">{p.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

        {activeChart === "chronic" &&
          (chronic.length === 0 ? (
            <EmptyState message="No recurring items in the current filters" />
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(180, chronic.length * 42)}
            >
              <BarChart
                data={chronic}
                layout="vertical"
                margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
              >
                <XAxis
                  type="number"
                  allowDecimals={false}
                  fontSize={10}
                  stroke="var(--color-app-muted)"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={150}
                  fontSize={9}
                  stroke="var(--color-app-muted)"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value, _name, item) => [
                    `${value} outages · ${item?.payload?.totalDays ?? 0} total days`,
                    item?.payload?.label,
                  ]}
                />
                <Bar
                  dataKey="occurrences"
                  fill="var(--color-pepsi-blue)"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ))}

        {activeChart === "promo" &&
          (overlap.total === 0 ? (
            <EmptyState message="No gaps match the current filters" />
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm font-bold text-app-text">
                <span className="text-pepsi-red">{pct(overlap.pct)}</span> of
                gaps coincided with an active promotion
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    { name: "On Promo", value: overlap.onPromo },
                    { name: "Off Promo", value: overlap.offPromo },
                  ]}
                  margin={{ top: 8, right: 12, bottom: 0, left: -16 }}
                >
                  <XAxis
                    dataKey="name"
                    fontSize={10}
                    stroke="var(--color-app-muted)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    fontSize={10}
                    stroke="var(--color-app-muted)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={TOOLTIP_STYLE}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    <Cell fill="var(--color-pepsi-red)" />
                    <Cell fill="var(--color-app-border)" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {overlap.byProduct.length > 0 ? (
                <div>
                  <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-app-muted">
                    Products gapped during a promo
                  </p>
                  <ul className="space-y-1.5">
                    {overlap.byProduct.map((p) => (
                      <li
                        key={p.product}
                        className="flex items-center justify-between text-xs font-bold text-app-text"
                      >
                        <span>{p.product}</span>
                        <span className="text-app-muted">{p.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-center text-[10px] font-bold uppercase tracking-wide text-app-muted">
                  No promo overlap. Add rows to promo_calendar to power this.
                </p>
              )}
            </div>
          ))}
      </Modal>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-app-border bg-app-card p-4">
      <div className="mb-2 text-pepsi-blue">{icon}</div>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-app-muted">
        {label}
      </p>
      <p className="text-2xl font-black uppercase italic tracking-tight text-app-text">
        {value}
      </p>
    </div>
  );
}
