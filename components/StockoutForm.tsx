"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  Package,
  MapPin,
  AlertCircle,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  Layers,
  Megaphone,
} from "lucide-react";

const PACK_TYPES = [
  "24 Pack",
  "18 Pack",
  "12 Pack",
  "10 Pack",
  "8 Pack",
  "6 Pack",
  "4 Pack",
  "64oz",
  "28oz",
  "20oz",
  "2L",
  "1.25L",
  "Singles",
];
const LOCATIONS = ["Main Shelf", "Coolers"];
const ROOT_CAUSES = [
  "Warehouse OOS",
  "Ordering Error",
  "On Sale/Promotion",
  "Discontinued",
];

export default function StockoutForm() {
  const {
    addLog,
    addSalesAlert,
    resolveSalesAlert,
    salesAlerts,
    profile,
    logs,
  } = useTracker();

  // Mode state: 'gap' for logging standard out-of-stock items, 'alert' for creating rep notices
  const [activeFormMode, setActiveFormMode] = useState<"gap" | "alert">("gap");

  // Standard Form States
  const [product, setProduct] = useState("");
  const [type, setType] = useState("");
  const [store, setStore] = useState("");
  const [location, setLocation] = useState("");
  const [cause, setCause] = useState("Ordering Error");
  const [notes, setNotes] = useState("");

  // Sales Alert Text Input State
  const [alertText, setAlertText] = useState("");
  const [alertError, setAlertError] = useState<string | null>(null);
  const [activeAlertActionId, setActiveAlertActionId] = useState<string | null>(
    null,
  );
  const [alertResolutionText, setAlertResolutionText] = useState("");
  const [isAlertActionSubmitting, setIsAlertActionSubmitting] = useState(false);

  // UI Status Flash Overlays
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDuplicatedFlash, setIsDuplicatedFlash] = useState(false);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const canWriteAlerts =
    profile && ["admin", "team_lead", "sales_rep"].includes(profile.role);

  // Filter alerts matching whatever store number is typed in live with absolute null-safety guards
  const matchingActiveAlerts = useMemo(() => {
    if (!store.trim() || !salesAlerts) return [];
    return salesAlerts.filter(
      (a) =>
        a &&
        a.store &&
        a.store.toString().trim() === store.toString().trim() &&
        a.status?.toLowerCase() !== "closed",
    );
  }, [store, salesAlerts]);

  const distinctProducts = useMemo(() => {
    if (!logs) return [];
    const unique = new Set<string>();
    logs.forEach((log) => {
      if (log.product) unique.add(log.product.trim());
    });
    return Array.from(unique).sort();
  }, [logs]);

  const filteredSuggestions = useMemo(() => {
    if (!product.trim()) return [];
    return distinctProducts.filter(
      (item) =>
        item.toLowerCase().includes(product.toLowerCase()) &&
        item.toLowerCase() !== product.toLowerCase(),
    );
  }, [product, distinctProducts]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeFormMode === "alert") {
      if (!store.trim() || !alertText.trim()) {
        setAlertError("Store and broadcast message are required.");
        return;
      }
      setAlertError(null);
      setIsSubmitting(true);
      try {
        await addSalesAlert(store.trim(), alertText.trim());
        setAlertText("");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } catch (err) {
        console.error(err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : err && typeof err === "object"
              ? JSON.stringify(err)
              : String(err);
        setAlertError(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Handle gap logging form submission
    if (!product.trim() || !store.trim() || !type || !location) return;
    setIsSubmitting(true);
    try {
      const result = await addLog({
        product: product.trim(),
        pack_type: type,
        store: store.trim(),
        location,
        root_cause: cause,
        notes,
        gpid: profile?.gpid ?? null,
      });

      if (result?.duplicated) {
        setIsDuplicatedFlash(true);
        setTimeout(() => setIsDuplicatedFlash(false), 2200);
      } else {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2200);
      }

      setProduct("");
      setNotes("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAlertAction = async (alertId: string, close: boolean) => {
    if (!alertId) return;
    setAlertError(null);
    setIsAlertActionSubmitting(true);
    try {
      await resolveSalesAlert(alertId, alertResolutionText.trim(), close);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setActiveAlertActionId(null);
      setAlertResolutionText("");
    } catch (err) {
      console.error(err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : err && typeof err === "object"
            ? JSON.stringify(err)
            : String(err);
      setAlertError(errorMessage);
    } finally {
      setIsAlertActionSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ROLE SWITCHING TAB INTERFACES (ONLY RENDERED FOR SALES/ADMINS) */}
      {canWriteAlerts && (
        <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-850 mb-2">
          <button
            type="button"
            onClick={() => setActiveFormMode("gap")}
            className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
              activeFormMode === "gap"
                ? "bg-slate-800 text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Log Outage Gap
          </button>
          <button
            type="button"
            onClick={() => setActiveFormMode("alert")}
            className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeFormMode === "alert"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/15"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Megaphone size={12} /> Broadcast Rep Alert
          </button>
        </div>
      )}

      {/* DYNAMIC FIELD ALERTS HUD FOR MERCH PERSONNEL */}
      {activeFormMode === "gap" && matchingActiveAlerts.length > 0 && (
        <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300 space-y-2 shadow-lg shadow-blue-500/5">
          <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-black uppercase tracking-widest">
            <Megaphone size={12} className="animate-pulse" />
            <span>
              Active Order Desk Alerts ({matchingActiveAlerts.length})
            </span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
            {matchingActiveAlerts.map((alert) => (
              <div
                key={alert.id}
                className="text-[11px] text-slate-300 font-medium leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-900"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-300">
                    Store {alert.store}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Broadcast Alert
                  </span>
                </div>
                <p>"{alert.alert_text}"</p>
                <span className="text-[8px] font-black uppercase text-slate-500 block mt-1.5">
                  Author: {alert.author_name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 relative">
        {showSuccess && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 rounded-3xl flex flex-col items-center justify-center">
            <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
            <span className="text-[10px] font-black text-slate-50 uppercase tracking-[0.4em]">
              Transaction Completed
            </span>
          </div>
        )}

        {isDuplicatedFlash && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-50 rounded-3xl flex flex-col items-center justify-center">
            <Layers size={32} className="text-blue-500 mb-2" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] text-center px-4">
              Gap Re-verified (+1 Day Streak)
            </span>
          </div>
        )}

        {/* SHARED STORE IDENTITY FIELD BASELINE */}
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
            Store Identity Location
          </label>
          <div className="relative">
            <MapPin
              className="absolute left-4 top-3.5 text-slate-500"
              size={14}
            />
            <input
              type="text"
              className="w-full bg-slate-950 text-slate-50 p-3.5 pl-10 rounded-2xl border border-slate-800 outline-none text-sm font-bold uppercase focus:border-blue-600"
              placeholder="e.g. 5406"
              value={store}
              onChange={(e) => setStore(e.target.value)}
              required
            />
          </div>
          {store.trim() && activeFormMode === "alert" && (
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.3em] text-slate-400 mt-1">
              <span className="font-black text-slate-200">
                Broadcast target: {store.trim()}
              </span>
              {matchingActiveAlerts.length > 0 ? (
                <span className="text-amber-300 font-black">
                  Active alert exists for this store
                </span>
              ) : (
                <span className="text-slate-500">
                  No existing alert for this store yet
                </span>
              )}
            </div>
          )}
        </div>

        {activeFormMode === "gap" ? (
          <div className="space-y-5">
            {/* PRODUCT SELECTION WITH AUTOCOMPLETE */}
            <div className="space-y-1 relative" ref={autocompleteRef}>
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
                Product / SKU
              </label>
              <div className="relative">
                <Package
                  className="absolute left-4 top-3.5 text-slate-500"
                  size={16}
                />
                <input
                  type="text"
                  className="w-full bg-slate-950 text-slate-50 p-3.5 pl-12 rounded-2xl border border-slate-800 outline-none text-sm font-bold uppercase focus:border-blue-600"
                  placeholder="e.g. STAR_PEPSI"
                  value={product}
                  onChange={(e) => {
                    setProduct(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  required
                  autoComplete="off"
                />
              </div>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-slate-950 border border-slate-800 rounded-2xl max-h-48 overflow-y-auto z-40 divide-y divide-slate-900">
                  {filteredSuggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setProduct(s);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-5 py-3 text-xs font-black text-slate-300 hover:bg-slate-900 uppercase"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PACK TYPE SELECTOR GRID */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
                Pack Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PACK_TYPES.map((pType) => (
                  <button
                    key={pType}
                    type="button"
                    onClick={() => setType(pType)}
                    className={`py-2.5 text-[10px] font-black rounded-xl border transition-all cursor-pointer ${type === pType ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600"}`}
                  >
                    {pType}
                  </button>
                ))}
              </div>
            </div>

            {/* DISPLAY LOCATION MATRIX SELECTOR */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
                Store Layout Segment
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className={`py-2.5 text-[10px] font-black rounded-xl border transition-all cursor-pointer ${location === loc ? "bg-emerald-600 border-emerald-600 text-white" : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600"}`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* ROOT CAUSES SELECTOR CONFIGURATION */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
                Logistical Cause
              </label>
              <div className="relative">
                <AlertCircle
                  className="absolute left-4 top-3.5 text-slate-500"
                  size={16}
                />
                <select
                  className="w-full bg-slate-950 text-slate-50 p-3.5 pl-12 rounded-2xl border border-slate-800 outline-none text-sm font-bold appearance-none cursor-pointer"
                  value={cause}
                  onChange={(e) => setCause(e.target.value)}
                >
                  {ROOT_CAUSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronRight
                  className="absolute right-4 top-4 text-slate-500 pointer-events-none rotate-90"
                  size={14}
                />
              </div>
            </div>

            {/* ADDITIONAL OBSERVATION NOTES */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
                Field Observations
              </label>
              <div className="relative">
                <MessageSquare
                  className="absolute left-4 top-3.5 text-slate-500"
                  size={16}
                />
                <textarea
                  className="w-full bg-slate-950 text-slate-50 p-3.5 pl-12 rounded-2xl border border-slate-800 outline-none text-sm font-bold min-h-20"
                  placeholder="Specific notes (surges, display layout resets)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          /* SALES ALERT CREATION AND UPDATE INTERFACE MODE */
          <div className="space-y-4 animate-in fade-in duration-200">
            {matchingActiveAlerts.length > 0 && (
              <div className="space-y-3 p-4 bg-slate-950/80 border border-slate-800 rounded-3xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                      Existing open broadcast alert
                    </p>
                    <p className="text-sm font-bold text-slate-100">
                      Store {store.trim()}
                    </p>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
                    Open
                  </span>
                </div>

                {matchingActiveAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="space-y-2 rounded-3xl bg-slate-900/90 p-3 border border-slate-800"
                  >
                    <p className="text-slate-200 text-sm font-bold">
                      "{alert.alert_text}"
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">
                      Created by {alert.author_name}
                    </p>
                    {alert.resolution_text && (
                      <div className="rounded-3xl bg-slate-950/80 p-3 border border-slate-800">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">
                          Latest update
                        </p>
                        <p className="mt-1 text-slate-300 text-sm">
                          {alert.resolution_text}
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveAlertActionId(alert.id);
                        setAlertResolutionText("");
                      }}
                      className="w-full text-left px-4 py-3 bg-blue-600 text-white font-black rounded-3xl uppercase tracking-[0.15em] text-[9px] hover:bg-blue-500"
                    >
                      Resolve / Update this alert
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!activeAlertActionId ? (
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-[0.2em]">
                  Alert Content Message
                </label>
                <div className="relative">
                  <Megaphone
                    className="absolute left-4 top-3.5 text-slate-500"
                    size={16}
                  />
                  <textarea
                    required
                    value={alertText}
                    onChange={(e) => setAlertText(e.target.value)}
                    placeholder="e.g., Massive 2L Dew delivery incoming tomorrow for endcap promo drop. Clear floor room tonight."
                    className="w-full bg-slate-950 text-slate-50 p-3.5 pl-12 rounded-2xl border border-slate-800 outline-none text-sm font-bold min-h-32 focus:border-blue-600"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-slate-950/80 border border-slate-800 rounded-3xl">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">
                    Resolution / status message
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAlertActionId(null);
                      setAlertResolutionText("");
                    }}
                    className="text-[9px] text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
                <textarea
                  value={alertResolutionText}
                  onChange={(e) => setAlertResolutionText(e.target.value)}
                  placeholder="Enter a resolution note, update message, or reason for closing the alert."
                  className="w-full bg-slate-950 text-slate-50 p-3.5 rounded-2xl border border-slate-800 outline-none text-sm font-bold min-h-24 focus:border-blue-600"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleAlertAction(activeAlertActionId, false)
                    }
                    disabled={isAlertActionSubmitting}
                    className="px-4 py-3 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-500 disabled:opacity-50"
                  >
                    Save Update
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAlertAction(activeAlertActionId, true)}
                    disabled={isAlertActionSubmitting}
                    className="px-4 py-3 bg-emerald-600 text-white font-black rounded-3xl hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Close Alert
                  </button>
                </div>
              </div>
            )}

            {alertError && (
              <p className="text-[10px] text-rose-400 font-black uppercase tracking-[0.2em]">
                {alertError}
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-white font-black py-4 rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer ${activeFormMode === "alert" ? "bg-blue-600 shadow-xl shadow-blue-600/10" : "bg-pepsi-blue"}`}
        >
          {isSubmitting
            ? "SYNCING PROCESS..."
            : activeFormMode === "alert"
              ? "BROADCAST FIELD ALERT"
              : "LOG FIELD GAP / VERIFY"}
        </button>
      </form>
    </div>
  );
}
