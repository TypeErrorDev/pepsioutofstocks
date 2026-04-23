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

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      if (data) setProfile(data);
      return data;
    } catch (e) {
      console.error("Profile fetch error", e);
      return null;
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setLogs(data);
    } catch (e) {
      console.error("Logs fetch error", e);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          // Wait for both profile and logs to ensure the dashboard has data
          await Promise.all([fetchProfile(session.user.id), fetchLogs()]);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        // Guaranteed to run, preventing the "hang"
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
          await fetchLogs();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setLogs([]);
        }
        setLoading(false);
      },
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

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
    if (gpid.length > 8) throw new Error("GPID cannot exceed 8 digits.");

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
          gpid: gpid,
          role: role,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setLogs([]);
      // Hard redirect to clear any internal Next.js/Turbopack memory state
      window.location.replace("/");
    } catch (error) {
      console.error("Sign out error:", error);
      window.location.href = "/";
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