"use client";
import React, { useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import { LogIn, Key, Mail, ShieldCheck } from "lucide-react";

export default function LoginView() {
  const { signIn } = useTracker();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      alert("Access Denied: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        {/* Visual Decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-pepsi-blue/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <header className="mb-10 text-center">
            <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
              <ShieldCheck className="text-pepsi-blue" size={32} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
              Operational <span className="text-pepsi-blue">Portal</span>
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">
              Authorized Personnel Only
            </p>
          </header>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-4 text-slate-600"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="name@pepsico.com"
                  className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-2xl text-sm font-bold text-white outline-none focus:border-pepsi-blue transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">
                Security Password
              </label>
              <div className="relative">
                <Key
                  className="absolute left-4 top-4 text-slate-600"
                  size={18}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-2xl text-sm font-bold text-white outline-none focus:border-pepsi-blue transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              disabled={isSubmitting}
              className="w-full bg-pepsi-blue text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-pepsi-blue/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                "VERIFYING..."
              ) : (
                <>
                  AUTHENTICATE <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          <footer className="mt-10 text-center">
            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
              Global Personnel ID required for entry.
              <br />
              Unauthorised access is strictly prohibited.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}
