/**
 * Excel export for the insights logs.
 *
 * `buildExportRows` is pure and unit-tested. `downloadInsightsXlsx` is
 * browser-only: it lazy-imports exceljs (kept out of the main bundle) and
 * triggers a file download. Read-only — it never writes to the database.
 */
import type { StockoutLog } from "@/context/TrackerContext";
import { formatPST } from "@/lib/format";

export interface ExportColumn {
  header: string;
  key: string;
  width: number;
}

/** Column order, headers, and widths shared by the row builder and the sheet. */
export const EXPORT_COLUMNS: ExportColumn[] = [
  { header: "Store", key: "store", width: 26 },
  { header: "Product", key: "product", width: 20 },
  { header: "Pack Type", key: "packType", width: 12 },
  { header: "Location", key: "location", width: 14 },
  { header: "Root Cause", key: "rootCause", width: 18 },
  { header: "Status", key: "status", width: 11 },
  { header: "Streak (days)", key: "streakDays", width: 13 },
  { header: "Logged By", key: "loggedBy", width: 20 },
  { header: "First Logged (PST)", key: "firstLogged", width: 22 },
  { header: "Last Verified (PST)", key: "lastVerified", width: 22 },
  { header: "Resolved At (PST)", key: "resolvedAt", width: 22 },
  { header: "Notes", key: "notes", width: 40 },
];

export interface ExportRow {
  store: string;
  product: string;
  packType: string;
  location: string;
  rootCause: string;
  status: "Open" | "Resolved";
  streakDays: number;
  loggedBy: string;
  firstLogged: string;
  lastVerified: string;
  resolvedAt: string;
  notes: string;
}

/**
 * Flatten logs into export rows. Resolution time uses updated_at and is only
 * filled for worked rows (see analytics: updated_at is the resolution stamp for
 * resolved gaps). One row per log; column order follows EXPORT_COLUMNS.
 */
export function buildExportRows(logs: StockoutLog[]): ExportRow[] {
  return logs.map((log) => ({
    store: log.store ?? "",
    product: log.product ?? "",
    packType: log.pack_type ?? "",
    location: log.location ?? "",
    rootCause: log.root_cause ?? "",
    status: log.is_worked ? "Resolved" : "Open",
    streakDays: log.verification_count || 1,
    loggedBy: log.user_name ?? "",
    firstLogged: formatPST(log.created_at, { withYear: true }),
    lastVerified: formatPST(log.last_verified_at || log.created_at, {
      withYear: true,
    }),
    resolvedAt:
      log.is_worked && log.updated_at
        ? formatPST(log.updated_at, { withYear: true })
        : "",
    notes: log.notes ?? "",
  }));
}

/**
 * Build a styled .xlsx from the given logs and download it in the browser.
 * exceljs is imported dynamically so it only loads when an export is run.
 */
export async function downloadInsightsXlsx(
  logs: StockoutLog[],
  filename: string,
): Promise<void> {
  const rows = buildExportRows(logs);

  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Shelf Health";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Insights", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = EXPORT_COLUMNS.map(({ header, key, width }) => ({
    header,
    key,
    width,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle" };

  for (const row of rows) sheet.addRow(row);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
