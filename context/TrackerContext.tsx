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
  product: string;
  pack_type: string;
  location: string;
  root_cause: string;
  notes: string | null;
  gpid: string | null;
  is_worked: boolean;
  is_hidden: boolean;
  user_name: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  last_verified_at: string; // Tracked for deduplication
  verification_count: number; // Tracked for inflation reduction
}

/** Fields a caller supplies when logging a new gap; the rest are set server/context-side. */
export type NewLogInput = Omit<
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
>;

export interface SalesAlert {
  id: string;
  store: string;
  alert_text: string;
  author_name: string;
  status: "open" | "closed";
  resolution_text?: string | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
  created_at: string;
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
  salesAlerts: SalesAlert[];
  addSalesAlert: (store: string, alertText: string) => Promise<void>;
  resolveSalesAlert: (
    alertId: string,
    resolutionText: string,
    close: boolean,
  ) => Promise<void>;
  addLog: (
    logData: NewLogInput,
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
  const [salesAlerts, setSalesAlerts] = useState<SalesAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
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
  }, []);

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

  const fetchSalesAlerts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("sales_alerts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setSalesAlerts((data as SalesAlert[]) || []);
    } catch (error) {
      console.error("Failed to load sales alerts:", error);
      setSalesAlerts([]);
    }
  }, []);

  // Load everything a signed-in user needs in one place.
  const loadUserData = useCallback(
    async (userId: string) => {
      await Promise.all([
        fetchProfile(userId),
        fetchLogs(),
        fetchSalesAlerts(),
      ]);
    },
    [fetchProfile, fetchLogs, fetchSalesAlerts],
  );

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
    let active = true;

    // Initial session restore. This runs outside the auth callback, so it is
    // safe to await Supabase queries here.
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!active) return;
        if (session?.user) {
          setUser(session.user);
          // Await the initial load (profile included) before `loading` clears
          // below. Otherwise `loading` flips false while the profile is still
          // in flight, and role-gated pages like Insights flash "Access Denied"
          // for a frame on refresh. Safe to await here — this is the session
          // restore, not the auth-lock callback.
          await loadUserData(session.user.id);
        }
      })
      .catch((error) => console.error("Auth init failure:", error))
      .finally(() => {
        if (active) setLoading(false);
      });

    // IMPORTANT: keep this callback synchronous and never await Supabase calls
    // inside it. supabase-js fires auth events while holding its internal auth
    // lock, and every database request resolves its token via getSession()
    // (which needs that same lock). Awaiting queries here can wedge the lock so
    // that all later inserts/selects hang forever — the exact cause of the
    // "log button spins and only a reload fixes it" bug. We defer data loading
    // out of the callback with setTimeout(0) instead.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setLogs([]);
          setSalesAlerts([]);
          return;
        }

        if (!session?.user) return;
        setUser(session.user);

        if (event === "SIGNED_IN") {
          const userId = session.user.id;
          setTimeout(() => {
            if (active) void loadUserData(userId);
          }, 0);
        }
      },
    );

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadUserData]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("realtime_sales_alerts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sales_alerts" },
        () => {
          fetchSalesAlerts();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchSalesAlerts]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error("Sign-in failure:", error);
      throw error;
    }
    // User state + data hydration are handled by the SIGNED_IN listener above.
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    gpid: string,
    role: UserRole,
  ) => {
    try {
      const username = email.split("@")[0];
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // The handle_new_user DB trigger builds the profile row from this
          // metadata. gpid in particular is UNIQUE, so the real value must be
          // sent — otherwise the trigger falls back to a constant and every
          // signup after the first collides on profiles_gpid_key.
          data: { full_name: fullName, gpid, role, username },
        },
      });
      if (error) throw error;

      const newUser = data.user;
      if (!newUser) {
        throw new Error("Unable to create user account.");
      }

      // The profile row is created server-side by the trigger from the
      // metadata above, so we do not insert it here (that would collide on the
      // primary key).
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

  const addSalesAlert = async (store: string, alertText: string) => {
    try {
      const newAlert = {
        store,
        alert_text: alertText,
        author_name: profile?.full_name || "Unknown Rep",
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("sales_alerts")
        .insert([newAlert])
        .select("*")
        .single();
      if (error) throw error;
      if (data) {
        // Prepend so it matches the newest-first ordering used by fetchSalesAlerts.
        setSalesAlerts((current) => [data as SalesAlert, ...(current || [])]);
      }
    } catch (error) {
      console.error("Failed to create sales alert:", error);
      throw error;
    }
  };

  const resolveSalesAlert = async (
    alertId: string,
    resolutionText: string,
    close: boolean,
  ) => {
    try {
      const updatePayload: Record<string, unknown> = {
        resolution_text: resolutionText || null,
      };

      if (close) {
        updatePayload.status = "closed";
        updatePayload.resolved_by = profile?.full_name || "Unknown Rep";
        updatePayload.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("sales_alerts")
        .update(updatePayload)
        .eq("id", alertId)
        .select("*")
        .single();

      if (error) throw error;
      if (data) {
        setSalesAlerts((current) =>
          (current || []).map((alert) =>
            alert.id === alertId ? (data as SalesAlert) : alert,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update sales alert:", error);
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
      setSalesAlerts([]);
    } catch (error) {
      console.error("Sign-out failure:", error);
      throw error;
    }
  };

  // --- SMART INTEGRATED LOG ENGINE (INFLATION PROTECTION) ---
  const addLog = async (
    logData: NewLogInput,
  ): Promise<{ success: boolean; duplicated: boolean }> => {
    try {
      // 1. Scan memory state for matching active unresolved item gaps
      const existingActiveGap = logs.find(
        (l) =>
          !l.is_worked &&
          !l.is_hidden &&
          l.store.toString().trim() === logData.store.toString().trim() &&
          l.product.toLowerCase().trim() ===
            logData.product.toLowerCase().trim() &&
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

      // 3. Product New Gap: Write baseline database transaction record
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : error && typeof error === "object"
            ? JSON.stringify(error, Object.getOwnPropertyNames(error))
            : String(error);
      console.error("Critical submission fault:", errorMessage);
      throw new Error(errorMessage);
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
        salesAlerts,
        loading,
        fetchLogs,
        signIn,
        signUp,
        signOut,
        addSalesAlert,
        resolveSalesAlert,
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
