"use client";
import React, { useState } from "react";
import { useTracker } from "@/context/TrackerContext";
import {
  LogIn,
  Key,
  Mail,
  ShieldCheck,
  UserPlus,
  BadgeCheck,
  Fingerprint,
} from "lucide-react";

type UserRole = "merchandiser" | "sales_rep" | "team_lead";

export default function LoginView() {
  const { signIn, signUp } = useTracker();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [gpid, setGpid] = useState("");
  const [role, setRole] = useState<UserRole>("merchandiser");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isRegistering) {
        await signUp(email, password, fullName, gpid, role);
        alert("Success! Account created.");
        setIsRegistering(false);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      alert("System Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <header className="mb-8 text-center">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
              {isRegistering ? "System" : "Operational"}{" "}
              <span className="text-pepsi-blue">
                {isRegistering ? "Registration" : "Portal"}
              </span>
            </h2>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-pepsi-blue"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">
                    GPID (8 Digits Max)
                  </label>
                  <div className="relative">
                    <Fingerprint
                      className="absolute left-4 top-4 text-slate-600"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="8-Digit ID"
                      maxLength={8} // UI constraint
                      className="w-full bg-slate-950 border border-slate-800 p-4 pl-12 rounded-2xl text-sm font-bold text-white outline-none focus:border-pepsi-blue"
                      value={gpid}
                      onChange={(e) => {
                        // Numeric filter: only allow numbers
                        const val = e.target.value.replace(/\D/g, "");
                        setGpid(val);
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">
                    Role
                  </label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-pepsi-blue"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                  >
                    <option value="merchandiser">Merchandiser</option>
                    <option value="sales_rep">Sales Rep</option>
                    <option value="team_lead">Team Lead</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">
                Email
              </label>
              <input
                type="email"
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-pepsi-blue"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-widest">
                Password
              </label>
              <input
                type="password"
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-pepsi-blue"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button className="w-full bg-pepsi-blue text-white font-black py-4 rounded-2xl hover:brightness-110 transition-all">
              {isRegistering ? "CREATE ACCOUNT" : "AUTHENTICATE"}
            </button>
          </form>

          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="w-full mt-4 text-[10px] font-black text-pepsi-blue uppercase tracking-widest hover:underline"
          >
            {isRegistering ? "Back to Login" : "Register Personnel"}
          </button>
        </div>
      </div>
    </div>
  );
}
