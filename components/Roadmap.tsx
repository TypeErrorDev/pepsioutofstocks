"use client";
import React, { useState } from "react";
import { Map as RoadmapIcon } from "lucide-react";
import Modal from "./Modal";

type RoadmapStatus = "In Progress" | "Planned" | "Considering";

interface RoadmapItem {
  title: string;
  description: string;
  status: RoadmapStatus;
}

/* ===========================================================================
   ROADMAP ITEMS — EDIT HERE
   Add / remove / reorder upcoming features. `status` drives the badge color.
   =========================================================================== */
const ROADMAP: RoadmapItem[] = [
  {
    title: "Exact time-to-resolve",
    description:
      "Add a dedicated resolution timestamp so resolution speed is precise rather than inferred.",
    status: "Planned",
  },
  {
    title: "Hardened auth cookies",
    description:
      "Move sessions to server-managed httpOnly cookies for stronger protection against XSS.",
    status: "Planned",
  },
  {
    title: "Deeper promotion analytics",
    description:
      "Richer promotion vs. out-of-stock correlation once the promo calendar is in regular use.",
    status: "Planned",
  },
  {
    title: "Automated weekly backups",
    description: "Scheduled full backups of the database, kept off-site.",
    status: "Considering",
  },
  {
    title: "Match system theme",
    description:
      "Default light/dark to the device's preference on a first visit.",
    status: "Considering",
  },
];
/* ========================================================================= */

const STATUS_STYLES: Record<RoadmapStatus, string> = {
  "In Progress": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Planned: "bg-pepsi-blue/10 text-pepsi-blue border-pepsi-blue/20",
  Considering: "bg-app-bg text-app-muted border-app-border",
};

export default function Roadmap() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-app-muted transition-colors hover:text-pepsi-blue cursor-pointer"
      >
        <RoadmapIcon size={11} />
        Road Map
      </button>

      <Modal
        open={open}
        title="Road Map"
        subtitle="What's planned next"
        onClose={() => setOpen(false)}
      >
        <ul className="space-y-3">
          {ROADMAP.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-app-border bg-app-bg/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-black uppercase italic tracking-tight text-app-text">
                  {item.title}
                </h3>
                <span
                  className={`shrink-0 rounded-lg border px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.15em] ${STATUS_STYLES[item.status]}`}
                >
                  {item.status}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] font-medium leading-snug text-app-muted">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}
