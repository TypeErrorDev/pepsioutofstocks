"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "team_lead" | "sales_rep" | "merchandiser";

interface Profile {
  id: string;
  full_name: string;
  gpid: string;
  role: UserRole;
  email: string;
}

interface TrackerContextType {
  user: User | null;
  profile: Profile | null;
  logs: any[];
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (
    email: string,
    pass: string,
    fullName: string,
    gpid: string,
    role: UserRole,
  ) => Promise<any>;
  signOut: () => Promise<void>;
  addLog: (logData: any) => Promise<void>;
  fetchLogs: () => Promise<void>;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setData = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
        await fetchLogs();
      }
      setLoading(false);
    };

    setData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          await fetchProfile(session.user.id);
          await fetchLogs();
        } else {
          setUser(null);
          setProfile(null);
          setLogs([]);
        }
        setLoading(false);
      },
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data);
  };

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("logs")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setLogs(data);
  };

  const signIn = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
  };

  const signUp = async (
    email: string,
    pass: string,
    fullName: string,
    gpid: string,
    role: UserRole,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { full_name: fullName, gpid: gpid, role: role } },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Explicitly clear state to trigger AuthGate immediately
      setUser(null);
      setProfile(null);
      setLogs([]);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const addLog = async (logData: any) => {
    const { error } = await supabase.from("logs").insert([
      {
        ...logData,
        user_name: profile?.full_name,
        gpid: profile?.gpid,
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) throw error;
    await fetchLogs();
  };

  return (
    <TrackerContext.Provider
      value={{
        user,
        profile,
        logs,
        loading,
        signIn,
        signUp,
        signOut,
        addLog,
        fetchLogs,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context)
    throw new Error("useTracker must be used within a TrackerProvider");
  return context;
};
