"use client";
import React, { useState } from "react";
import { Map as RoadmapIcon } from "lucide-react";
import Modal from "./Modal";

type RoadmapCategory = "Sales" | "Major" | "Minor" | "Cosmetic" | "Background";

interface RoadmapItem {
  title: string;
  description: string;
}

interface RoadmapGroup {
  category: RoadmapCategory;
  blurb: string;
  items: RoadmapItem[];
}

/* ===========================================================================
   ROADMAP — EDIT HERE
   Grouped by Major / Minor / Cosmetic / Background. Add, remove, reorder, or
   move an item between groups; the modal renders straight from this array.
   =========================================================================== */
const ROADMAP: RoadmapGroup[] = [
  {
    category: "Sales",
    blurb: "Turning out-of-stocks into recovered sales",
    items: [
      {
        title: "Reorder watchlist (per store)",
        description:
          "Predicts each store's next stockout from THAT store's own log + resolution history and flags items to order deeper or more often. Scoped strictly per store + product — one account's history never affects another's.",
      },
      {
        title: "Lost-sales estimate",
        description:
          "Dollarize out-of-stocks per store, SKU, and territory using product velocity, so a gap reads as recoverable revenue.",
      },
      {
        title: "Account & territory scorecard",
        description:
          "Rank accounts by lost-sales risk and track the sales recovered per rep.",
      },
      {
        title: "Promo stock-up alerts",
        description:
          "Flag items at stockout risk ahead of an upcoming promotion so reps order deep.",
      },
      {
        title: "Order-writer action routing",
        description:
          "Separate the gaps an order-writer can fix (ordering errors) from supply or merchandising issues.",
      },
      {
        title: "Rep call-list digest",
        description:
          "A weekly, per-rep list of accounts to fix and the order adjustments to make.",
      },
    ],
  },
  {
    category: "Major",
    blurb: "Big, transformative features",
    items: [
      {
        title: "Offline-first / PWA",
        description:
          "Installable app that keeps logging without signal and syncs when you reconnect.",
      },
      {
        title: "Store-session bulk logging",
        description:
          "Pick a store once, then rapid-add multiple items without re-entering it.",
      },
      {
        title: "Barcode / UPC scan",
        description: "Use the phone camera to auto-fill the product.",
      },
      {
        title: "Photo evidence",
        description: "Attach a shelf photo to a log for stronger proof.",
      },
      {
        title: "Stores & territories",
        description:
          "Real store records (chain, region) with rep assignment; the root fix for naming drift.",
      },
      {
        title: "Scheduled manager digest",
        description:
          "Weekly automated email of trends, chronic offenders, and promo overlap.",
      },
      {
        title: "Admin & role management",
        description: "Manage users, roles, and territory assignments in-app.",
      },
      {
        title: "Targets & exec summary",
        description:
          "Set OOS-reduction goals and export a one-click PDF summary for meetings.",
      },
    ],
  },
  {
    category: "Minor",
    blurb: "Quality-of-life enhancements",
    items: [
      {
        title: "Exact time-to-resolve",
        description:
          "A dedicated resolution timestamp plus resolution-speed trends.",
      },
      {
        title: "Promo-calendar editor",
        description: "Manage promotions so the Promo Impact insight has data.",
      },
      {
        title: "Threshold notifications",
        description: "Alert when a gap stays open beyond a set number of days.",
      },
      {
        title: "CSV export",
        description:
          "A lightweight export option alongside the styled Excel file.",
      },
    ],
  },
  {
    category: "Cosmetic",
    blurb: "Visual & UX polish",
    items: [
      {
        title: "Match system theme",
        description:
          "Default light/dark to the device preference on first visit.",
      },
      {
        title: "Light-mode accent tuning",
        description: "Refine the status-chip colors for light mode.",
      },
      {
        title: "Loading skeletons & empty states",
        description: "Smoother first paint and friendlier empty screens.",
      },
      {
        title: "Branding touches",
        description:
          "Logo in the Excel header and a branded favicon / preview image.",
      },
    ],
  },
  {
    category: "Background",
    blurb: "Security, performance, reliability",
    items: [
      {
        title: "Tighten row-level security",
        description:
          "Per-role / ownership rules so users only edit what they should.",
      },
      {
        title: "Scalable data loading",
        description:
          "Paginated / date-bounded queries instead of loading every log into the client.",
      },
      {
        title: "Incremental realtime",
        description: "Apply changed rows live instead of refetching the whole table.",
      },
      {
        title: "Automated backups",
        description: "Scheduled database backups kept off-site.",
      },
      {
        title: "httpOnly auth hardening",
        description: "Server-managed session cookies for stronger XSS protection.",
      },
      {
        title: "CI gate",
        description: "Run lint, types, tests, and build automatically on every PR.",
      },
      {
        title: "End-to-end tests",
        description: "Automated browser coverage of login → log → export.",
      },
      {
        title: "Error monitoring",
        description: "Production error tracking and alerts.",
      },
    ],
  },
];
/* ========================================================================= */

const CATEGORY_COLOR: Record<
  RoadmapCategory,
  { dot: string; text: string; activePill: string }
> = {
  Sales: {
    dot: "bg-amber-500",
    text: "text-amber-500",
    activePill: "bg-amber-500 text-slate-900",
  },
  Major: {
    dot: "bg-pepsi-blue",
    text: "text-pepsi-blue",
    activePill: "bg-pepsi-blue text-white",
  },
  Minor: {
    dot: "bg-emerald-500",
    text: "text-emerald-500",
    activePill: "bg-emerald-500 text-white",
  },
  Cosmetic: {
    dot: "bg-violet-500",
    text: "text-violet-500",
    activePill: "bg-violet-500 text-white",
  },
  Background: {
    dot: "bg-app-muted",
    text: "text-app-muted",
    activePill: "bg-app-muted text-white",
  },
};

type Filter = RoadmapCategory | "All";
const TABS: Filter[] = [
  "All",
  "Sales",
  "Major",
  "Minor",
  "Cosmetic",
  "Background",
];

export default function Roadmap() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("All");

  const visibleGroups =
    filter === "All"
      ? ROADMAP
      : ROADMAP.filter((group) => group.category === filter);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setFilter("All");
          setOpen(true);
        }}
        className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-app-muted transition-colors hover:text-pepsi-blue cursor-pointer"
      >
        <RoadmapIcon size={11} />
        Road Map
      </button>

      <Modal
        open={open}
        title="Road Map"
        subtitle="Where ShelfHealth is headed"
        onClose={() => setOpen(false)}
      >
        <div className="space-y-5">
          {/* Category toggle */}
          <div className="flex flex-wrap gap-1 rounded-xl border border-app-border bg-app-inset p-1">
            {TABS.map((tab) => {
              const isActive = filter === tab;
              const activeClass =
                tab === "All"
                  ? "bg-app-border text-app-text"
                  : CATEGORY_COLOR[tab].activePill;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    isActive ? activeClass : "text-app-muted hover:text-app-text"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="space-y-6">
            {visibleGroups.map((group) => (
              <section key={group.category}>
                <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className={`h-2.5 w-2.5 rounded-sm ${CATEGORY_COLOR[group.category].dot}`}
                  />
                  <h3
                    className={`text-xs font-black uppercase tracking-[0.2em] ${CATEGORY_COLOR[group.category].text}`}
                  >
                    {group.category}
                  </h3>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-app-muted">
                    {group.blurb}
                  </span>
                </div>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li
                      key={item.title}
                      className="rounded-xl border border-app-border bg-app-bg/40 p-3"
                    >
                      <p className="text-xs font-black uppercase tracking-tight text-app-text">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[11px] font-medium leading-snug text-app-muted">
                        {item.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
