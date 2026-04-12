"use client";
import React, { useState } from "react";
import StockoutForm from "@/components/StockoutForm";
import LogTable from "@/components/LogTable";
import { useTracker } from "@/context/TrackerContext";
import { UserRole } from "@/context/TrackerContext";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Hash,
  ChevronRight,
  Loader2,
  LogOut,
  LayoutDashboard,
  BarChart3,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const { user, profile, signIn, signUp, signOut, loading } = useTracker();
  const [isRegistering, setIsRegistering] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [gpid, setGpid] = useState("");
  const [role, setRole] = useState<UserRole>("merchandiser");

  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // --- Validation Logic ---
    if (isRegistering) {
      if (gpid.length !== 8) {
        setError("GPID must be exactly 8 digits.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }

    setAuthLoading(true);
    try {
      if (isRegistering) {
        await signUp(email, password, fullName, gpid, role);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-pepsi-blue" size={40} />
        <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">
          Establishing Secure Link
        </span>
      </div>
    );

  // --- AUTHENTICATION VIEW ---
  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              Field <span className="text-pepsi-blue">Ops</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">
              {isRegistering ? "Personnel Enrollment" : "Identity Verification"}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl space-y-4"
          >
            {isRegistering && (
              <>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-4 top-3.5 text-slate-500"
                      size={16}
                    />
                    <input
                      className="w-full bg-slate-800/50 text-white p-3.5 pl-12 rounded-2xl border border-slate-700 outline-none focus:border-pepsi-blue text-sm font-bold"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1">
                    GPID (8 Digits)
                  </label>
                  <div className="relative">
                    <Hash
                      className="absolute left-4 top-3.5 text-slate-500"
                      size={16}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={8}
                      className="w-full bg-slate-800/50 text-white p-3.5 pl-12 rounded-2xl border border-slate-700 outline-none focus:border-pepsi-blue text-sm font-bold"
                      placeholder="e.g. 12345678"
                      value={gpid}
                      onChange={(e) =>
                        setGpid(e.target.value.replace(/\D/g, ""))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1">
                    Organizational Role
                  </label>
                  <select
                    className="w-full bg-slate-800/50 text-white p-3.5 rounded-2xl border border-slate-700 outline-none focus:border-pepsi-blue text-sm font-bold appearance-none cursor-pointer"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                  >
                    <option value="merchandiser">Merchandiser</option>
                    <option value="sales_rep">Sales Rep</option>
                    <option value="team_lead">Team Lead</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1">
                PepsiCo Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-3.5 text-slate-500"
                  size={16}
                />
                <input
                  type="email"
                  className="w-full bg-slate-800/50 text-white p-3.5 pl-12 rounded-2xl border border-slate-700 outline-none focus:border-pepsi-blue text-sm font-bold"
                  placeholder="name@pepsico.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-3.5 text-slate-500"
                  size={16}
                />
                <input
                  type="password"
                  className="w-full bg-slate-800/50 text-white p-3.5 pl-12 rounded-2xl border border-slate-700 outline-none focus:border-pepsi-blue text-sm font-bold"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-pepsi-red text-[10px] font-black uppercase text-center animate-shake">
                {error}
              </p>
            )}

            <button
              disabled={authLoading}
              className="w-full bg-pepsi-blue text-white font-black py-4 rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isRegistering ? (
                "CREATE ACCOUNT"
              ) : (
                "SIGN IN"
              )}
              {!authLoading && <ChevronRight size={18} />}
            </button>
          </form>

          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            {isRegistering
              ? "Already have a GPID profile? Sign In"
              : "New Personnel? Register GPID"}
          </button>
        </div>
      </main>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-pepsi-blue mb-1">
              <ShieldCheck size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Secure Session Active
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
              Field <span className="text-pepsi-blue">Operations</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {profile?.role !== "merchandiser" && (
              <Link
                href="/insights"
                className="flex items-center gap-3 px-6 py-3 bg-pepsi-blue/10 border border-pepsi-blue/20 rounded-2xl group hover:bg-pepsi-blue/20 transition-all"
              >
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-pepsi-blue uppercase tracking-widest">
                    Analytics Dashboard
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase">
                    {profile?.role} View
                  </span>
                </div>
                <BarChart3 size={18} className="text-pepsi-blue ml-2" />
              </Link>
            )}

            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                  {profile?.full_name || user.email}
                </span>
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                  GPID: {profile?.gpid}
                </span>
              </div>
              <div className="h-10 w-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                <UserIcon size={18} className="text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-10">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
              <StockoutForm />
            </div>
          </div>
          <div className="lg:col-span-8 min-h-[600px]">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl h-full flex flex-col overflow-hidden">
              <LogTable />
            </div>
          </div>
        </div>

        <footer className="mt-12 py-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">
          <span>
            Personnel: {profile?.full_name} • GPID: {profile?.gpid}
          </span>
          <button
            onClick={async () => await signOut()}
            className="flex items-center gap-2 hover:text-pepsi-red transition-colors cursor-pointer group"
          >
            <LogOut
              size={12}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Secure Logout
          </button>
        </footer>
      </div>
    </main>
  );
}
