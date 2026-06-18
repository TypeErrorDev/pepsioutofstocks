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

export interface ExportFilterMeta {
  status: "all" | "open" | "resolved";
  mode: "rolling" | "custom";
  timeValue?: number;
  timeUnit?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * Human-readable one-liner describing the active filters, shown in the sheet's
 * subtitle band so a downloaded file is self-documenting ("Resolved · Last 14
 * days · Store 5406").
 */
export function describeFilters(meta: ExportFilterMeta): string {
  const parts: string[] = [];
  parts.push(
    meta.status === "open"
      ? "Open gaps"
      : meta.status === "resolved"
        ? "Resolved"
        : "All logs",
  );
  if (meta.mode === "rolling" && meta.timeValue && meta.timeValue > 0) {
    parts.push(`Last ${meta.timeValue} ${meta.timeUnit ?? "days"}`);
  } else if (meta.mode === "custom" && (meta.startDate || meta.endDate)) {
    parts.push(`${meta.startDate || "start"} to ${meta.endDate || "today"}`);
  }
  if (meta.search?.trim()) parts.push(`Store ${meta.search.trim()}`);
  return parts.join("  ·  ");
}

// Brand + UI palette (ARGB) for the workbook styling.
const C = {
  brand: "FF005CB4", // Pepsi blue
  white: "FFFFFFFF",
  subtitleBg: "FFF1F5F9",
  band: "FFF8FAFC",
  text: "FF0F172A",
  subtle: "FF475569",
  gridline: "FFE2E8F0",
  resolved: "FF059669",
  open: "FFD97706",
};

/**
 * Build a styled, presentation-ready .xlsx from the given logs and download it
 * in the browser: a branded title band, a context subtitle, a colored frozen
 * header with autofilter, banded rows, borders, and color-coded status cells.
 * exceljs is imported dynamically so it only loads when an export is run.
 */
export async function downloadInsightsXlsx(
  logs: StockoutLog[],
  filename: string,
  subtitle?: string,
): Promise<void> {
  const rows = buildExportRows(logs);

  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Shelf Health";
  workbook.created = new Date();

  const colCount = EXPORT_COLUMNS.length;
  const solid = (argb: string) => ({
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb },
  });
  const thin = { style: "thin" as const, color: { argb: C.gridline } };
  const box = { top: thin, left: thin, bottom: thin, right: thin };
  const centered = new Set(["status", "streakDays"]);

  const sheet = workbook.addWorksheet("Insights", {
    views: [{ state: "frozen", ySplit: 3 }],
  });
  // Keys + widths only — headers are written manually so the title band can
  // sit above them.
  sheet.columns = EXPORT_COLUMNS.map(({ key, width }) => ({ key, width }));

  // Row 1 — branded title band
  const titleRow = sheet.addRow(["SHELF HEALTH — INSIGHTS EXPORT"]);
  sheet.mergeCells(1, 1, 1, colCount);
  titleRow.height = 30;
  titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: C.white } };
  titleRow.getCell(1).fill = solid(C.brand);
  titleRow.getCell(1).alignment = {
    vertical: "middle",
    horizontal: "left",
    indent: 1,
  };

  // Row 2 — context subtitle (filters + record count + generated time)
  const generated = formatPST(new Date().toISOString(), { withYear: true });
  const sep = "  ·  ";
  const subtitleText =
    `${subtitle ? subtitle + sep : ""}${rows.length} record` +
    `${rows.length === 1 ? "" : "s"}${sep}Generated ${generated}`;
  const subRow = sheet.addRow([subtitleText]);
  sheet.mergeCells(2, 1, 2, colCount);
  subRow.height = 18;
  subRow.getCell(1).font = { italic: true, size: 10, color: { argb: C.subtle } };
  subRow.getCell(1).fill = solid(C.subtitleBg);
  subRow.getCell(1).alignment = {
    vertical: "middle",
    horizontal: "left",
    indent: 1,
  };

  // Row 3 — column header
  const headerRow = sheet.addRow(EXPORT_COLUMNS.map((c) => c.header));
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: C.white } };
    cell.fill = solid(C.brand);
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = box;
  });

  // Data rows (from row 4): banded fill, borders, color-coded status
  rows.forEach((row, idx) => {
    const r = sheet.addRow(row);
    r.height = 18;
    const banded = idx % 2 === 1;
    EXPORT_COLUMNS.forEach((col) => {
      const cell = r.getCell(col.key);
      cell.border = box;
      cell.font = { size: 10, color: { argb: C.text } };
      cell.alignment = {
        vertical: "middle",
        horizontal: centered.has(col.key) ? "center" : "left",
        wrapText: col.key === "notes",
      };
      if (banded) cell.fill = solid(C.band);
    });
    const statusCell = r.getCell("status");
    statusCell.font = {
      size: 10,
      bold: true,
      color: { argb: row.status === "Resolved" ? C.resolved : C.open },
    };
  });

  sheet.autoFilter = {
    from: { row: 3, column: 1 },
    to: { row: 3, column: colCount },
  };

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
