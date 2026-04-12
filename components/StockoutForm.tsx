"use client";
import { useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  Send,
  MapPin,
  Package,
  Clock,
  LayoutGrid,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function StockoutForm() {
  const { addLog } = useTracker();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product: "",
    store: "",
    location: "Home Shelf",
    category: "Salty",
    days_oos: 1,
    root_cause: "Unknown",
    notes: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addLog(formData);
    // Reset product and notes, keep store/location for rapid logging
    setFormData({ ...formData, product: "", notes: "", root_cause: "Unknown" });
    setLoading(false);
  };

  const locations = ["Home Shelf", "Cooler", "Endcap", "Lobby", "Checkstand"];
  const causes = [
    "Unknown",
    "Warehouse OOS",
    "Ordering Error",
    "Delivery Miss",
    "High Demand",
  ];

  const inputStyle =
    "w-full bg-slate-800/50 text-white p-4 rounded-2xl border border-slate-700 outline-none focus:border-pepsi-blue focus:bg-slate-800 transition-all font-bold text-sm placeholder:text-slate-600";

  return (
    <form onSubmit={submit} className="flex flex-col h-full space-y-5">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-pepsi-blue/10 rounded-lg">
          <LayoutGrid className="text-pepsi-blue" size={20} />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tighter">
          Field Intel
        </h3>
      </div>

      <div className="space-y-4 flex-1">
        {/* Product & Store */}
        <div className="grid grid-cols-1 gap-4">
          <div className="relative">
            <Package
              className="absolute left-4 top-4 text-slate-500"
              size={18}
            />
            <input
              className={`${inputStyle} pl-12`}
              placeholder="Product Name"
              value={formData.product}
              onChange={(e) =>
                setFormData({ ...formData, product: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <MapPin
                className="absolute left-4 top-4 text-slate-500"
                size={18}
              />
              <input
                className={`${inputStyle} pl-12`}
                placeholder="Store #"
                value={formData.store}
                onChange={(e) =>
                  setFormData({ ...formData, store: e.target.value })
                }
                required
              />
            </div>
            <div className="relative">
              <Clock
                className="absolute left-4 top-4 text-slate-500"
                size={18}
              />
              <input
                type="number"
                className={`${inputStyle} pl-12`}
                value={formData.days_oos}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    days_oos: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Location Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Location
          </label>
          <div className="flex flex-wrap gap-2">
            {locations.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setFormData({ ...formData, location: loc })}
                className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  formData.location === loc
                    ? "bg-pepsi-blue border-pepsi-blue text-white"
                    : "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Root Cause Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Root Cause
          </label>
          <div className="relative">
            <AlertCircle
              className="absolute left-4 top-4 text-slate-500"
              size={18}
            />
            <select
              className={`${inputStyle} pl-12 appearance-none`}
              value={formData.root_cause}
              onChange={(e) =>
                setFormData({ ...formData, root_cause: e.target.value })
              }
            >
              {causes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes */}
        <div className="relative">
          <FileText
            className="absolute left-4 top-4 text-slate-500"
            size={18}
          />
          <textarea
            className={`${inputStyle} pl-12 h-24 resize-none`}
            placeholder="Additional field notes..."
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>
      </div>

      <button
        disabled={loading}
        className="w-full bg-pepsi-blue text-white font-black py-5 rounded-[1.5rem] shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
      >
        <Send size={20} />
        {loading ? "LOGGING..." : "SUBMIT Intel"}
      </button>
    </form>
  );
}
