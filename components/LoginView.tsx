"use client";
import React, { useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import { Lock, Mail, User, ShieldCheck, Sun, Moon } from "lucide-react";
import { useEffect } from "react";

// Local toggle for the login screen
function LoginThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="absolute top-6 right-6 p-2 rounded-xl bg-app-card border border-app-border text-app-muted hover:text-pepsi-blue transition-all"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export default function LoginView() {
  const { signIn, signUp } = useTracker();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [gpid, setGpid] = useState("");
  const [role, setRole] = useState<any>("merchandiser");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName, gpid, role);
        setIsLogin(true);
      }
    } catch (err: any) {
      alert(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-4 transition-colors duration-300">
      <LoginThemeToggle />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 bg-pepsi-blue/10 rounded-3xl border border-pepsi-blue/20 mb-2">
            <ShieldCheck className="text-pepsi-blue" size={32} />
          </div>
          <h1 className="text-4xl font-black italic uppercase text-app-text tracking-tighter">
            Field<span className="text-pepsi-blue">Portal</span>
          </h1>
          <p className="text-[10px] font-black uppercase text-app-muted tracking-[0.3em]">
            Inventory Intelligence System
          </p>
        </div>

        <div className="bg-app-card border border-app-border p-8 rounded-[2.5rem] shadow-2xl transition-colors">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-app-muted uppercase ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-app-muted" size={16} />
                    <input
                      required
                      className="w-full bg-app-bg/50 text-app-text p-3.5 pl-12 rounded-2xl border border-app-border outline-none focus:border-pepsi-blue text-sm font-bold transition-all"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-app-muted uppercase ml-1">GPID (8 Digits)</label>
                  <input
                    required
                    maxLength={8}
                    className="w-full bg-app-bg/50 text-app-text p-3.5 rounded-2xl border border-app-border outline-none focus:border-pepsi-blue text-sm font-bold transition-all"
                    value={gpid}
                    onChange={(e) => setGpid(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-black text-app-muted uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-app-muted" size={16} />
                <input
                  required
                  type="email"
                  className="w-full bg-app-bg/50 text-app-text p-3.5 pl-12 rounded-2xl border border-app-border outline-none focus:border-pepsi-blue text-sm font-bold transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-app-muted uppercase ml-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-app-muted" size={16} />
                <input
                  required
                  type="password"
                  className="w-full bg-app-bg/50 text-app-text p-3.5 pl-12 rounded-2xl border border-app-border outline-none focus:border-pepsi-blue text-sm font-bold transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-pepsi-blue text-white font-black py-4 rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? "AUTHENTICATING..." : isLogin ? "ACCESS SYSTEM" : "CREATE ACCOUNT"}
            </button>
          </form>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full mt-6 text-[10px] font-black text-app-muted uppercase tracking-widest hover:text-app-text transition-colors"
          >
            {isLogin ? "Request Access Privileges" : "Return to Secure Login"}
          </button>
        </div>
      </div>
    </div>
  );
}