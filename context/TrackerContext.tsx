"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export type UserRole =
  | "admin"
  | "team_lead"
  | "sales_rep"
  | "merchandiser"
  | "user";

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  gpid: string;
  role: UserRole;
  created_at: string;
}

export interface StockoutLog {
  id: string;
  store: string;
  brand: string;
  pack_type: string;
  location: string;
  root_cause: string;
  notes: string | null;
  is_worked: boolean;
  is_hidden: boolean;
  user_name: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  last_verified_at: string; // Tracked for deduplication
  verification_count: number; // Tracked for inflation reduction
}

interface TrackerContextType {
  user: User | null;
  profile: Profile | null;
  logs: StockoutLog[];
  loading: boolean;
  fetchLogs: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    gpid: string,
    role: UserRole,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  addLog: (
    logData: Omit<
      StockoutLog,
      | "id"
      | "is_worked"
      | "is_hidden"
      | "created_at"
      | "updated_at"
      | "user_name"
      | "updated_by"
      | "last_verified_at"
      | "verification_count"
    >,
  ) => Promise<{ success: boolean; duplicated: boolean }>;
  toggleWorkedStatus: (
    id: string,
    currentStatus: boolean,
    reason?: string,
  ) => Promise<void>;
  hideLog: (id: string, reason: string) => Promise<void>;
  supabase: typeof supabase;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<StockoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      if (data) setProfile(data as Profile);
    } catch (e) {
      console.error("Profile synchronization exception:", e);
    }
  };

  const fetchLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setLogs(data as StockoutLog[]);
    } catch (e) {
      console.error("Logs fetching exception:", e);
    }
  }, []);

  // Realtime Subscriptions
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("realtime_logs")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "logs" },
        () => {
          fetchLogs();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchLogs]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await Promise.all([fetchProfile(session.user.id), fetchLogs()]);
        }
      } catch (error) {
        console.error("Auth init failure:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          await Promise.all([fetchProfile(session.user.id), fetchLogs()]);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setLogs([]);
        }
      },
    );

    return () => authListener.subscription.unsubscribe();
  }, [fetchLogs]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.session?.user) {
        setUser(data.session.user);
        await Promise.all([fetchProfile(data.session.user.id), fetchLogs()]);
      }
    } catch (error) {
      console.error("Sign-in failure:", error);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    gpid: string,
    role: UserRole,
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      const newUser = data.user;
      if (!newUser) {
        throw new Error("Unable to create user account.");
      }

      const username = email.split("@")[0];
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: newUser.id,
          username,
          full_name: fullName,
          gpid,
          role,
          created_at: new Date().toISOString(),
        },
      ]);

      if (profileError) throw profileError;

      setUser(newUser);
      setProfile({
        id: newUser.id,
        username,
        full_name: fullName,
        gpid,
        role,
        created_at: new Date().toISOString(),
      });
      await fetchLogs();
    } catch (error) {
      console.error("Registration failure:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      setLogs([]);
    } catch (error) {
      console.error("Sign-out failure:", error);
      throw error;
    }
  };

  // --- SMART INTEGRATED LOG ENGINE (INFLATION PROTECTION) ---
  const addLog = async (logData: any) => {
    try {
      // 1. Scan memory state for matching active unresolved item gaps
      const existingActiveGap = logs.find(
        (l) =>
          !l.is_worked &&
          !l.is_hidden &&
          l.store.toString().trim() === logData.store.toString().trim() &&
          l.brand.toLowerCase().trim() === logData.brand.toLowerCase().trim() &&
          l.pack_type.toLowerCase().trim() ===
            logData.pack_type.toLowerCase().trim(),
      );

      if (existingActiveGap) {
        // 2. Intercept and update metadata values instead of pushing rows
        const appendedNotes = logData.notes
          ? `${existingActiveGap.notes || ""} [Re-verified Note: ${logData.notes}]`
          : existingActiveGap.notes;

        const { error } = await supabase
          .from("logs")
          .update({
            verification_count: (existingActiveGap.verification_count || 1) + 1,
            last_verified_at: new Date().toISOString(),
            notes: appendedNotes,
          })
          .eq("id", existingActiveGap.id);

        if (error) throw error;
        await fetchLogs();
        return { success: true, duplicated: true };
      }

      // 3. Brand New Gap: Write baseline database transaction record
      const { error } = await supabase.from("logs").insert([
        {
          ...logData,
          user_name: profile?.full_name || "Unknown Operator",
          is_worked: false,
          is_hidden: false,
          verification_count: 1,
          last_verified_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      await fetchLogs();
      return { success: true, duplicated: false };
    } catch (error) {
      console.error("Critical submission fault:", error);
      throw error;
    }
  };

  const toggleWorkedStatus = async (
    id: string,
    currentStatus: boolean,
    reason?: string,
  ) => {
    try {
      const targetLog = logs.find((l) => l.id === id);
      let updatedNotes = targetLog?.notes || "";

      if (!currentStatus && reason && reason.trim() !== "") {
        updatedNotes = updatedNotes
          ? `${updatedNotes} [Resolution Note: ${reason.trim()}]`
          : `[Resolution Note: ${reason.trim()}]`;
      }

      const { error } = await supabase
        .from("logs")
        .update({
          is_worked: !currentStatus,
          notes: updatedNotes,
          updated_by: profile?.full_name || "System Validator",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      await fetchLogs();
    } catch (error) {
      console.error("Failed to alter resolution state map:", error);
    }
  };

  const hideLog = async (id: string, reason: string) => {
    try {
      const { error } = await supabase
        .from("logs")
        .update({
          is_hidden: true,
          notes: reason
            ? `${logs.find((l) => l.id === id)?.notes || ""} [Archive Reason: ${reason}]`
            : logs.find((l) => l.id === id)?.notes,
          updated_by: profile?.full_name || "System Archivist",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      await fetchLogs();
    } catch (error) {
      console.error("Failed to archive entry:", error);
    }
  };

  return (
    <TrackerContext.Provider
      value={{
        user,
        profile,
        logs,
        loading,
        fetchLogs,
        signIn,
        signUp,
        signOut,
        addLog,
        toggleWorkedStatus,
        hideLog,
        supabase,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context) throw new Error("useTracker isolated outside Provider.");
  return context;
};
