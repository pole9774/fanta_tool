// Ruoli e colori condivisi da tutta l'app (selettore ruoli, card giocatori, acquisti, form)

export const CLASSIC_ROLES = ["P", "D", "C", "A"] as const;
export const MANTRA_ROLES = ["P", "Dc", "B", "Dd", "Ds", "E", "M", "C", "T", "W", "A", "Pc"] as const;

export type RoleColor = "warning" | "success" | "primary" | "info" | "danger" | "secondary";

const ROLE_COLORS: Record<string, Record<string, RoleColor>> = {
  classic: {
    P: "warning",
    D: "success",
    C: "primary",
    A: "danger",
  },
  mantra: {
    P: "warning",
    Dc: "success",
    B: "success",
    Dd: "success",
    Ds: "success",
    E: "primary",
    M: "primary",
    C: "info",
    T: "info",
    W: "danger",
    A: "danger",
    Pc: "danger",
  },
};

export function getRoles(astaType: string): readonly string[] {
  return astaType == "classic" ? CLASSIC_ROLES : MANTRA_ROLES;
}

export function getRoleColor(astaType: string, role: string): RoleColor {
  return ROLE_COLORS[astaType]?.[role] ?? "secondary";
}

// "Dc/B" -> ["Dc", "B"]
export function splitMantraRoles(roleMantra: string): string[] {
  return roleMantra
    .split("/")
    .map((r) => r.trim())
    .filter(Boolean);
}
