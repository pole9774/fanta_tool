import Fantallenatore from "../entities/fantallenatore";
import PlayerTaken from "../entities/playerTaken";

export interface RoleQuota {
  role: string;      // ruolo mostrato nel badge ("P", "D", ... oppure "Mov" = movimento in mantra)
  taken: number;
  max: number;
  min?: number;      // solo mantra
}

export interface FantallenatoreStats {
  remaining: number;     // crediti residui
  quotas: RoleQuota[];
  slotsToFill: number;   // giocatori ancora obbligatori da acquistare
  maxBid: number;        // puntata massima per il prossimo giocatore
}

// Numero di giocatori presi da un fantallenatore in un ruolo.
// Classic: ruolo esatto. Mantra: "P" = portieri, qualsiasi altro valore = giocatori di movimento.
export function countTaken(f: Fantallenatore, playersTaken: PlayerTaken[], astaType: string, role: string): number {
  return playersTaken.filter((p) => {
    if (p.fantallenatore_id != f.id) return false;
    if (astaType == "classic") return p.role == role;
    return role == "P" ? p.role == "P" : p.role != "P";
  }).length;
}

export function getFantallenatoreStats(f: Fantallenatore, playersTaken: PlayerTaken[], astaType: string): FantallenatoreStats {
  const remaining = f.max_crediti - f.crediti_spent;

  let quotas: RoleQuota[];
  let slotsToFill: number;
  let roomLeft: number;   // giocatori che può ancora acquistare in totale

  if (astaType == "classic") {
    quotas = [
      { role: "P", taken: countTaken(f, playersTaken, astaType, "P"), max: f.classic_p },
      { role: "D", taken: countTaken(f, playersTaken, astaType, "D"), max: f.classic_d },
      { role: "C", taken: countTaken(f, playersTaken, astaType, "C"), max: f.classic_c },
      { role: "A", taken: countTaken(f, playersTaken, astaType, "A"), max: f.classic_a },
    ];
    slotsToFill = quotas.reduce((sum, q) => sum + Math.max(0, q.max - q.taken), 0);
    roomLeft = slotsToFill;
  } else {
    const por = countTaken(f, playersTaken, astaType, "P");
    const mov = countTaken(f, playersTaken, astaType, "mov");
    quotas = [
      { role: "P", taken: por, min: f.mantra_por_min, max: f.mantra_por_max },
      { role: "Mov", taken: mov, min: f.mantra_mov_min, max: f.mantra_mov_max },
    ];
    slotsToFill = Math.max(0, f.mantra_por_min - por) + Math.max(0, f.mantra_mov_min - mov);
    roomLeft = Math.max(0, f.mantra_por_max - por) + Math.max(0, f.mantra_mov_max - mov);
  }

  // Deve tenere almeno 1 credito per ogni altro giocatore obbligatorio ancora da prendere
  const maxBid = roomLeft <= 0 ? 0 : Math.max(0, remaining - Math.max(slotsToFill - 1, 0));

  return { remaining, quotas, slotsToFill, maxBid };
}

// Tooltip di una quota: "presi su max", con anche il minimo per il mantra
export function quotaTitle(q: RoleQuota): string {
  const label = q.role == "Mov" ? "Movimento" : q.role;
  return q.min != undefined ? `${label}: ${q.taken} presi (min ${q.min}, max ${q.max})` : `${label}: ${q.taken} presi su ${q.max}`;
}
