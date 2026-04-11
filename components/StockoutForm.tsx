"use client";
import { useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import { Send } from "lucide-react";

export default function StockoutForm() {
  const { addLog } = useTracker();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product: "",
    store: "",
    category: "Salty",
    priority: "Medium",
    days_oos: 1,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addLog(formData);
    setFormData({ ...formData, product: "", store: "", notes: "" }); // Reset fields
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Product Name
        </label>
        <input
          required
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#004C97] outline-none transition-all"
          value={formData.product}
          onChange={(e) =>
            setFormData({ ...formData, product: e.target.value })
          }
          placeholder="e.g. Doritos Nacho 2oz"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Store
          </label>
          <input
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#004C97] outline-none"
            value={formData.store}
            onChange={(e) =>
              setFormData({ ...formData, store: e.target.value })
            }
            placeholder="Walmart #4521"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Category
          </label>
          <select
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option>Salty</option>
            <option>Soda</option>
            <option>Energy</option>
            <option>Water</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Priority
          </label>
          <select
            className={`w-full border rounded-xl p-3 text-sm font-bold outline-none ${
              formData.priority === "High"
                ? "bg-red-50 border-red-200 text-red-600"
                : "bg-slate-50 border-slate-200"
            }`}
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value })
            }
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Days OOS
          </label>
          <input
            type="number"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none"
            value={formData.days_oos}
            onChange={(e) =>
              setFormData({ ...formData, days_oos: parseInt(e.target.value) })
            }
          />
        </div>
      </div>

      <button
        disabled={loading}
        className="w-full bg-[#004C97] text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
      >
        <Send size={18} />
        {loading ? "LOGGING..." : "LOG STOCKOUT"}
      </button>
    </form>
  );
}
