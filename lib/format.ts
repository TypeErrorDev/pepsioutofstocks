/**
 * Format an ISO timestamp in US Pacific time.
 * Shared by the dashboard log table and the insights page so the two views
 * stay in sync instead of each carrying their own copy.
 */
export function formatPST(
  dateString?: string | null,
  options?: { withYear?: boolean },
): string {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    ...(options?.withYear ? { year: "numeric" } : {}),
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
