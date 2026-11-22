// Conversione delle righe del file Excel "Statistiche Fantacalcio" (primo foglio, "Tutti") nelle statistiche da
// scrivere nelle note. Formato atteso: righe 1-2 = intestazione (ignorate); colonne D nome, F partite a voto (pv),
// G media voto (mv), H fantamedia (fm), I gol fatti (g), J gol subiti (gs), O assist (a).

import type { ExcelRowError } from "./excelPlayers";

// Stagioni selezionabili (devono coincidere con quelle accettate dal server)
export const STATS_SEASONS = ["2026-27", "2025-26", "2024-25"] as const;

export interface PlayerStats {
  name: string;
  pv: number;
  mv: number;
  fm: number;
  g: number;
  gs: number;
  a: number;
}

export interface ParsedStats {
  stats: PlayerStats[];
  errors: ExcelRowError[];
}

const HEADER_ROWS = 2;
const COL_NAME = 3; // D
const NUMBER_COLUMNS: { key: Exclude<keyof PlayerStats, "name">, index: number, integer: boolean }[] = [
  { key: "pv", index: 5, integer: true },   // F
  { key: "mv", index: 6, integer: false },  // G
  { key: "fm", index: 7, integer: false },  // H
  { key: "g", index: 8, integer: true },    // I
  { key: "gs", index: 9, integer: true },   // J
  { key: "a", index: 14, integer: true },   // O
];

// Numero da una cella: accetta numeri o testo (anche con la virgola decimale). null se non valido
const toNumber = (value: unknown): number | null => {
  if (typeof value == "number") return Number.isFinite(value) ? value : null;
  if (value == null) return null;
  const text = String(value).trim().replace(",", ".");
  if (text == "") return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
};

export function parseStatsRows(rows: unknown[][]): ParsedStats {
  const stats: PlayerStats[] = [];
  const errors: ExcelRowError[] = [];
  const seenNames = new Set<string>();

  rows.slice(HEADER_ROWS).forEach((row, i) => {
    const excelRow = i + HEADER_ROWS + 1;

    // righe completamente vuote (es. in fondo al foglio): ignorate senza errore
    if (row.every((value) => value == null || String(value).trim() == "")) {
      return;
    }

    const name = row[COL_NAME] == null ? "" : String(row[COL_NAME]).trim();
    if (name == "") {
      errors.push({ row: excelRow, reason: "nome mancante" });
      return;
    }
    if (seenNames.has(name)) {
      errors.push({ row: excelRow, reason: `${name}: nome duplicato nel file` });
      return;
    }

    const parsed: PlayerStats = { name, pv: 0, mv: 0, fm: 0, g: 0, gs: 0, a: 0 };
    for (const column of NUMBER_COLUMNS) {
      const n = toNumber(row[column.index]);
      if (n == null || n < 0 || (column.integer && !Number.isInteger(n))) {
        errors.push({ row: excelRow, reason: `${name}: valore "${row[column.index] ?? ""}" non valido (${column.key})` });
        return;
      }
      parsed[column.key] = n;
    }

    seenNames.add(name);
    stats.push(parsed);
  });

  return { stats, errors };
}
