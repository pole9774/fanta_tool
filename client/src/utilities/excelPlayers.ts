// Conversione delle righe di un file Excel "lista calciatori" nei giocatori da importare in un'asta.
// Formato atteso: riga 1 = intestazione (ignorata); colonne B nome, C fuori lista ("*" => riga ignorata),
// D squadra, F ruolo classic, G ruolo mantra (ruoli separati da "/").

export interface ImportedPlayer {
  name: string;
  team: string;
  role_mantra: string; // "-" per le aste classic
  roles: string[];     // un elemento per riga da creare in Players (classic: 1; mantra: 1-3)
}

export interface ExcelRowError {
  row: number; // numero di riga nel file Excel (1-based)
  reason: string;
}

export interface ParsedPlayers {
  players: ImportedPlayer[];
  outOfList: number;
  errors: ExcelRowError[];
}

const COL_NAME = 1;       // B
const COL_OUT_OF_LIST = 2; // C
const COL_TEAM = 3;       // D
const COL_ROLE = 5;       // F
const COL_ROLE_MANTRA = 6; // G

const CLASSIC_ROLES = ["P", "D", "C", "A"];
const MANTRA_ROLES = ["P", "Dc", "B", "Dd", "Ds", "E", "M", "C", "T", "W", "A", "Pc"];

// Nomi dei ruoli mantra nel file che nell'app hanno un altro nome
const MANTRA_ROLE_ALIASES: Record<string, string> = { Por: "P" };

const cell = (row: unknown[], index: number): string => {
  const value = row[index];
  return value == null ? "" : String(value).trim();
};

export function parsePlayersRows(rows: unknown[][], astaType: string): ParsedPlayers {
  const players: ImportedPlayer[] = [];
  const errors: ExcelRowError[] = [];
  const seenNames = new Set<string>();
  let outOfList = 0;

  rows.slice(1).forEach((row, i) => {
    const excelRow = i + 2;

    if (cell(row, COL_OUT_OF_LIST) == "*") {
      outOfList++;
      return;
    }

    const name = cell(row, COL_NAME);
    const team = cell(row, COL_TEAM);

    // righe completamente vuote (es. in fondo al foglio): ignorate senza errore
    if (row.every((value) => value == null || String(value).trim() == "")) {
      return;
    }

    if (name == "") {
      errors.push({ row: excelRow, reason: "nome mancante" });
      return;
    }
    if (team == "") {
      errors.push({ row: excelRow, reason: `${name}: squadra mancante` });
      return;
    }
    if (seenNames.has(name)) {
      errors.push({ row: excelRow, reason: `${name}: nome duplicato nel file` });
      return;
    }

    let roles: string[];
    let roleMantra: string;

    if (astaType == "classic") {
      const role = cell(row, COL_ROLE);
      if (!CLASSIC_ROLES.includes(role)) {
        errors.push({ row: excelRow, reason: `${name}: ruolo "${role}" non valido` });
        return;
      }
      roles = [role];
      roleMantra = "-";
    } else {
      roles = cell(row, COL_ROLE_MANTRA)
        .split("/")
        .map((r) => r.trim())
        .filter(Boolean)
        .map((r) => MANTRA_ROLE_ALIASES[r] ?? r);

      const invalid = roles.filter((r) => !MANTRA_ROLES.includes(r));
      if (roles.length == 0 || roles.length > 3 || invalid.length > 0 || new Set(roles).size != roles.length) {
        errors.push({ row: excelRow, reason: `${name}: ruolo mantra "${cell(row, COL_ROLE_MANTRA)}" non valido` });
        return;
      }
      roleMantra = roles.join("/");
    }

    seenNames.add(name);
    players.push({ name, team, role_mantra: roleMantra, roles });
  });

  return { players, outOfList, errors };
}
