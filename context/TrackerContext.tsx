"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

// Define the available roles in the system
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
    // Check active sessions and sets the user
    const setData = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    setData();

    // Listen for changes on auth state (logged in, signed out, etc.)
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

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("logs") // Pointing to the table with Brand/Pack_Type/GPID
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLogs(data);
    }
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
      options: {
        data: {
          full_name: fullName,
          gpid: gpid,
          role: role,
        },
      },
    });
    if (error) throw error;
    return data; // Returns the data to satisfy the Promise<any> requirement
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      window.location.href = "/"; // Force a clean redirect to login
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const addLog = async (logData: any) => {
    const { error } = await supabase
      .from("logs") // Pointing strictly to 'logs'
      .insert([
        {
          ...logData,
          user_name: profile?.full_name,
          user_email: profile?.email,
          user_role: profile?.role,
          gpid: profile?.gpid,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      alert("Submission Failed: " + error.message);
      throw error;
    }

    await fetchLogs(); // Refresh the local stream immediately
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
  if (context === undefined) {
    throw new Error("useTracker must be used within a TrackerProvider");
  }
  return context;
};
