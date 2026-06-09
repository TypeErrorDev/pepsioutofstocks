import type { Profile, UserRole } from "@/context/TrackerContext";

/**
 * Roles allowed to view insights, broadcast/resolve sales alerts, and see
 * every store's logs. Centralised here so the rule lives in one place instead
 * of being re-typed as an inline array in every component.
 */
export const MANAGEMENT_ROLES: readonly UserRole[] = [
  "admin",
  "team_lead",
  "sales_rep",
];

export function isManagement(profile: Profile | null | undefined): boolean {
  return !!profile && MANAGEMENT_ROLES.includes(profile.role);
}
